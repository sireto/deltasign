import os


def str2bool(v):
    return v.lower() in ("yes", "true", "t", "1")


# to get a string like this run:
# openssl rand -hex 32
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', '09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '30'))

# Database details
DB_PROVIDER = os.environ.get('DB_PROVIDER', 'mysql')
DB_HOST = os.environ.get('DB_HOST', 'localhost:3306')
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'root')
DB_NAME = os.environ.get('DB_NAME', 'deltapdf')
DB_DIR = os.environ.get('DB_DIR', '.')

# Deployment type
# PRODUCTION  - For production
# Anything else - For non-production
DEPLOYMENT = os.environ.get('DEPLOYMENT', 'DEV')

CARDANO_TRANSACTION_URL = os.environ.get('CARDANO_TRANSACTION_URL', 'https://minter.cnftregistry.io/payment/metadata')
CARDANO_TRANSACTION_SECRET = os.environ.get('CARDANO_TRANSACTION_SECRET', '$ireT0001')

# Email service
EMAIL_SMTP_SERVER = os.environ.get('EMAIL_SMTP_SERVER', 'mail.sireto.io')
EMAIL_SMTP_PORT = int(os.environ.get('EMAIL_SMTP_PORT', '587'))
EMAIL_USERNAME = os.environ.get('EMAIL_USERNAME', 'noreply@deltasign.io')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', 'xpc7FgSFd89Nhw5p')
EMAIL_SERVICE_TEST_MODE = str2bool(os.environ.get('EMAIL_SERVICE_TEST_MODE', 'y'))

# TOTP
OTP_VALIDITY = int(os.environ.get('OTP_VALIDITY', '120'))  # 2 minutes by default

# AWS
AWS_ENDPOINT_URL = os.environ.get("AWS_ENDPOINT_URL", "https://s3.eu-central-1.wasabisys.com")
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY", "MW1WXC4NDMKOFJOQOIBT")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY", "tnfhPoDmUZnhWa49Iz0Y75L3sMetZMNlKdjurAzt")
AWS_BUCKET = os.environ.get("AWS_BUCKET", "eu.delta.sireto.io")
