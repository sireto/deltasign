"use client";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";

export default function PDFViewer({ file }: { file: string }) {
  const thumbnailPluginInstance = thumbnailPlugin({});
  const { Thumbnails } = thumbnailPluginInstance;

  return (
    <>
      <div className="flex rounded-[12px] overflow-clip bg-red-100 border border-gray-200">
        <div className="w-[180px]  border-r border-gray-200 bg-gray-50 ">
          <Thumbnails />
        </div>
      </div>
      <div className="flex py-[32px] h-[678px] w-[612px]">
        <div className="flex-1 overflow-hidden border border-gray-200 rounded-[12px] overflow-hidden no-scrollbar">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
            <Viewer fileUrl={file} plugins={[thumbnailPluginInstance]} />
          </Worker>
        </div>
      </div>
    </>
  );
}
