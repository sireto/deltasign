from fastapi import APIRouter, UploadFile, File, Depends
from pony.orm import db_session

from api.depends import get_logged_user
from api.exceptions import BadRequest
from db import User
from model.document import DocumentPatchRequest
from services import document_service

doc_api = APIRouter()
"""
GET     /docs
GET     /docs/:uuid
POST    /docs 
DELETE  /docs/:uuid
"""


@doc_api.get("/documents", tags=["Doc API"])
async def get_docs(user: User = Depends(get_logged_user)):
    docs = document_service.get_documents(user)
    with db_session:
        return [doc.json() for doc in docs]


@doc_api.get("/documents/{uuid}", tags=["Doc API"])
async def get_doc_by_uuid(uuid: str, user: User = Depends(get_logged_user)):
    doc = document_service.get_document_by_uuid(uuid)
    if doc:
        return doc.json()
    raise BadRequest("Document does not exist.")


@doc_api.post("/documents", tags=["Doc API"])
async def post_doc(file: UploadFile = File(...), user: User = Depends(get_logged_user)):
    with db_session:
        doc = document_service.save_new_document(file, user, public=True)
        return doc.json()


@doc_api.delete("/documents/{uuid}", tags=["Doc API"])
async def delete_doc(uuid: str, user: User = Depends(get_logged_user)):
    with db_session:
        doc = document_service.get_document_by_uuid(uuid)
        if not doc:
            raise BadRequest("Document does not exist")
        document_service.delete_document(uuid, user)


@doc_api.patch("/documents/{uuid}", tags=["Doc API"])
async def patch_doc(uuid: str, patch_request: DocumentPatchRequest, user: User = Depends(get_logged_user)):
    with db_session:
        doc = document_service.get_document_by_uuid(uuid)
        if not doc:
            raise BadRequest("Document does not exist")
        return document_service.patch_document(uuid, patch_request, user)
