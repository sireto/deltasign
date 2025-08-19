import json
import requests
from env import BLOCKFROST_PROJECT_ID, BLOCKFROST_URL
import time

class BlockFrostService:
    def __init__(self):
        self.project_id = BLOCKFROST_PROJECT_ID
        self.url = BLOCKFROST_URL.rstrip("/")  

    def call_blockfrost(self, path: str, method: str = "GET", params: dict = None, data: dict = None):
        """
        Generic Blockfrost API caller.

        :param path: API endpoint path, e.g. "/txs/{tx_hash}/"
        :param method: HTTP method ("GET", "POST", etc.)
        :param params: Query parameters as dict
        :param data: Request body for POST/PUT as dict
        :return: Parsed JSON response
        """
        headers = {
            "project_id": self.project_id,
            "Content-Type": "application/json"
        }

        url = f"{self.url}{path}"

        print(url)

        response = requests.request(
            method=method.upper(),
            url=url,
            headers=headers,
            params=params,
            data=json.dumps(data) if data else None
        )

        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                return None
            else:
                raise e

        if response.text :
            try:
                return response.json()
            except json.JSONDecodeError:
                return None
        else:
            return None
    
    def verify_transaction(self, transaction_hash: str):
        """
        Fetch a transaction from Blockfrost by its hash.

        :param transaction_hash: The transaction hash to verify
        :return: Transaction details as JSON or None if not found
        """
        path = f"/api/v0/txs/{transaction_hash}/"
        return self.call_blockfrost(path)
    
    def poll_transaction_until_found(self , transaction_hash , max_attempts , interval):
        attempts = 0
        while attempts < max_attempts:
            result = self.verify_transaction(transaction_hash)
            if result is not None:
                return result
            attempts += 1
            time.sleep(interval)


blockfrost_service = BlockFrostService()

if __name__ == "__main__":
    blockfrost_service = BlockFrostService()
