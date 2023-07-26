import logging
import os
from pathlib import Path
from threading import Thread, Lock

from fastapi import UploadFile
from pdf_annotate import Location
from pony.orm import ObjectNotFound, count

from pony.orm import db_session, select

import util
from api.exceptions import UnauthorizedError, BadRequest
from db import Document, User, Contract, SignRequest, SignatureAnnotation
from model.annotation import ContractCreationRequest, ContractPatchRequest
from services import document_service, user_service, email_service
from services.email_service import EmailService
from services.s3 import s3_service

from services.cardano_service import cardano_service

from services.pdf_signer import pdf_signer
from services.file_service import delete_file, check_file, save_file

logger = logging.getLogger(__name__)

lock = Lock()


@db_session
def create_new_contract(contract_request: ContractCreationRequest, user: User):
    document = document_service.get_document_by_uuid(contract_request.document_uuid)
    if not document:
        raise BadRequest(f"Document[{contract_request.document_uuid}] does not exist")

    # Check if the user has rights to create contract
    if document.user.id != user.id:
        raise UnauthorizedError("You do not have permission to create contract on the document.")

    contract = Contract.create(document, contract_request.name, contract_request.message)

    for signer_email in contract_request.signers:
        signer_user = user_service.get_user_by_email(signer_email)
        if not signer_user:
            signer_user = user_service.create_new_account(signer_email)
        contract.create_sign_request(user, signer_user)

    for annotation in contract_request.annotations:
        contract.create_annotation(annotation)

    # Email the signers
    try:
        email_service = EmailService()
        sender = User[user.id].email
        contract_name = document.filename
        contract_message = contract_request.message or "Please review the contract and sign"
        for receiver in contract_request.signers:
            email_service.email_contract(sender, receiver, contract_name, contract_message)
    except Exception as e:
        print(f"Failed to email the contract code to {receiver}", e)

    # copy original final under the name filehash_contractUuid.pdf
    s3_url = document.s3_url
    source_key = s3_service.get_object_key_from_url(s3_url)
    contract_key = source_key.replace(".pdf",f"_{contract.uuid}.pdf")
    s3_service.copy_file_in_s3(source_key, contract_key)

    contract.signed_doc_url = s3_url.replace(source_key, contract_key)
    return Contract.get(uuid=contract.uuid)


@db_session
def get_contracts(document: Document):
    contracts = select(d for d in Contract if d.document.id == document.id)[:]
    return contracts


@db_session
def get_contract_by_uuid(uuid):
    try:
        return Contract.get(uuid=uuid)
    except ObjectNotFound:
        return None


@db_session
def get_contract_by_hash(hash):
    try:
        return Contract.get(signature_hash=hash)
    except ObjectNotFound:
        return None


@db_session
def delete_contract(uuid, user):
    contract = get_contract_by_uuid(uuid)
    if contract.document.user.id == user.id:
        contract.delete()
        return
    raise UnauthorizedError("You do not have permission to delete the document.")


@db_session
def get_user_contracts(user, sent: bool = True, received: bool = False):
    contracts = []
    try:
        if sent and received:
            contracts = select(sr.contract for sr in SignRequest if sr.signer == user or sr.requester == user)[:]
        elif sent:
            contracts = select(sr.contract for sr in SignRequest if sr.requester == user)[:]
        elif received:
            contracts = select(sr.contract for sr in SignRequest if sr.signer == user)[:]
    except Exception as ex:
        logger.exception(ex)
    return contracts


@db_session
def get_sign_request(contract: Contract, user: User):
    sign_request = select(sr for sr in SignRequest
                          if sr.contract == contract
                          and sr.signer == user
                          or sr.requester == user)[:]
    if sign_request:
        return sign_request[0]
    return None


@db_session
def validate_contract(user: User, file_path: str):
    hash = ""
    with open(file_path, 'rb') as docs:
        hash = util.get_hash(docs.read())
    contract: Contract = get_contract_by_hash(hash)
    if not contract:
        raise Exception("Given file is not registered in our platform.")

    metadata = cardano_service.get_contract_validation_metadata(contract.blockchain_tx_hash)

    if not metadata:
        raise Exception(f"Metadata not found for txn hash {contract.blockchain_tx_hash}")
    # check if the document hash matches
    if metadata["hashes"]["signed_document_hash"][0] == hash:
        msg = pdf_signer.validate_signed_pdf(file_path, metadata["hashes"])
        # delete the file
        delete_file(file_path)
        return msg
    else:
        print(f"Provided file hash {hash} does not match contract hash.")


@db_session
def has_contract_rights(contract: Contract, user: User):
    if get_sign_request(contract, user):
        return True
    return False


@db_session
def sign_contract(contract: Contract, user: User, file: bytes):
    sign_request = get_sign_request(contract, user)
    if not sign_request:
        raise BadRequest("Contract signing request does not exist.")
    thread = Thread(target=sign_and_upload_to_s3, args=(contract, user, file))
    thread.start()

    return Contract.get(uuid=contract.uuid).json()

@db_session
def patch_contract(uuid: str, patch_request: ContractPatchRequest, user: User):
    contract = Contract.get(uuid=uuid)
    if not contract.documet:
        raise BadRequest(f"The document of contract {contract.id} does not exist.")

    if contract.document.user.id != user.id:
        raise UnauthorizedError("You do not have permission to patch this document.")

    contract.name = patch_request.name
    return Contract.get(uuid=uuid)


def sign_and_upload_to_s3(contract: Contract, user: User, file: bytes):
    with db_session:
        document_s3_url = ""
        for annotation in Contract[contract.id].annotations:
            print(f"annotation: {annotation.json()} {annotation.signed}")
            if not os.path.exists('./data/s3'):
                os.makedirs('./data/s3',mode=0o777)
                  
            if (not annotation.signed) and annotation.signer == user.email:
               
                document_s3_url = create_pdf_signature(annotation, contract, file)
                s3_url = s3_service.save_file(user.uuid, file, "signature")
                # save file hash to annotations
                hash = util.get_hash(file)
                sig_annotation = SignatureAnnotation[annotation.id]
                sig_annotation.signature_hash = hash
                sig_annotation.s3_url = s3_url
                sig_annotation.signed = True

            # TODO refactor this print statement as it will print even if the email is present as signer
            else:
                print(f"Annotation signer {annotation.signer} does not match current user {user.email}")

        contract_db = Contract[contract.id]
        contract_db.signed_number = contract_db.signed_number + 1
        contract_db.signed_doc_url = document_s3_url

        if not contract.signed_by_all and _check_if_all_signer_have_signed(Contract[contract.id].annotations):
            contract_db.signed_by_all = True
            contract_db.status = "SIGNED"


def _check_if_all_signer_have_signed(annotations):
    # flag to check if all the users have signed the file
    is_signed_by_all = True
    for annotation in annotations:
        if not annotation.signed:
            is_signed_by_all = False
    return is_signed_by_all


def _annotation_to_location(annotation):
    return Location(
        x1=annotation.x1,
        y1=annotation.y1,
        x2=annotation.x2,
        y2=annotation.y2,
        page=annotation.page
    )


def _delete_residual_files_after_signing(file_path):
    delete_file(file_path)

    # check and delete original contract document
    original_file = file_path.replace("_signed.pdf", ".pdf")
    delete_file(original_file)
    print(f"{file_path} deleted.")


@db_session
def sign_and_upload(pdf_file, signature_file, contract, annotation):
    signed_file = pdf_signer.writeImageBasedStamp(pdf_file, signature_file, annotation)
    s3_service.upload_file(signed_file, contract.signed_doc_url)
    # # get count of remaining signers
    # remaining_signers = select(s for s in SignatureAnnotation if s.contract == contract and s.signed == 0)[:]
    # if remaining_signers.__len__() <= 1:
    #     document = Document.get(id=contract.document.id)
    #     contract_db = Contract[contract.id]
    #     transaction_id, document_hash = cardano_service.post_transaction_with_document_validation_info(
    #         signed_file,
    #         document.file_hash,
    #         document.user.uuid
    #     )
    #     contract_db.blockchain_tx_hash = transaction_id
    #     contract_db.signature_hash = document_hash

    # delete files
    _delete_residual_files_after_signing(signed_file)


def create_pdf_signature(annotation, contract, file):
    pdf_file = s3_service.get_file_from_s3_url(contract.signed_doc_url)
    print(f"{contract.signed_doc_url}")
    sign_and_upload(pdf_file, file, contract, annotation)
    return contract.signed_doc_url
