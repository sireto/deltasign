# Run this script from the project root directory.
# Otherwise, the certificates will be generated in the wrong
# directory. The correct path for the certificates
# is <project_root>/certs

SERVER_CN=deltasign.io

openssl req -nodes -newkey rsa:4096 \
    -keyout certs/deltasign-server.key \
    -out certs/deltasign-server.csr \
    -subj /CN=$SERVER_CN

openssl x509 -req \
    -in certs/deltasign-server.csr \
    -CA certs/deltasign-ca.pem \
    -CAkey certs/deltasign-ca.key \
    -set_serial 1 \
    -out certs/deltasign-server.pem
