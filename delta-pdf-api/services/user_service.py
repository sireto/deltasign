import hashlib
import os
import uuid
from datetime import datetime

import pyotp
from fastapi import HTTPException
from pony.orm import db_session, select, delete
from starlette.status import HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR

from db import User
from env import OTP_VALIDITY
from services.email_service import EmailService


class UserNotFoundException(HTTPException):
    def __init__(self, detail):
        super(UserNotFoundException, self).__init__(status_code=HTTP_404_NOT_FOUND, detail=detail)


class DatabaseError(HTTPException):
    def __init__(self, detail):
        super(DatabaseError, self).__init__(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


@db_session
def get_user_by_email(email: str):
    return User.get(email=email)


@db_session
def get_user_by_uuid(uuid: str):
    return User.get(uuid=uuid)


@db_session
def get_user_by_api_key(api_key: str):
    return User.get(api_key=api_key)


@db_session
def get_users():
    users = select(user for user in User)[:]
    return users


def _create_password_hash(raw_password: str):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', raw_password.encode('utf-8'), salt, 100000)
    return key, salt


def _verify_password(raw_password, db_hash, db_salt):
    computed_hash = hashlib.pbkdf2_hmac('sha256', raw_password.encode('utf-8'), db_salt, 100000)
    return db_hash == computed_hash


@db_session
def delete_user_by_uuid(uuid: str):
    delete(u for u in User if u.uuid == uuid)


@db_session
def email_login_code(email: str):
    user = get_user_by_email(email)
    if user is None:
        user = create_new_account(email)

    # compute login code
    totp = pyotp.TOTP(user.otp_seed, interval=OTP_VALIDITY)
    login_code = totp.now()
    print(f"{datetime.now()}: login code for {email}: {login_code}")
    try:
        email_service = EmailService()
        email_service.email_login_code(email, login_code)
    except Exception as e:
        print(f"Failed to email the login code to {email}", e)


@db_session
def verify_login_code(email: str, login_code: str):
    user = get_user_by_email(email)
    if user is None:
        raise UserNotFoundException("User does not exist")

    # compute login code
    totp = pyotp.TOTP(user.otp_seed, interval=OTP_VALIDITY)
    return totp.verify(login_code, valid_window=1)


@db_session
def create_new_account(email: str):
    user = get_user_by_email(email)
    if user is not None:
        return user

    user_uuid = str(uuid.uuid4())
    generated_date = datetime.now()
    api_key = f"key_{str(uuid.uuid4())}"
    jwt_seed = f"jwt_{str(uuid.uuid4())}"
    otp_seed = pyotp.random_base32()
    try:
        user = User(uuid=user_uuid,
                    email=email,
                    api_key=api_key,
                    jwt_seed=jwt_seed,
                    otp_seed=otp_seed,
                    generated_date=generated_date)
        user.flush()
        return user
    except Exception:
        # Todo: Log the error here
        raise DatabaseError("Failed to create user account")

@db_session
def logout_user(api_key: str):
    user = get_user_by_api_key(api_key)
    if user is None:
        raise UserNotFoundException("Invalid or expired API key")

    user.api_key = f"key_{uuid.uuid4()}"
    user.flush()
    return {"message": "User logged out successfully"}
