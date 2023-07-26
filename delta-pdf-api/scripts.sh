#pyhanko sign addfields --field  1/10,10,110,30/Sig1 data/doc1.pdf data/doc1-field.pdf
#pyhanko sign addsig --field Sig1 pemder \
#    --key certs/deltasign-user.key --cert certs/deltasign-user.pem data/doc1.pdf data/doc1-signed.pdf

pyhanko sign addsig --field 1/10,10,110,30/Sig1 pkcs12 \
    data/doc2.pdf data/doc2-signed.pdf certs/deltasign-user-cert.pfx

pyhanko sign addsig --field 2/10,10,110,30/Sig2 pkcs12 \
    data/doc2-signed.pdf data/doc2-signed.pdf certs/deltasign-user-cert.pfx