import os

from fastapi import UploadFile


def save_file(file: UploadFile):
    file_path = f"{os.getcwd()}/data/{file.filename}"

    with open(file_path, 'wb') as docs:
        docs.write(file.file.read())
        return file_path

def rename_file(file_path, new_path):
    os.rename(file_path, new_path)

def delete_file(file_path):
    if check_file(file_path):
        os.remove(file_path)

def check_file(file_path) -> bool:
    return os.path.exists(file_path)