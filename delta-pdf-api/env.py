import os


def str2bool(v):
    return v.lower() in ("yes", "true", "t", "1")


# to get a string like this run:
# openssl rand -hex 32
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY','***************************************')
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
CARDANO_TRANSACTION_SECRET = os.environ.get('CARDANO_TRANSACTION_SECRET', '***************************************')

# Email service
EMAIL_SMTP_SERVER = os.environ.get('EMAIL_SMTP_SERVER', 'mail.sireto.io')
EMAIL_SMTP_PORT = int(os.environ.get('EMAIL_SMTP_PORT', '587'))
EMAIL_USERNAME = os.environ.get('EMAIL_USERNAME', 'noreply@deltasign.io')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '***************************************')
EMAIL_SERVICE_TEST_MODE = str2bool(os.environ.get('EMAIL_SERVICE_TEST_MODE', 'y'))

# TOTP
OTP_VALIDITY = int(os.environ.get('OTP_VALIDITY', '120'))  # 2 minutes by default

# AWS
AWS_ENDPOINT_URL = os.environ.get("AWS_ENDPOINT_URL", "https://s3.eu-central-1.wasabisys.com")
AWS_ACCESS_KEY = os.environ.get("AWS_ACCESS_KEY", "***************************************")
AWS_SECRET_KEY = os.environ.get("AWS_SECRET_KEY", "***************************************")
AWS_BUCKET = os.environ.get("AWS_BUCKET", "eu.delta.sireto.io")
