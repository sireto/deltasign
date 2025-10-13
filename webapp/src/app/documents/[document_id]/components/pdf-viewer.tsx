'use client';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

export default function PDFViewer({ file }: { file: string }) {
  const thumbnailPluginInstance = thumbnailPlugin({});
  const { Thumbnails } = thumbnailPluginInstance;

  return (
    <>
      <div className="flex overflow-clip rounded-[12px] border border-gray-200 bg-red-100">
        <div className="w-[180px] border-r border-gray-200 bg-gray-50">
          <Thumbnails />
        </div>
      </div>
      <div className="flex h-[678px] w-[612px] py-[32px]">
        <div className="no-scrollbar flex-1 overflow-hidden rounded-[12px] border border-gray-200">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
            <Viewer fileUrl={file} plugins={[thumbnailPluginInstance]} />
          </Worker>
        </div>
      </div>
    </>
  );
}
