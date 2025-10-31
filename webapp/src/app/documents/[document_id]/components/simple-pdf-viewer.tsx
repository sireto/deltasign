"use client";

import { useState, useRef, useCallback } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button } from "@/shared/ui/button";
import { Rnd } from "react-rnd";
import { LoaderCircle } from "lucide-react";

interface Annotation {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

export default function SimplePDFViewer({ fileUrl }: { fileUrl: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Add new signature box
  const handlePdfClick = (e: React.MouseEvent) => {
    if (!isSignatureMode || !containerRef.current || !ghostPos) return;

    const x = ghostPos.x - 75;
    const y = ghostPos.y - 30;

    setAnnotations((prev) => [
      ...prev,
      {
        id: nextId,
        x,
        y,
        width: 150,
        height: 60,
        pageIndex: currentPage - 1,
      },
    ]);
    setNextId((id) => id + 1);
    setIsSignatureMode(false);
    setGhostPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSignatureMode || !containerRef.current) {
      setGhostPos(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setGhostPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const updateAnnotation = useCallback(
    (id: number, x: number, y: number, width: number, height: number) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, x, y, width, height } : a)),
      );
    },
    [],
  );

  const handleDocumentLoad = (e: any) => {
    setPageCount(e.doc.numPages);
  };

  const annotationsForPage = annotations.filter(
    (a) => a.pageIndex === currentPage - 1,
  );

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-3">
        <Button
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentPage >= pageCount}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
        <Button
          variant={isSignatureMode ? "default" : "outline"}
          onClick={() => setIsSignatureMode(!isSignatureMode)}
        >
          {isSignatureMode ? "Cancel" : "Add Signature"}
        </Button>
      </div>

      <div className="text-sm text-gray-600">
        Page {currentPage} of {pageCount || "?"}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border border-gray-200"
        onClick={handlePdfClick}
        onMouseMove={handleMouseMove}
        style={{ width: "612px", height: "678px" }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
          <Viewer
            fileUrl={fileUrl}
            defaultScale={1.0}
            initialPage={currentPage - 1}
            onDocumentLoad={handleDocumentLoad}
            renderPage={(props) => (
              <div
                style={{
                  position: "relative",
                  width: `${props.width}px`,
                  height: `${props.height}px`,
                }}
              >
                {props.canvasLayer.children}
                {props.textLayer.children}

                {/* Render annotations */}
                {annotationsForPage.map((ann) => (
                  <Rnd
                    key={ann.id}
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
                    }}
                  />
                ))}

                {/* Ghost Preview */}
                {ghostPos && isSignatureMode && (
                  <div
                    style={{
                      position: "absolute",
                      left: ghostPos.x,
                      top: ghostPos.y,
                      width: 150,
                      height: 60,
                      pointerEvents: "none",
                      border: "2px dashed #3b82f6",
                      backgroundColor: "rgba(147, 197, 253, 0.2)",
                      borderRadius: "6px",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
              </div>
            )}
          />
        </Worker>
      </div>
    </div>
  );
}
