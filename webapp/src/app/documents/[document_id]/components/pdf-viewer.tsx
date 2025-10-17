'use client';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function PDFViewer({ file }: { file: string }) {
    const thumbnailPluginInstance = thumbnailPlugin({});
    const { Thumbnails } = thumbnailPluginInstance;

    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;

    const [currentPage, setCurrentPage] = useState(1);

    const handleThumbnailClick = (pageIndex: number) => {
        setCurrentPage(pageIndex + 1); // update state
        jumpToPage(pageIndex); // tell Viewer to navigate
    };

    return (
        <>
            <div className="flex overflow-clip rounded-[8px]">
                <div className="p-2 bg-white">
                    <Thumbnails
                        renderThumbnailItem={(thumbnail) => (
                            <div
                                key={thumbnail.pageIndex}
                                onClick={() => handleThumbnailClick(thumbnail.pageIndex)}
                                >
                                <p className="mb-1 text-midnight-gray-900 text-xs font-[500]">
                                   {thumbnail.pageIndex < 10 ? `0${thumbnail.pageIndex + 1}` :  thumbnail.pageIndex + 1}
                                </p>
                                <div 
                                  className={cn(
                                      thumbnail.pageIndex === currentPage - 1 ? "border-silicon-400 border-[1px]" : "border-midnight-gray-200 border-[1px]",
                                      "mb-2 rounded-[4px] overflow-hidden"
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
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
                        <Viewer
                            fileUrl={file}
                            plugins={[thumbnailPluginInstance, pageNavigationPluginInstance]}
                            defaultScale={1.0}
                        />
                    </Worker>
                </div>
            </div>
        </>
    );
}
