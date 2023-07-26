class FacebookUser:
    def __init__(self, fbid, name, photo=None):
        self.id = fbid
        self.name = name
        self.photo = photo if photo else ''

    def json(self):
        return {
            'id': self.id,
            'name': self.name,
            'photo': self.photo
        }