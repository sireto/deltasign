from io import BytesIO

from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign import signers, fields


def read_all(fname):
    with open(fname, 'rb') as f:
        return f.read()


FROM_CA_PKCS12 = signers.SimpleSigner.load_pkcs12(
    'certs/deltasign-user-cert.pfx', passphrase=b'Sajilo_12#$'
)

w = IncrementalPdfFileWriter(BytesIO(read_all('data/doc2.pdf')))
sp = fields.SigFieldSpec('SigNew', box=(10, 10, 50, 28))
fields.append_signature_field(w, sp)
# assert len(w.root['/AcroForm']['/Fields']) == 1

out = signers.sign_pdf(
    w, signers.PdfSignatureMetadata(field_name='SigNew'), signer=FROM_CA_PKCS12,
)
r = PdfFileReader(out)
e = r.embedded_signatures[0]
assert e.field_name == 'SigNew'
w.write(open('data/doc2-updated.pdf', 'wb'))
