import json
import requests
from env import KUBER_API_KEY, KUBER_API_URL
from services.pdf_signer import pdf_signer
from services.wallet_service import wallet_service
from binascii import hexlify

class TransactionResult:
    @classmethod
    def from_json(cls, data):
        obj = cls()
        obj.transaction_id = data.get("transaction_id")
        return obj


class KuberService:
    def __init__(self):
        self.api_key = KUBER_API_KEY
        self.base_url = KUBER_API_URL

    def call_kuber(self, path: str, method: str = "GET", params=None, data=None, content_type="application/json"):
        url = f"{self.base_url}/{path}"
        headers = {
            "api-key": self.api_key,
            "content-type": content_type
        }

        if method.upper() == "POST":
            response = requests.post(url, headers=headers, data=data, params=params)
        else:
            response = requests.get(url, headers=headers, params=params)

        if response.status_code == 200:
            return response.json()
        print(f"Kuber API Error [{response.status_code}]: {response.text}")
        return None

    def post_transaction_with_document_validation_info(self , file_path , file_hash , user_uuid):
        pdf_hashes = pdf_signer.get_signed_pdf_hashes(file_path)
        json_metadata = {
            "selections": [
                wallet_service.get_address().__str__(),

            ],
            "metadata": {
                    "0" : {
                        "hashes": pdf_hashes,
                        "contract_hash": file_hash,
                        "contract_creator": user_uuid 
                        } 
            }
        }

        result_json = self.call_kuber(
            path="/api/v1/tx?submit=false",
            method="POST",
            data=json.dumps(json_metadata)
        )

        if result_json:

            signed_transaction_cborHex = wallet_service.sign_transaction(
                            result_json['cborHex'], 
                            result_json['hash']
                        )

            transaction_result = self.call_kuber(
                    path="/api/v1/tx/submit",
                    method="POST",
                    data=json.dumps({
                        "tx": {
                            "cborHex": signed_transaction_cborHex ,
                            "type": "Witnessed Tx ConwayEra",
                            "description": "something"
                            }
                        })
                )
            return transaction_result["hash"] , pdf_hashes["signed_document_hash"]


        return None, None

    def get_contract_validation_metadata(self, hash: str):
        result_json = self.call_kuber(
            path="payment/metadata",
            method="GET",
            params={"hash": hash}
        )
        return result_json


kuber_service = KuberService()

# Example usage
if __name__ == "__main__":
    kuber_service = KuberService()
