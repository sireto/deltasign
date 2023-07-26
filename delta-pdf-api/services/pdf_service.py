from io import BytesIO

import pikepdf


class PdfService:

    @classmethod
    def get_pdf_properties(cls, pdf_file_content):
        pdf_properties = {}

        with pikepdf.open(BytesIO(pdf_file_content)) as pdf:
            page0 = pdf.pages[0].MediaBox
            pdf_properties['width'] = float(page0[2])
            pdf_properties['height'] = float(page0[3])

        return pdf_properties
