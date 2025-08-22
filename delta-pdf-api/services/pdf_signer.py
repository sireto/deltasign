import datetime
import io
import os
import random
import string

from PIL import Image
from pyhanko import stamp
from pyhanko.pdf_utils import text, images
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.pdf_utils.reader import PdfFileReader

from pyhanko.sign import signers, fields


import util
from services.file_service import delete_file


class PDFSigner:
    pwd = os.getcwd()
    print(pwd)
    signer = signers.SimpleSigner.load_pkcs12(f"{pwd}/certs/deltasign-user-cert.pfx", passphrase=b'Sajilo_12#$')

    # signing using pyhanko
    def writeImageBasedStamp(self, pdf_file, signature_file, annotation):
        box_dimension = (annotation.x1, annotation.y1, annotation.x2, annotation.y2)

        signature_image = Image.open(io.BytesIO(signature_file))
        with open(pdf_file, 'rb+') as docs:
            w = IncrementalPdfFileWriter(docs, strict=False)

            random_signature_field  =''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

            fields.append_signature_field(w, sig_field_spec=fields.SigFieldSpec(
                random_signature_field,
                box= (box_dimension[0], box_dimension[1], box_dimension[2], box_dimension[3]),
                on_page=annotation.page
            ))
            meta = signers.PdfSignatureMetadata(field_name=random_signature_field)
            pdfSigner = signers.PdfSigner(
                meta,
                signer=self.signer,
                stamp_style=stamp.TextStampStyle(
                    text_box_style=text.TextBoxStyle(
                        font_size=0
                    ),
                    background=images.PdfImage(signature_image),
                    border_width=0
                )
            )
            # output filename
            signed_file = pdf_file
            if not pdf_file.__contains__("_signed.pdf"):
                signed_file = util.get_signed_url(pdf_file)
                with open(signed_file, 'wb') as outf:
                    pdfSigner.sign_pdf(w, output=outf)
                    outf.close()
            else:
                pdfSigner.sign_pdf(w, in_place=True)
            print("Finish signing pdf.")
            return signed_file

    def validate_signed_pdf(self, signed_pdf_path: str, hashes):
        with open(signed_pdf_path, 'rb') as docs:
            pdf = PdfFileReader(docs)
            for index, sig in enumerate(pdf.embedded_signatures):
                if not hashes[f"annotation-{index}"] == util.get_hash(sig.compute_digest()):
                    raise Exception("Validation Failed")
            print("Pdf validated")
            return "Pdf validated"

    def get_signed_pdf_hashes(self, file_path):
        with open(file_path, 'rb') as docs:
            document_hash = util.get_hash(docs.read())
            pdf = PdfFileReader(docs)
            signature_hashes = {}
            for index,sig in enumerate(pdf.embedded_signatures):
                signature_hashes[f"annotation-{index}"] = util.get_hash(sig.compute_digest())
            docs.close()

            delete_file(file_path)

            signature_hashes["signed_document_hash"] = document_hash
            return signature_hashes

# pdf_signer = PDFSigner("../certs/demo2_user1.p12", b'1234')
pdf_signer = PDFSigner()

if __name__ == "__main__":
    pkcs_file = "../certs/demo2_user1.p12"
    password = b"1234"

    # pdf_signer = PDFSigner("../certs/deltasign-user-cert.pfx", b'Sajilo_12#$')
    # signer = signers.SimpleSigner.load("../certs/key.pem", "../certs/certificate.pem", key_passphrase=b'password')

    x1 = 242.39
    y1 = 126.67
    w = 100
    h = 20

    x2 = x1 + w  # 328.79
    y2 = y1 + h  # 144.60
    box_dimension = (x1, y1, x2, y2)

    contract_file = "../data/DeltaSignSample.pdf"
    signature_file = "../data/signature_test.png"
    signed_file = "../data/f2f6ddb1ebff562e0624e4129bacd96510528d570e9e7595b5352a629ca31158_signed.pdf"

    # with open(signature_file, 'rb') as docs:
    #     pdf_signer.writeImageBasedStamp(contract_file, docs.read(), box_dimension)
    pdf_signer.validateImageSignedPdf(signed_file)
