import json

import requests

from env import CARDANO_TRANSACTION_URL, CARDANO_TRANSACTION_SECRET
from dto.cardano_transaction import TransactionResult

from services.pdf_signer import pdf_signer


class CardanoService:
    def __init__(self):
        pass

    def post_transaction_with_document_validation_info(self, file_path, file_hash, user_uuid):
        pdf_hashes = pdf_signer.get_signed_pdf_hashes(file_path)

        json_metadata = {
            "hashes": pdf_hashes,
            "contract_hash": file_hash,
            "contract_creator": user_uuid
        }

        result = self._post_transaction_with_metadata(json.dumps(json_metadata))
        return result.transaction_id, pdf_hashes["signed_document_hash"]

    def get_contract_validation_metadata(self, hash: str):
        return self._get_transaction_metadata(hash)

    def _get_transaction_metadata(self, hash: str):
        headers = {"secret": CARDANO_TRANSACTION_SECRET}

        response = requests.get(
            CARDANO_TRANSACTION_URL,
            headers=headers,
            params={
                "hash": hash
            }
        )
        if response.status_code == 200:
            return response.json()
        print(response)

    def _post_transaction_with_metadata(self, metadata) -> TransactionResult:
        headers = {"secret": CARDANO_TRANSACTION_SECRET}

        response = requests.post(
            CARDANO_TRANSACTION_URL,
            headers=headers,
            params={
                "metadata": metadata
            }
        )
        if response.status_code == 200:
            return TransactionResult.from_json(response.json())
        print(response)


cardano_service = CardanoService()

if __name__ == '__main__':
    cardano_service = CardanoService()

    cardano_service.get_contract_validation_metadata("405957015411d21299d61b19e78c93d47e473f93d9856471c52fd44bd3d9f2af")
