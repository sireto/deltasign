# from datetime import datetime
#
# from pony import orm
# from pony.orm import PrimaryKey
#
# from db import database
#
#
# class SignRequest(database.Entity):
#     _table_ = 'sign_requests'
#
#     id = PrimaryKey(int, auto=True)
#     uuid = orm.Required(str, unique=True)
#
#     status = orm.Required(str)
#
#     request_date = orm.Required(datetime)
#     signed_date = orm.Optional(datetime)
#
#     hand_sig_hash = orm.Optional(str)
#     hand_sig_url = orm.Optional(str)
#     selfie_sig_hash = orm.Optional(str)
#     selfie_sig_url = orm.Optional(str)
#
#     signed_doc_url = orm.Required(str)
#     digital_signature = orm.Optional(str)
#     signature_hash = orm.Optional(str)
#     blockchain_tx_hash = orm.Optional(str)
#
#     # user = orm.Optional("User", reverse="sign_requests")
#     contract = orm.Optional("Contract", reverse="sign_requests")
