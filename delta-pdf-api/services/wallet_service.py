from pycardano import (
    HDWallet,
    PaymentSigningKey,
    PaymentVerificationKey,
    StakeSigningKey,
    StakeVerificationKey,
    Address,
    Network,
    TransactionBody,
    Transaction,
    VerificationKeyWitness,
    TransactionWitnessSet
)

from hashlib import blake2b

from env import WALLET_MNEMONIC, NETWORK as current_network


class WalletService:
    # HD paths for Cardano (CIP1852)
    PAYMENT_PATH = "m/1852'/1815'/0'/0/0"
    STAKING_PATH = "m/1852'/1815'/0'/2/0"

    def __init__(self, mnemonic: str = WALLET_MNEMONIC, network: str = current_network):
        self.hd_wallet = HDWallet.from_mnemonic(mnemonic)
        self.network = Network.MAINNET if network.lower() == "mainnet" else Network.TESTNET

    def _derive_keys(self, path: str):
        """
        Derive signing and verification keys from a given HD path
        """
        derived = self.hd_wallet.derive(0, hardened=True).derive_from_path(path)
        signing_key_cls = PaymentSigningKey if path == self.PAYMENT_PATH else StakeSigningKey
        verification_key_cls = PaymentVerificationKey if path == self.PAYMENT_PATH else StakeVerificationKey

        signing_key = signing_key_cls(derived.xprivate_key[:32])
        verification_key = verification_key_cls.from_signing_key(signing_key)
        
        return signing_key, verification_key

    def get_address(self) -> Address:
        """
        Get the Cardano address for the default payment/staking keys
        """
        _, payment_vk = self._derive_keys(self.PAYMENT_PATH)
        _, stake_vk = self._derive_keys(self.STAKING_PATH)

        return Address(
            payment_part=payment_vk.hash(),
            staking_part=stake_vk.hash(),
            network=self.network
        )
    
    def get_payment_signing_key(self) -> PaymentSigningKey:
        """
            Get payment signing keys
        """
        signing_key, _ = self._derive_keys(self.PAYMENT_PATH)
        return signing_key

    def sign_transaction(self, cborHex: str, tx_hash: str):
        """
            Sign the transaction with payment signing keys
        """
        cbor_bytes = bytes.fromhex(cborHex)        
        tx = Transaction.from_cbor(cbor_bytes)
        hash_bytes = bytes.fromhex(tx_hash)

        vkey_witness = VerificationKeyWitness(
            vkey=self.get_payment_signing_key().to_verification_key(),
            signature=self.get_payment_signing_key().sign(hash_bytes)
        )

        tx.transaction_witness_set = TransactionWitnessSet(
            vkey_witnesses=[vkey_witness]
        )
        return tx.to_cbor().hex()

wallet_service = WalletService()

if __name__ == '__main__':
    print("Default address:", wallet_service.get_address())
