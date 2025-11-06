import React from "react";
import { Rnd } from "react-rnd";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const signatureFont = localFont({
  src: "../../../../../public/fonts/Madeva Suarte Signature Font.ttf",
});

const CustomPdfPage = React.memo(
  ({
    props,
    annotations,
    updateAnnotation,
    ghostPos,
    currentPage,
    userHasSigned,
    previewSignature,
    userEmail,
    signatureRef,
  }: any) => {
    return (
      <div
        style={{
          position: "relative",
          width: `${props.width}px`,
          height: `${props.height}px`,
        }}
        id="page-wrapper"
        className="overflow-clip"
      >
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}

        {/* Ghost Preview */}
        {ghostPos && currentPage - 1 === props.pageIndex && (
          <div
            className="border-silicon ring-silicon/20 pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
            key={ghostPos.id}
            style={{
              width: "154px",
              height: "44px",
              left: ghostPos.x,
              top: ghostPos.y,
            }}
          >
            <div
              className={`flex h-full w-full items-center justify-center text-4xl italic`}
            >
              Signature
            </div>
          </div>
        )}
        {annotations.map((ann: any) => (
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
              cursor: "move",
            }}
            className="border-silicon ring-silicon/20 rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
          >
            <div className="text-silicon text-midnight-gray-900 absolute -top-4 rounded px-1 text-[10px] font-medium">
              {ann.signer == userEmail ? "You" : ann.signer}
            </div>
            <div className={`flex h-full w-full items-center justify-center`}>
              {userHasSigned && ann.signer == userEmail && (
                <span
                  ref={signatureRef}
                  className={cn(signatureFont.className, "itallic text-4xl")}
                >
                  {previewSignature}
                </span>
              )}
            </div>
          </Rnd>
        ))}
      </div>
    );
  },
);

export default CustomPdfPage;
