"use client";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Rnd } from "react-rnd";

interface Annotation {
  id: number;
  x: number;
  y: number;
  height: number;
  width: number;
}

export default function PDFViewer({ file }: { file: string }) {
  const thumbnailPluginInstance = thumbnailPlugin({});
  const { Thumbnails } = thumbnailPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const [currentPage, setCurrentPage] = useState(1);

  const handleThumbnailClick = (pageIndex: number) => {
    setCurrentPage(pageIndex + 1);
    jumpToPage(pageIndex);
  };

  const [isSignatureMode, setIsSignatureMode] = useState();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [nextId, setNextId] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePdfClick = (e: React.MouseEvent) => {
    if (!isSignatureMode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientX - rect.top;

    const newAnnotation = {
      id: nextId,
      x,
      y,
      width: 150,
      height: 60,
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setNextId((prev) => prev + 1);
  };

  const updateAnnotation = (
    id: number,
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number,
  ) => {
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, x: newX, y: newY, width: newWidth, height: newHeight }
          : a,
      ),
    );
    console.log(
      `📍 Annotation #${id} moved/resized → x:${newX.toFixed(0)}, y:${newY.toFixed(
        0,
      )}, w:${newWidth.toFixed(0)}, h:${newHeight.toFixed(0)}`,
    );
  };

  return (
    <>
      <div className="flex overflow-clip rounded-[8px]">
        <div className="h-[calc(100vh-82px)] min-w-[130px] bg-white p-2">
          <Thumbnails
            renderThumbnailItem={(thumbnail) => (
              <div
                key={thumbnail.pageIndex}
                onClick={() => handleThumbnailClick(thumbnail.pageIndex)}
              >
                <p className="text-midnight-gray-900 mb-1 text-xs font-[500]">
                  {thumbnail.pageIndex < 10
                    ? `0${thumbnail.pageIndex + 1}`
                    : thumbnail.pageIndex + 1}
                </p>
                <div
                  className={cn(
                    thumbnail.pageIndex === currentPage - 1
                      ? "border-silicon-400 border-[1px]"
                      : "border-midnight-gray-200 border-[1px]",
                    "mb-2 overflow-hidden rounded-[4px]",
                  )}
                >
                  {thumbnail.renderPageThumbnail}
                </div>
              </div>
            )}
          />
        </div>
      </div>
      <div className="flex h-[678px] w-[612px] py-[32px]">
        <div className="no-scrollbar flex-1 overflow-hidden rounded-[12px] border border-gray-200">
          <div
            ref={containerRef}
            onClick={handlePdfClick}
            className="relative flex-1 overflow-hidden border border-gray-300"
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
              <Viewer
                fileUrl={file}
                plugins={[
                  thumbnailPluginInstance,
                  pageNavigationPluginInstance,
                ]}
                renderPage={() => <div></div>}
              />
            </Worker>
            {annotations.map((ann) => (
              <Rnd
                key={ann.id}
                bounds="parent"
                size={{ width: ann.width, height: ann.height }}
                position={{ x: ann.x, y: ann.y }}
                onDragStop={(_, d) =>
                  updateAnnotation(ann.id, d.x, d.y, ann.width, ann.height)
                }
                onResizeStop={(_, __, ref, ___, pos) =>
                  updateAnnotation(
                    ann.id,
                    pos.x,
                    pos.y,
                    parseFloat(ref.style.width),
                    parseFloat(ref.style.height),
                  )
                }
                style={{
                  border: "2px solid #3b82f6",
                  backgroundColor: "rgba(147, 197, 253, 0.3)",
                  borderRadius: "6px",
                  color: "#1e3a8a",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>
                  x:{ann.x.toFixed(0)}, y:{ann.y.toFixed(0)}
                  <br />
                  w:{ann.width.toFixed(0)}, h:{ann.height.toFixed(0)}
                </span>
              </Rnd>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
