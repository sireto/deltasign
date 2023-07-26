# Run this script from the project root directory.
# Otherwise, the certificates will be generated in the wrong
# directory. The correct path for the certificates
# is <project_root>/certs

openssl req -x509 -nodes \
    -newkey rsa:4096 \
    -keyout certs/deltasign-ca.key \
    -out certs/deltasign-ca.pem \
    -subj /O=DeltaSignCA