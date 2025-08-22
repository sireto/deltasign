import json
import uuid
from datetime import datetime
from typing import Dict

from pony import orm
from pony.orm import PrimaryKey, db_session

from env import DB_PROVIDER, DB_NAME, DB_HOST, DB_USER, DB_PASSWORD, DEPLOYMENT, DB_DIR
from model.annotation import Annotation

database = orm.Database()


class User(database.Entity):
    _table_ = 'users'

    id = PrimaryKey(int, auto=True)

    uuid = orm.Required(str, unique=True)
    email = orm.Required(str, unique=True)

    full_name = orm.Optional(str)

    api_key = orm.Required(str, unique=True)
    jwt_seed = orm.Required(str)
    otp_seed = orm.Required(str)

    generated_date = orm.Required(datetime)
    registered_date = orm.Optional(datetime)

    documents = orm.Set("Document", reverse="user")
    sent_sign_requests = orm.Set("SignRequest", reverse="requester")
    received_sign_requests = orm.Set("SignRequest", reverse="signer")

    @db_session
    def json(self, api_key=False):
        output_dict = {
            "uuid": self.uuid,
            "email": self.email,
            "full_name": self.full_name
        }
        if api_key:
            output_dict['api_key'] = self.api_key
        return output_dict


class Document(database.Entity):
    _table_ = 'docs'

    id = PrimaryKey(int, auto=True)

    uuid = orm.Required(str, unique=True)
    filename = orm.Required(str)
    file_hash = orm.Required(str)
    s3_url = orm.Required(str)
    properties = orm.Optional(str)

    created_date = orm.Required(datetime)
    updated_date = orm.Required(datetime)

    user = orm.Required("User", reverse="documents")
    contracts = orm.Set("Contract", reverse="document")

    @classmethod
    def create(cls, filename, file_hash, s3_url, user: User, properties: Dict):
        _uuid = str(uuid.uuid4())
        _created_date = datetime.now()
        _updated_date = datetime.now()
        return Document(uuid=_uuid,
                        filename=filename,
                        file_hash=file_hash,
                        s3_url=s3_url,
                        properties=json.dumps(properties),
                        user=User[user.id],
                        created_date=_created_date,
                        updated_date=_updated_date)

    @db_session
    def json(self):
        return {
            "uuid": self.uuid,
            "filename": self.filename,
            "file_hash": self.file_hash,
            "s3_url": self.s3_url,
            "properties": self.properties if self.properties else "{}",
            "created_date": self.created_date,
            "updated_date": self.updated_date,
            "owner_uuid": User[self.user.id].uuid
        }


class Contract(database.Entity):
    _table_ = 'contracts'

    name = orm.Optional(str, default='')
    id = PrimaryKey(int, auto=True)
    uuid = orm.Required(str, unique=True)
    message = orm.Optional(str, default='')

    signed_doc_url = orm.Optional(str)
    status = orm.Required(str)

    signature_hash = orm.Optional(str)
    blockchain_tx_hash = orm.Optional(str)

    created_date = orm.Required(datetime)
    updated_date = orm.Optional(datetime)

    document = orm.Optional("Document", reverse="contracts",  cascade_delete=False)
    sign_requests = orm.Set("SignRequest", reverse="contract")
    annotations = orm.Set("SignatureAnnotation", reverse="contract")

    signed_by_all = orm.Optional(bool, sql_default=0)
    signed_number = orm.Required(int, sql_default=0)

    @classmethod
    def create(cls, document, name, message=''):
        # if contract name is not given then use document name for the contract name
        contract_name = document.filename
        if name:
            contract_name = name

        return Contract(uuid=str(uuid.uuid4()),
                        name=contract_name,
                        document=document,
                        message=message,
                        status="NEW",
                        signed_doc_url=document.s3_url,
                        created_date=datetime.now(),
                        signed_number=0)

    def create_sign_request(self, requester: User, signer: User):
        self.sign_requests.add(SignRequest.create(self, requester, signer))
        self.flush()

    def create_annotation(self, annotation: Annotation):
        self.annotations.add(SignatureAnnotation.create(self, annotation))
        self.flush()

    def get_sign_requests_json(self):
        sign_requests = []
        for sign_request in Contract[self.id].sign_requests:
            sign_request_ = SignRequest[sign_request.id]
            sign_requests.append(User[sign_request_.user.id].email)
        return sign_requests

    def json(self):
        with db_session:
            sign_requests = Contract[self.id].sign_requests
            annotations = Contract[self.id].annotations
            return {
                "uuid": self.uuid,
                "name": self.name,
                "document": Document[self.document.id].json(),
                "signed_doc_url": self.signed_doc_url,
                "message": self.message,
                "created_date": self.created_date,
                "status": self.status,
                "signers": [sign_request.signer.email for sign_request in sign_requests],
                "annotations": [annotation.json() for annotation in annotations],
                "signed_number": self.signed_number,
                "blockchain_tx_hash" : self.blockchain_tx_hash
            }


class SignatureAnnotation(database.Entity):
    _table_ = 'contract_annotations'

    id = PrimaryKey(int, auto=True)
    x1 = orm.Required(float)
    y1 = orm.Required(float)
    x2 = orm.Required(float)
    y2 = orm.Required(float)
    signer = orm.Required(str)
    page = orm.Required(int)
    contract = orm.Required("Contract", reverse="annotations")
    color = orm.Required(str)
    signature_hash = orm.Optional(str)
    s3_url = orm.Optional(str)
    signed = orm.Optional(bool, sql_default=0)

    @classmethod
    def create(cls, contract: Contract, annotation_model: Annotation):
        return SignatureAnnotation(
            contract=contract,
            x1=annotation_model.x1,
            x2=annotation_model.x2,
            y1=annotation_model.y1,
            y2=annotation_model.y2,
            signer=annotation_model.signer,
            page=annotation_model.page,
            color=annotation_model.color
        )

    def json(self):
        json_response = {
            "x1": self.x1,
            "y1": self.y1,
            "x2": self.x2,
            "y2": self.y2,
            "signer": self.signer,
            "page": self.page,
            "color": self.color,
            "signed": self.signed
        }
        if self.signature_hash:
            json_response["signature_hash"] = self.signature_hash
        if self.s3_url:
            json_response["s3_url"] = self.s3_url
        return json_response


class SignRequest(database.Entity):
    _table_ = 'sign_requests'

    id = PrimaryKey(int, auto=True)
    uuid = orm.Required(str, unique=True)

    status = orm.Required(str)

    request_date = orm.Required(datetime)
    signed_date = orm.Optional(datetime)

    hand_sig_hash = orm.Optional(str)
    hand_sig_url = orm.Optional(str)
    selfie_sig_hash = orm.Optional(str)
    selfie_sig_url = orm.Optional(str)

    signed_doc_url = orm.Optional(str)
    digital_signature = orm.Optional(str)
    signature_hash = orm.Optional(str)
    blockchain_tx_hash = orm.Optional(str)

    requester = orm.Required("User", reverse="sent_sign_requests")
    signer = orm.Required("User", reverse="received_sign_requests")
    contract = orm.Required("Contract", reverse="sign_requests")

    @classmethod
    def create(cls, contract: Contract, requester: User, signer: User):
        sign_request = SignRequest(uuid=str(uuid.uuid4()),
                                   status="UNSIGNED",
                                   request_date=datetime.now(),
                                   contract=contract,
                                   signer=User[signer.id],
                                   requester=User[requester.id])
        sign_request.flush()
        return sign_request


#
# class CardanoRequest(database.Entity):
#     _table_ = 'cardano_requests'
#
#     annotation_hashs = orm.Required(list)
#     document_name = orm.Required(str)
#     document_url = orm.Required(str)
#     document_hash = orm.Required(str)
#
#     def __init__(self, document_name, document_url, document_hash):
#         self.document_name = document_name
#         self.document_url = document_url
#         self.document_hash = document_hash
#
#     def add_annotation_hash(self, hash):
#         self.annotation_hashs.append(hash)
#
#     def json(self):
#         return {
#             "document_name": self.document_name,
#             "document_url": self.document_url,
#             "document_hash": self.document_hash,
#             "annotation_hashs": self.annotation_hashs
#         }


if DEPLOYMENT == 'PRODUCTION' or DEPLOYMENT == 'STAGING':
    database.bind(provider=DB_PROVIDER, host=DB_HOST, user=DB_USER, passwd=DB_PASSWORD, db=DB_NAME, charset='utf8mb4')
    database.generate_mapping(create_tables=True)
else:
    print("Creating local database", DB_DIR, DB_NAME)
    database.bind('sqlite', f"{DB_DIR}/{DB_NAME}.sqlite3", create_db=True)
    database.generate_mapping(create_tables=True)
    orm.sql_debug(False)
