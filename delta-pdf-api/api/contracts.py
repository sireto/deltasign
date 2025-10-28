from typing import Union

from fastapi import APIRouter, Depends, UploadFile, File
from pony.orm import db_session

import services.file_service
import util
from api.depends import get_logged_user
from api.exceptions import BadRequest, UnauthorizedError
from db import User, Document, Contract
from model.annotation import ContractPatchRequest
from services import document_service, contract_service
from services.contract_service import ContractCreationRequest
from services.contract_service import validate_contract
from services.file_service import save_file
from db import Contract

contracts_api = APIRouter()
"""
GET     /contracts
GET     /contracts/:uuid
POST    /contracts 
DELETE  /contracts/:uuid
POST    /contracts/:uuid/sign
"""


async def get_document(doc_uuid: str):
    doc = document_service.get_document_by_uuid(doc_uuid)
    if not doc:
        raise BadRequest(f"Document[{doc_uuid}] does not exist")
    return doc


@contracts_api.get("/contracts", tags=["Contracts API"])
async def get_contracts(document: Document = Depends(get_document), user: User = Depends(get_logged_user)):
    # Check if user has rights to get contracts for document
    if document.user.id != user.id:
        raise UnauthorizedError("You do not have permission to create contract on the document.")

    contracts = contract_service.get_contracts(document)
    with db_session:
        return [contract.json() for contract in contracts]


def get_contract(uuid: str):
    with db_session:
        contract = contract_service.get_contract_by_uuid(uuid)
        if contract:
            return contract
        raise BadRequest(f"Contract[{uuid}] does not exist.")


@contracts_api.get("/contracts/{uuid}", tags=["Contracts API"])
async def get_contract_by_uuid(contract: Contract = Depends(get_contract), user: User = Depends(get_logged_user)):
    with db_session:
        if not contract_service.has_contract_rights(contract, user):
            raise BadRequest("Insufficient permissions to read the contract")
        return contract.json()


@contracts_api.post("/contracts", tags=["Contracts API"])
async def create_new_contract(contract_request: ContractCreationRequest, user: User = Depends(get_logged_user)):
    with db_session:
        contract = contract_service.create_new_contract(contract_request, user)
        return contract.json()


@contracts_api.patch("/contracts/{uuid}", tags=["Contracts API"])
async def patch_contract_with_uuid(uuid: str, contract_request: ContractPatchRequest,
                                   user: User = Depends(get_logged_user)):
    with db_session:
        contract = contract_service.patch_contract(uuid, contract_request, user)
        return contract.json()


@contracts_api.delete("/contracts/{uuid}", tags=["Contracts API"])
async def delete_contract(uuid: str, user: User = Depends(get_logged_user)):
    with db_session:
        contract = contract_service.get_contract_by_uuid(uuid)
        if not contract or contract.document.user.id != user.id:
            raise BadRequest("Contract does not exist or insufficient permission.")

        contract_service.delete_contract(uuid, user)


@contracts_api.post("/contracts/{uuid}/sign", tags=["Contracts API"])
async def sign_contract(file: UploadFile = File(...),
                        contract: Contract = Depends(get_contract),
                        user: User = Depends(get_logged_user)):
    if not contract_service.has_contract_rights(contract, user):
        raise BadRequest("Insufficient permissions to read the contract")

    return contract_service.sign_contract(contract, user, file.file.read())


@contracts_api.post("/contracts/verify", tags=["Contracts API"])
async def verify_contract(file: UploadFile = File(...),
                          user: User = Depends(get_logged_user)):
    file_path = save_file(file)

    return validate_contract(user, file_path)
