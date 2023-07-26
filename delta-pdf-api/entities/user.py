# from datetime import datetime
#
# from pony import orm
# from pony.orm import PrimaryKey
#
# from db import database
#
#
# class User(database.Entity):
#     _table_ = 'users'
#
#     id = PrimaryKey(int, auto=True)
#     uuid = orm.Required(str, unique=True)
#     email = orm.Required(str, unique=True)
#     full_name = orm.Optional(str)
#
#     api_key = orm.Optional(str, unique=True)
#     jwt_seed = orm.Optional(str)
#
#     generated_date = orm.Required(datetime)
#     registered_date = orm.Optional(datetime)
#
#     documents = orm.Set("Document", reverse="user")
