import pytest as pytest
from pony.orm import db_session

from db import Document, User
from model.annotation import Annotation, ContractCreationRequest
from services.user_service import create_new_account


@pytest.fixture
def testuser():
    test_email = "test1@deltasign.io"
    user = create_new_account(test_email)
    return user

@pytest.fixture
def sample_document(testuser):
    filename = "test_document1.pdf"
    filehash = "filehash"
    s3_url = "s3://fileurl-dummy.s3.amazonaws.com"
    properties = {'width': 600, 'height': 600}
    with db_session:
        return Document.create(filename, filehash, s3_url, testuser, properties)

@pytest.fixture
def contract_service():
    from services import contract_service
    return contract_service

@db_session
def test_create_contract(contract_service, sample_document, testuser):
    user = User[testuser.id]
    document = Document[sample_document.id]
    signers = ["testuser1@deltasign.io",
               "testuser2@deltasign.io",
               "testuser3@deltasign.io"]
    annotations = [
        Annotation(x1=10, y1=10, x2=110, y2=30, signer=signers[0], page=1, color="#FFCCDD"),
        Annotation(x1=10, y1=50, x2=110, y2=80, signer=signers[1], page=1, color="#FFCCDD"),
    ]
    message = "Pls sign the contract after reviewing"

    contract_creation_request = ContractCreationRequest(document_uuid=document.uuid,
                                                        message=message,
                                                        signers=signers,
                                                        annotations=annotations)

    new_contract = contract_service.create_new_contract(contract_creation_request, user)
    print(new_contract)
    print(new_contract.uuid)
    print(new_contract.sign_requests)
    print(new_contract.annotations)

    all_contracts = contract_service.get_contracts(sample_document)
    print(len(all_contracts))

