import binascii
import hashlib


def get_hash(data: bytes):
    return binascii.hexlify(hashlib.sha256(bytes(data)).digest()).decode('utf-8')

def get_signed_url(s3_url) -> str:
    return s3_url.replace(".pdf","_signed.pdf")