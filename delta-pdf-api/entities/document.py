# from datetime import datetime
#
# import uuid
#
# from pony import orm
# from pony.orm import PrimaryKey
#
# from db import database
#
#
# class Document(database.Entity):
#     _table_ = 'docs'
#
#     id = PrimaryKey(int, auto=True)
#
#     uuid = orm.Required(str, unique=True)
#     filename = orm.Required(str)
#     s3_url = orm.Optional(str)
#
#     created_date = orm.Required(datetime)
#     updated_date = orm.Required(datetime)
#
#     user = orm.Optional("User", reverse="documents")
#     contracts = orm.Set("Contract", reverse="document")
#
#     @classmethod
#     def create(cls, filename, s3_url):
#         _uuid = str(uuid.uuid4())
#         _created_date = datetime.now()
#         _updated_date = datetime.now()
#         return Document(uuid=_uuid,
#                         filename=filename,
#                         s3_url=s3_url,
#                         created_date=_created_date,
#                         updated_date=_updated_date)
#
#     def json(self):
#         return {
#             "uuid": self.uuid,
#             "filename": self.filename,
#             "s3_url": self.s3_url,
#             "created_date": self.created_date,
#             "updated_date": self.updated_date,
#             "owner_uuid": self.user.uuid if self.user else None
#         }
#
#
#
#
#
#
#
#
#
