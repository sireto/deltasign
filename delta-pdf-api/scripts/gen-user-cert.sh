# Run this script from the project root directory.
# Otherwise, the certificates will be generated in the wrong
# directory. The correct path for the certificates
# is <project_root>/certs

AGENT_CN=info@deltasign.io

openssl req -nodes -newkey rsa:4096 \
    -keyout certs/deltasign-user.key \
    -out certs/deltasign-user.csr \
    -subj /CN=$AGENT_CN

openssl x509 -req \
    -in certs/deltasign-user.csr \
    -CA certs/deltasign-ca.pem \
    -CAkey certs/deltasign-ca.key \
    -set_serial 1 \
    -out certs/deltasign-user.pem

openssl pkcs12 -export \
    -inkey certs/deltasign-user.key \
    -in certs/deltasign-user.pem \
    -out certs/deltasign-user-cert.pfx