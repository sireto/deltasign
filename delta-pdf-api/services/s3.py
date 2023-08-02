import binascii
import hashlib
import os
import re

import boto3
import io

import botocore
from fastapi import HTTPException

import util
from api.exceptions import BadRequest
from dto.constants import uuid_regex

from env import AWS_BUCKET, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_ENDPOINT_URL
from util import get_hash


class S3Service:
    def __init__(self, endpoint_url=None, access_key=None, secret_key=None, bucket=None):
        self.endpoint_url = endpoint_url or AWS_ENDPOINT_URL
        access_key = access_key or AWS_ACCESS_KEY
        secret_key = secret_key or AWS_SECRET_KEY
        self.bucket_name = bucket or AWS_BUCKET

        self.s3 = boto3.resource('s3',
                                 endpoint_url=self.endpoint_url,
                                 aws_access_key_id=access_key,
                                 aws_secret_access_key=secret_key)
        self.s3_client = boto3.client('s3',
                                      endpoint_url=self.endpoint_url,
                                      aws_access_key_id=access_key,
                                      aws_secret_access_key=secret_key
                                      )
        self.bucket = self.s3.Bucket(self.bucket_name)

    def save_pdf(self, binary_pdf):
        sha256_hash = str(binascii.hexlify(hashlib.sha256(binary_pdf).digest()))
        self.bucket.upload_fileobj(io.BytesIO(binary_pdf), f"pdf/{sha256_hash}.pdf")

    def get_file_from_s3_url(self, s3_url) -> str:
        # signed_pdf_url = util.get_signed_url(s3_url)
        if self.check_if_file_exists(s3_url):
            # object_key = self.__get_object_key_from_url(signed_pdf_url)
            object_key = self.__get_object_key_from_url(s3_url)
            file_download_path = self.__get_download_path(object_key)
            self.s3_client.download_file(self.bucket_name, object_key, file_download_path)
            return file_download_path
        raise BadRequest("Document not found.")

    def copy_file_in_s3(self, source_key: str, key: str, source_bucket_name: str = AWS_BUCKET,
                        bucket_name: str = AWS_BUCKET):
        copy_source = self.__get_source_from_buket_name_and_key(source_bucket_name, source_key)
        self.s3.meta.client.copy(copy_source, bucket_name, key)

    def __get_source_from_buket_name_and_key(self, bucket_name: str, key: str) -> dict:
        return {
            'Bucket': bucket_name,
            'Key': key
        }

    def __get_download_path(self, object_key) -> str:
        regex = f"{uuid_regex}/"

        file_download_path = f"{os.getcwd()}/data/s3/" + object_key.replace("pdf/", "")
        file_download_path = re.split(regex, file_download_path)

        return "".join(file_download_path)

    def get_object_key_from_url(self, s3_url):
        return self.__get_object_key_from_url(s3_url)

    def __get_object_key_from_url(self, s3_url) -> str:
        return s3_url.replace(AWS_ENDPOINT_URL + "/" + self.bucket_name + "/", "")

    def save_file(self, user_uuid, data: bytes, folder: str, public=False):
        sha256_hash = get_hash(data)
        print(f"Uploading file with hash {sha256_hash} to s3.")
        filename = f"{folder}/{user_uuid}/{sha256_hash}.pdf"
        s3_url = f"{self.endpoint_url}/{self.bucket_name}/{filename}"
        extra_args = {'ACL': 'public-read'} if public else {}
        self.bucket.upload_fileobj(io.BytesIO(data), filename, ExtraArgs=extra_args)
        return s3_url

    def upload_file(self, file_path, s3_url):
        object_key = self.__get_object_key_from_url(s3_url)
        # object_key = util.get_signed_url(object_key)

        extra_args = {'ACL': 'public-read'}
        with open(file_path, 'rb') as docs:
            self.bucket.upload_fileobj(docs, object_key, extra_args)
            docs.close()
            print("File uploaded successfully.")

    def check_if_file_exists(self, s3_url) -> bool:
        object_key = self.__get_object_key_from_url(s3_url)
        print(self.bucket_name)
        try:
            self.s3.Object(self.bucket_name, object_key).load()
            return True
        except botocore.exceptions.ClientError as e:
            print(e)
            return False


# Return S3 service instance
s3_service = S3Service()

if __name__ == '__main__':
    s3_url = "https://s3.eu-central-1.wasabisys.com/eu.delta.sireto.io/pdf/f431a3b9-5c85-4387-a930-0217e6302794/a04b85fca0d6b705044c9e7d57fd928d023570b46ff07fd780dbbe762137d837.pdf"
    response = s3_service.check_if_file_exists(s3_url)
    print(response)
    # s3_service.get_file_from_s3_url("https://s3.eu-central-1.wasabisys.com/eu.delta.sireto.io/pdf/f431a3b9-5c85-4387-a930-0217e6302794/a04b85fca0d6b705044c9e7d57fd928d023570b46ff07fd780dbbe762137d837.pdf")
