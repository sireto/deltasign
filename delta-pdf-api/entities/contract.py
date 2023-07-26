# from datetime import datetime
#
# from pony import orm
# from pony.orm import PrimaryKey
#
# from db import database
#
#
# class Contract(database.Entity):
#     _table_ = 'contracts'
#
#     id = PrimaryKey(int, auto=True)
#     uuid = orm.Required(str, unique=True)
#
#     signed_doc_url = orm.Required(str)
#     status = orm.Required(str)
#
#     signature_hash = orm.Optional(str)
#     blockchain_tx_hash = orm.Optional(str)
#
#     created_date = orm.Required(datetime)
#     updated_date = orm.Optional(datetime)
#
#     document = orm.Optional("Document", reverse="contracts")
#     sign_requests = orm.Set("SignRequest", reverse="contract")
