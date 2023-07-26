
class TransactionResult:
    def __init__(self, signed_txn, transaction_id):
        self.signed_txn = signed_txn
        self.transaction_id = transaction_id

    @staticmethod
    def from_json(json_dct):
        return TransactionResult(json_dct['signedTxn'],
                     json_dct['transactionId'])