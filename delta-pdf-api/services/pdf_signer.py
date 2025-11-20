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
import requests


class PDFSigner:
    pwd = os.getcwd()
    print(pwd)
    signer = signers.SimpleSigner.load_pkcs12(f"{pwd}/certs/deltasign-user-cert.pfx", passphrase=b'Sajilo_12#$')

    # signing using pyhanko
    def writeImageBasedStamp(self, pdf_file, signature_file, annotation):
        box_dimension = (round(annotation.x1), round(annotation.y1), round(annotation.x2), round(annotation.y2))
        box_width = annotation.x2 - annotation.x1
        box_height = annotation.y2 - annotation.y1
        
        # ========================
        # COMPREHENSIVE DEBUG LOGGING
        # ========================
        print("\n" + "="*50)
        print("📝 ANNOTATION DEBUG INFORMATION")
        print("="*50)
        print(f"📄 Page: {annotation.page}")
        print(f"👤 Signer: {annotation.signer}")
        print(f"📍 Box Coordinates:")
        print(f"   x1 (left): {annotation.x1}")
        print(f"   y1 (bottom): {annotation.y1}")
        print(f"   x2 (right): {annotation.x2}")
        print(f"   y2 (top): {annotation.y2}")
        print(f"📏 Box Dimensions:")
        print(f"   Width: {box_width} (x2 - x1 = {annotation.x2} - {annotation.x1})")
        print(f"   Height: {box_height} (y2 - y1 = {annotation.y2} - {annotation.y1})")
        print(f"🎯 Box Area: {box_width} x {box_height} units")
        
        # Check if coordinates make sense
        if box_width <= 0:
            print("❌ WARNING: Box width is zero or negative!")
        if box_height <= 0:
            print("❌ WARNING: Box height is zero or negative!")
        if annotation.y2 < annotation.y1:
            print("❌ WARNING: y2 < y1 - coordinates might be inverted!")
        
        signature_path = f"/tmp/signature_{annotation.signer or 'unknown'}.png"
        with open(signature_path, "wb") as f:
            f.write(signature_file)
        
        print(f"💾 Signature saved to: {signature_path}")
        
        signature_image = Image.open(io.BytesIO(signature_file))

        signature_image = signature_image.resize(
        (int(box_width), int(box_height)), 
        Image.Resampling.LANCZOS
        )
        print(f"🖼️  Resized image: {signature_image.size}")
        
        # ========================
        # IMAGE DEBUG INFORMATION
        # ========================
        print(f"🖼️  Signature Image Info:")
        print(f"   Original size: {signature_image.size}")
        print(f"   Format: {signature_image.format}")
        print(f"   Mode: {signature_image.mode}")
        
        # Check image vs box size ratio
        img_width, img_height = signature_image.size
        if box_width > 0 and box_height > 0:
            width_ratio = img_width / box_width
            height_ratio = img_height / box_height
            print(f"   Size Ratios (image/box):")
            print(f"     Width ratio: {width_ratio:.2f}")
            print(f"     Height ratio: {height_ratio:.2f}")
            
            if width_ratio > 2 or height_ratio > 2:
                print("⚠️  Image is significantly larger than box - may be scaled down")
            elif width_ratio < 0.5 or height_ratio < 0.5:
                print("⚠️  Image is significantly smaller than box - may be scaled up")
        
        # ========================
        # PDF SIGNING PROCESS
        # ========================
        with open(pdf_file, 'rb+') as docs:
            w = IncrementalPdfFileWriter(docs, strict=False)
            random_signature_field = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

            print(f"🔧 Creating signature field: {random_signature_field}")
            
            fields.append_signature_field(w, sig_field_spec=fields.SigFieldSpec(
                random_signature_field,
                box=box_dimension,
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
                    background=images.PdfImage(signature_image , opacity=1),
                    border_width=0,
                )
            )
            
            # ========================
            # FINAL VERIFICATION
            # ========================
            print(f"✅ Final Configuration:")
            print(f"   Signature field box: {box_dimension}")
            print(f"   Image size: {signature_image.size}")
            print(f"   Stamp style: {pdfSigner.stamp_style}")
            print(f"   Page: {annotation.page}")
            
            # Output filename
            signed_file = pdf_file
            if not pdf_file.__contains__("_signed.pdf"):
                signed_file = util.get_signed_url(pdf_file)
                with open(signed_file, 'wb') as outf:
                    print(f"💫 Signing PDF...")
                    pdfSigner.sign_pdf(w, output=outf)
                    outf.close()
                    print(f"✅ Signed PDF saved to: {signed_file}")
            else:
                print(f"💫 Signing PDF in place...")
                pdfSigner.sign_pdf(w, in_place=True)
                print(f"✅ PDF signed in place")
            
            print("🎉 Finish signing pdf.")
            print("="*50 + "\n")
            return signed_file

    def validate_signed_pdf(self, signed_pdf_path: str, hashes):
        with open(signed_pdf_path, 'rb') as docs:
            pdf = PdfFileReader(docs)
            for index, sig in enumerate(pdf.embedded_signatures):
                if not hashes[f"annotation-{index}"] == util.get_hash(sig.compute_digest()):
                    raise Exception("Validation Failed")
            print("Pdf validated")
            return "Pdf validated"

    def get_signed_pdf_hashes(self, s3_url):
        print(s3_url)
        response = requests.get(s3_url)
        response.raise_for_status()
        pdf_bytes = io.BytesIO(response.content)

        document_hash = util.get_hash(pdf_bytes.getvalue())

        pdf_bytes.seek(0)
        pdf = PdfFileReader(pdf_bytes)

        signature_hashes = {}
        for index, sig in enumerate(pdf.embedded_signatures):
            signature_hashes[f"annotation-{index}"] = util.get_hash(sig.compute_digest())

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
