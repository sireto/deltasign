# Elegant, Pythonic API
import pikepdf
from pikepdf import Array
from pikepdf._qpdf import PageList

with pikepdf.open('data/doc2.pdf') as pdf:
    page1 = pdf.pages[1].MediaBox
    print(f"{page1[0]}, {page1[1]}, {page1[2]}, {page1[3]}")
    print(repr(page1))
    print(f"filename: {pdf.filename}")

    # num_pages = len(pdf.pages)
    # print(num_pages)
    # print(pdf.is_encrypted)
    # print(repr(pdf.docinfo))
    # print(dir(pdf.pages[1]))
    # print(f"creator:{pdf.docinfo['/Creator']}")
    # print(f"title:{pdf.docinfo['/Title']}")
    # PageList()

    with pdf.open_metadata() as meta:
        # print(meta, type(meta), dir(meta))
        meta.load_from_docinfo(pdf.docinfo)
        print(meta['xmp:CreatorTool'])
        print(meta)
        # print(meta.keys())
        # print(meta.items())
        for _key in meta.keys():
            print(_key)

    pdf.show_xref_table()
    # del pdf.pages[-1]
    # pdf.save('output.pdf')