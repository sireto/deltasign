import { Worker, Viewer, RenderPageProps } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import CustomPdfPage from "./custom-pdf-page";
import { PDFAnnotation } from "../../types";

export interface PDFViewerProps {
  fileUrl: string;
  annotations: PDFAnnotation[];
  currentPage: number;
  onPageChange: (page: number) => void;
  updateAnnotation: (
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  deleteAnnotation: (id: number) => void;
  ghostPos: { x: number; y: number } | null;
  userHasSigned: boolean;
  previewSignature: string;
  userEmail: string;
  signatureRef: React.RefObject<HTMLDivElement | null>;
  onPdfClick: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  thumbnailPluginInstance: ReturnType<typeof thumbnailPlugin>;
  pageNavigationPluginInstance: ReturnType<typeof pageNavigationPlugin>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function PDFViewer({
  fileUrl,
  annotations,
  currentPage,
  onPageChange,
  updateAnnotation,
  deleteAnnotation,
  ghostPos,
  userHasSigned,
  previewSignature,
  userEmail,
  signatureRef,
  onPdfClick,
  onMouseMove,
  thumbnailPluginInstance,
  pageNavigationPluginInstance,
  containerRef,
}: PDFViewerProps) {
  return (
    <div className="flex h-[792px] w-[612px] pt-[32px]">
      <div className="no-scrollbar flex-1 overflow-hidden rounded-[12px] border border-gray-200">
        <div
          ref={containerRef}
          onClick={onPdfClick}
          className="relative h-full w-full flex-1"
          onMouseMove={onMouseMove}
        >
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[thumbnailPluginInstance, pageNavigationPluginInstance]}
              renderPage={(props: RenderPageProps) => (
                <CustomPdfPage
                  annotations={annotations.filter(
                    (a) => a.page === props.pageIndex,
                  )}
                  props={props}
                  updateAnnotation={updateAnnotation}
                  deleteAnnotation={deleteAnnotation}
                  ghostPos={ghostPos}
                  currentPage={currentPage}
                  userHasSigned={userHasSigned}
                  previewSignature={previewSignature}
                  userEmail={userEmail}
                  signatureRef={signatureRef}
                />
              )}
              onPageChange={(e) => onPageChange(e.currentPage + 1)}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
}
