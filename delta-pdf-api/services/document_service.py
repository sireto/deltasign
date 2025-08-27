from fastapi import UploadFile
from pony.orm import db_session, select

import util
from api.exceptions import UnauthorizedError, BadRequest
from db import Document, User
from services.pdf_service import PdfService
from services.s3 import s3_service


@db_session
def save_new_document(file: UploadFile, user: User, public=False):
    file_content = file.file.read()
    file_hash = util.get_hash(file_content)
    if get_documents_by_hash(user, file_hash):
        raise BadRequest("Document already exists")

    s3_url = s3_service.save_file(user.uuid, file_content, "pdf", public=public)
    properties = PdfService.get_pdf_properties(file_content)
    return Document.create(file.filename, file_hash, s3_url, user, properties)


@db_session
def get_documents(user: User):
    documents = select(d for d in Document if d.user == user)[:]
    return documents


@db_session
def get_documents_by_hash(user: User, file_hash):
    return Document.get(user=User[user.id], file_hash=file_hash)


@db_session
def get_document_by_uuid(uuid) -> Document:
    return Document.get(uuid=uuid)


@db_session
def delete_document(uuid, user):
    document = get_document_by_uuid(uuid)
    if document.user.id != user.id:
        raise UnauthorizedError("You do not have permission to delete the document.")
    if len(document.contracts) == 0:
        document.delete()
    else:
        raise BadRequest("There are Contracts that rely on this Document. You cannot delete this!")


@db_session
def patch_document(uuid, patch_request, user):
    document = get_document_by_uuid(uuid)
    if document.user.id != user.id:
        raise UnauthorizedError("You do not have permission to change document name of the document.")
    patch_file_name = _add_extension_if_not_present(patch_request.name)
    document.filename = patch_file_name

    return get_document_by_uuid(uuid).json()


def _add_extension_if_not_present(file_name: str) -> str:
    if file_name.__contains__(".pdf"):
        return file_name
    return file_name + ".pdf"
