from pdf_annotate import PdfAnnotator, Appearance, Location


class AnnotationService:

    def __init__(self, filename, pdf_file):
        self.filename = filename
        self.annotator = PdfAnnotator(pdf_file)

    def add_signature_on_page(self, signature_file, position, page):
        x1, y1, x2, y2 = position
        self.annotator.add_annotation('image',
                                      location=Location(x1=x1, y1=x2, x2=x2, y2=y2, page=page),
                                      appearance=Appearance(image=signature_file))

    def save_pdf(self):
        self.annotator.write(self.filename)


def _annotation_to_location():
    return Location(
        x1=10,
        y1=10,
        x2=110,
        y2=30,
        page=0
    )


if __name__ == "__main__":
    pdf_file = '../data/doc1.pdf'
    signature_file = '../data/signature_test.png'
    annotator = PdfAnnotator(pdf_file)
    annotator.add_annotation('image',
                             location=_annotation_to_location(),
                             appearance=Appearance(image=signature_file))
    annotator.write(pdf_file.replace('.pdf', '-signed.pdf'))
