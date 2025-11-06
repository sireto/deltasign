"use client";

import { usePathname } from "next/navigation";
import {
  Check,
  ChevronUp,
  Download,
  LoaderCircle,
  Pen,
  Trash,
} from "lucide-react";
import NavBar from "./components/nav-bar";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  useGetContractByIdQuery,
  usePatchContractMutation,
  useSignContractMutation,
} from "../api/contracts";
import { Switch } from "@/components/ui/switch";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/store/store";
import Image from "next/image";
import { Worker, Viewer, RenderPageProps } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import emailvalidator from "email-validator";
import { PatchContractRequest } from "../types/contract";
import { SendHorizonal } from "lucide-react";
import "react-pdf/dist/Page/TextLayer.js";
import { toSvg, toPng } from "html-to-image";
import localFont from "next/font/local";

interface Annotation {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  signer: string;
}

const signatureFont = localFont({
  src: "../../../../public/fonts/Madeva Suarte Signature Font.ttf",
});

const CustomPageRender = React.memo(
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
            className="border-silicon ring-silicon/20 pointer-events-none absolute flex h-[44px] w-[154px] items-center justify-center rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
            style={{
              left: ghostPos.x,
              top: ghostPos.y,
            }}
          >
            <span className="text-midnight-gray-900 text-sm font-[500]">
              Signature
            </span>
          </div>
        )}

        {annotations.map((ann: any) => (
          <div
            key={ann.id}
            style={{
              cursor: "move",
              left: ann.x,
              top: ann.y,
              height: ann.height,
              width: ann.width,
            }}
            className="border-silicon ring-silicon/20 absolute rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
          >
            <div className="text-silicon text-midnight-gray-900 absolute -top-4 rounded px-1 text-[10px] font-medium">
              {ann.signer == userEmail ? "You" : ann.signer}
            </div>
            <div
              className={`${signatureFont.className} itallic flex h-full w-full items-center justify-center text-4xl text-black`}
              ref={signatureRef}
            >
              {userHasSigned && ann.signer == userEmail && (
                <span>{previewSignature}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

export default function Page() {
  const pathName = usePathname();

  // from your PDF metadata or backend.
  const [pdfDimensions, setPdfDimensions] = useState({
    width: 612,
    height: 792,
  });
  const [scaleFactor, setScaleFactor] = useState(0.75);

  // Web Pixels → PDF Points
  const webToPdf = (
    webX: number,
    webY: number,
    webWidth: number,
    webHeight: number,
  ) => {
    const pdfX = webX * scaleFactor;
    const pdfY =
      pdfDimensions.height - webY * scaleFactor - webHeight * scaleFactor;
    const pdfWidth = webWidth * scaleFactor;
    const pdfHeight = webHeight * scaleFactor;

    return {
      x1: pdfX,
      y1: pdfY,
      x2: pdfX + pdfWidth,
      y2: pdfY + pdfHeight,
    };
  };

  // PDF Points → Web Pixels
  const pdfToWeb = (
    pdfX1: number,
    pdfY1: number,
    pdfX2: number,
    pdfY2: number,
  ) => {
    const webX = pdfX1 / scaleFactor;
    const webY = (pdfDimensions.height - pdfY2) / scaleFactor; // Convert PDF top to web top
    const webWidth = (pdfX2 - pdfX1) / scaleFactor;
    const webHeight = (pdfY2 - pdfY1) / scaleFactor;

    return {
      x: webX,
      y: webY,
      width: webWidth,
      height: webHeight,
    };
  };

  // Get rendered page size (in pixels) from your PDF viewer container
  // e.g. the <div> that wraps your rendered PDF page.
  const pageContainer = document.querySelector(".pdf-page") as HTMLElement;

  const contractId = pathName.split("/")[2];
  const { data: contract } = useGetContractByIdQuery({ uuid: contractId });

  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>(
    () =>
      contract?.annotations?.map((annotation, index) => ({
        id: index + 1,
        x: annotation.x1,
        y: annotation.y1,
        height: annotation.y2 - annotation.y1,
        width: annotation.x2 - annotation.x1,
        page: annotation.page,
        signer: annotation.signer,
      })) || [],
  );
  const [signers, setSigners] = useState<{ email: string; name: string }[]>(
    () =>
      contract?.signers?.map((signer) => ({
        name: "User",
        email: signer,
      })) || [],
  );

  const [nextId, setNextId] = useState(1);
  const [selectedTool, setSelectedTool] = useState("");
  const [addMyselfChecked, setAddMyselfChecked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const [showAddSignerDialog, setShowAddSignerDialog] = useState(false);

  const [showSignContractDialog, setShowSignContractDialog] = useState(false);

  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [pendingAnnotationPos, setPendingAnnotationPos] = useState<{
    x: number;
    y: number;
    pageIndex: number;
  } | null>(null);

  const { userName, userEmail } = useSelector((state: RootState) => ({
    userName: state.user.name,
    userEmail: state.user.email,
  }));

  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);

  const addRemoveSelfToSignersList = (checked: boolean) => {
    if (checked) {
      setSigners((prev) => {
        if (prev.some((s) => s.email === userEmail)) return prev;
        return [...prev, { email: userEmail, name: userName }];
      });
    } else {
      setSigners((prev) => prev.filter((s) => s.email !== userEmail));
    }
    setAddMyselfChecked(!addMyselfChecked);
  };

  const thumbnailPluginInstance = thumbnailPlugin({});
  const { Thumbnails } = thumbnailPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const [patchContract, { isLoading, isSuccess, error }] =
    usePatchContractMutation();

  const [previewSignature, setPreviewSignature] = useState("");

  const [userHasSigned, setUserHasSigned] = useState(false);

  const handleSendDocument = async () => {
    if (!contract) return;

    const patchContractData: PatchContractRequest = {
      name: contract.name,
      annotations: annotations.map((annotation) => {
        const pdfCoords = webToPdf(
          annotation.x,
          annotation.y,
          annotation.width,
          annotation.height,
        );

        console.log("📍 Web → PDF Conversion:");
        console.log("Web:", {
          x: annotation.x,
          y: annotation.y,
          width: annotation.width,
          height: annotation.height,
        });
        console.log("PDF:", pdfCoords);
        console.log("Scale factor:", scaleFactor);

        return {
          ...pdfCoords,
          signer: annotation.signer,
          color: "#000",
          page: annotation.page,
        };
      }),
      signers: signers.map((signer) => signer.email),
      message: "",
    };

    console.log("Final PDF coordinates:", patchContractData.annotations);

    try {
      const result = await patchContract({
        uuid: contract.uuid,
        patchContractRequest: patchContractData,
        alert_users: true,
      }).unwrap();
      console.log("Patch successful:", result);
    } catch (err) {
      console.error("Failed to patch contract:", err);
    }
  };

  const tools = [
    {
      label: "Signature",
      onClick: () => {
        setIsSignatureMode(true);
        setSelectedTool("Signature");
      },
    },
  ];

  // ========================
  // Handlers
  // ========================
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

  const handlePdfClick = (e: React.MouseEvent) => {
    if (!isSignatureMode || !containerRef.current || !ghostPos) return;

    setPendingAnnotationPos({
      x: ghostPos.x,
      y: ghostPos.y,
      pageIndex: currentPage - 1,
    });

    setShowAddSignerDialog(true);
    setGhostPos(null);
    setIsSignatureMode(false);
    setSelectedTool("");
  };

  const signatureRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = (pageIndex: number) => {
    setCurrentPage(pageIndex + 1);
    jumpToPage(pageIndex);
  };

  const updateAnnotation = useCallback(
    (id: number, x: number, y: number, width: number, height: number) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, x, y, width, height } : a)),
      );
    },
    [],
  );

  const deleteAnnotation = useCallback((id: number) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleConfirmSigner = () => {
    if (!pendingAnnotationPos) return;

    const newAnnotation: Annotation = {
      id: nextId,
      x: pendingAnnotationPos.x,
      y: pendingAnnotationPos.y,
      width: 154,
      height: 44,
      page: pendingAnnotationPos.pageIndex,
      signer: signerName || signerEmail,
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setNextId((prev) => prev + 1);

    // Add signer
    setSigners((prev) => {
      if (prev.some((s) => s.email === signerEmail)) return prev;
      return [...prev, { name: signerName, email: signerEmail }];
    });

    // Reset
    setSignerName("");
    setSignerEmail("");
    setPendingAnnotationPos(null);
    setShowAddSignerDialog(false);

    if (signerEmail === userEmail) {
      setAddMyselfChecked(true);
    }
  };

  // ========================
  // Render
  useEffect(() => {
    if (contract) {
      setAnnotations(
        contract.annotations.map((annotation: any, index: number) => {
          const webCoords = pdfToWeb(
            annotation.x1,
            annotation.y1,
            annotation.x2,
            annotation.y2,
          );

          console.log("📍 PDF → Web Conversion:");
          console.log("PDF:", {
            x1: annotation.x1,
            y1: annotation.y1,
            x2: annotation.x2,
            y2: annotation.y2,
          });
          console.log("Web:", webCoords);

          return {
            id: index + 1,
            ...webCoords,
            page: annotation.page,
            signer: annotation.signer,
          };
        }),
      );

      setSigners(
        contract.signers.map((signer: string) => ({
          name: "User",
          email: signer,
        })),
      );
    }
  }, [contract, pdfDimensions, scaleFactor]);
  // ========================fff

  const handleDocumentLoad = (e: any) => {
    console.log("PDF Document loaded:", e);

    if (e.doc && e.doc._pdfInfo) {
      const pdfInfo = e.doc._pdfInfo;
      const width = pdfInfo.width || 612;
      const height = pdfInfo.height || 792;

      setPdfDimensions({ width, height });
      console.log("Actual PDF dimensions:", { width, height });

      // Calculate actual scale factor based on rendered size
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const actualScaleX = width / rect.width;
        const actualScaleY = height / rect.height;

        // Use average scale factor
        const calculatedScale = (actualScaleX + actualScaleY) / 2;
        setScaleFactor(calculatedScale);
        console.log("Calculated scale factor:", calculatedScale);
      }
    }
  };

  const [signContract] = useSignContractMutation();

  const handleExport = async () => {
    if (!signatureRef.current) return;
    try {
      const dataUrl = await toPng(signatureRef.current, {
        cacheBust: true,
        skipFonts: false,
        width: 154,
        height: 44,
        canvasHeight: 44,
        canvasWidth: 154,
        style: {
          width: "154px",
          height: "44px",
        },
      });
      const blob = await (await fetch(dataUrl)).blob();

      // Download the PNG locally for debugging
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `debug-signature-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log("Signature dimensions:", {
        width: signatureRef.current.offsetWidth,
        height: signatureRef.current.offsetHeight,
        blobSize: blob.size,
      });

      // Then send to backend
      const formData = new FormData();
      formData.append("file", blob, "signature.png");

      const result = await signContract({
        uuid: contractId,
        formData,
      }).unwrap();
      console.log("Server response:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAcceptAndSignDocument = async () => {
    setUserHasSigned(true);
    setShowSignContractDialog(false);
    await handleExport();
  };

  if (!contract) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderCircle className="h-[50px] w-[50px] animate-spin" />
      </div>
    );
  }

  const ShareDocumentButton = () => {
    return (
      <Button disabled={annotations.length === 0} onClick={handleSendDocument}>
        <SendHorizonal />
        Send Document
      </Button>
    );
  };

  const SignDocumentButton = () => {
    return (
      <Button
        onClick={() => {
          setShowSignContractDialog(true);
        }}
      >
        <Pen />
        Sign Document
      </Button>
    );
  };

  const DownloadDocumentButton = () => {
    return (
      <Button>
        <Download />
        Download Document
      </Button>
    );
  };

  return (
    <div>
      {/* Add Signer Dialog */}
      <Dialog open={showAddSignerDialog} onOpenChange={setShowAddSignerDialog}>
        <DialogContent className="w-[400px] gap-0 overflow-hidden p-0">
          <DialogTitle className="text-md text-midnight-gray-900 bg-[#F9F9FC] px-4 py-3">
            Add Signer
          </DialogTitle>
          <div>
            <div className="border-midnight-gray-200 flex flex-col gap-3 border-y bg-white px-4 py-6">
              <div className="flex flex-col gap-2">
                <Label className="text-midnight-gray-900">Email</Label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 bg-[#F9F9FC] p-4">
              <Button
                variant="destructive"
                onClick={() => setShowAddSignerDialog(false)}
              >
                <Trash />
                <span>Cancel</span>
              </Button>
              <Button
                onClick={handleConfirmSigner}
                disabled={!emailvalidator.validate(signerEmail)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showSignContractDialog}
        onOpenChange={setShowSignContractDialog}
      >
        <DialogContent className="w-[500px] gap-0 overflow-hidden p-0">
          <DialogTitle className="text-md text-midnight-gray-900 bg-[#F9F9FC] px-4 py-3">
            Add Signature
          </DialogTitle>

          <div>
            {/* Signature Input Section */}
            <div className="border-midnight-gray-200 flex flex-col gap-3 border-y bg-white px-4 py-6">
              <div className="flex flex-col gap-3">
                <Label className="text-midnight-gray-900">
                  Type signature (Full Name)
                </Label>
                {/* Signature Preview Section */}
                <div className="border-midnight-gray-200 border-b bg-[#FAFAFC] px-4 py-6 text-center">
                  <Label className="text-midnight-gray-900 mb-2 block">
                    Preview
                  </Label>
                  <div className="border-midnight-gray-300 rounded-md border border-dashed bg-white p-4">
                    {previewSignature ? (
                      <p
                        className={`${signatureFont.className} text-5xl text-black italic`}
                      >
                        {previewSignature}
                      </p>
                    ) : (
                      <p className="text-midnight-gray-400 italic">
                        Your signature will appear here
                      </p>
                    )}
                  </div>
                </div>
                <Input
                  placeholder="Full name"
                  value={previewSignature}
                  onChange={(e) => setPreviewSignature(e.target.value)}
                  maxLength={50}
                />
                <p className="text-midnight-gray-600 text-sm">
                  I understand Delta Sign uses my name, email and other
                  information to complete the signature process and enhance the
                  user experience. To learn more about how Delta Sign uses
                  information, please visit Privacy Policy.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 bg-[#F9F9FC] p-4">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewSignature("");
                  setShowAddSignerDialog(false);
                }}
              >
                <Trash />
                <span>Clear</span>
              </Button>

              <Button
                onClick={async () => {
                  await handleAcceptAndSignDocument();
                }}
                disabled={previewSignature.length == 0}
                className="gap-1"
              >
                <Check />
                Accept & Sign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <NavBar
        className="sticky top-0"
        fileName={contract.name}
        RenderButton={
          contract.status == "draft"
            ? ShareDocumentButton
            : contract.status == "fully signed"
              ? DownloadDocumentButton
              : SignDocumentButton
        }
      />
      <div className="flex h-full w-full justify-between px-3 pt-3">
        {/* Thumbnails */}
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

        {/* PDF Viewer */}
        <div className="flex h-[792px] w-[612px] pt-[32px]">
          <div className="no-scrollbar flex-1 overflow-hidden rounded-[12px] border border-gray-200">
            <div
              ref={containerRef}
              onClick={handlePdfClick}
              className="relative h-full w-full flex-1"
              onMouseMove={handleMouseMove}
            >
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={
                    contract.status === "fully signed"
                      ? contract.signed_doc_url
                      : contract.document.s3_url
                  }
                  plugins={[
                    thumbnailPluginInstance,
                    pageNavigationPluginInstance,
                  ]}
                  onDocumentLoad={handleDocumentLoad}
                  renderPage={(props: RenderPageProps) => (
                    <CustomPageRender
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
                  onPageChange={(e) => setCurrentPage(e.currentPage + 1)}
                />
              </Worker>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="border-midnight-gray-200 overflow-clip rounded-lg border-[1.5px] bg-white">
          {contract.status === "draft" && (
            <>
              <div className="bg-midnight-gray-50 flex items-center gap-4 px-5 py-4">
                <div>
                  <p className="text-midnight-gray-900 text-lg font-[600]">
                    General Settings
                  </p>
                  <p className="text-midnight-gray-600 text-sm">
                    Configure general settings for the document.
                  </p>
                </div>
                <ChevronUp size={16} />
              </div>

              <div className="border-midnight-gray-200 flex flex-col gap-3 border-t-[1px] border-b-[1px] bg-white p-4">
                <div className="flex flex-col gap-2">
                  <Label>Title</Label>
                  <Input defaultValue={contract.name} />
                </div>
              </div>

              <div className="bg-midnight-gray-50 flex items-center gap-4 p-4">
                <div>
                  <p className="text-midnight-gray-900 text-lg font-[600]">
                    Tools
                  </p>
                  <p className="text-midnight-gray-600 text-sm">
                    Add all relevant fields for each recipient.
                  </p>
                </div>
              </div>
              <div className="border-midnight-gray-200 grid grid-cols-2 gap-3 border-t-[1px] border-b-[1px] bg-white px-5 py-4">
                {tools.map((tool) => (
                  <div key={tool.label}>
                    <Button
                      className={cn(
                        "w-full gap-2 px-[10px] py-[20px] active:border-blue-200",
                        selectedTool === tool.label && "border-blue-400",
                      )}
                      variant={"outline"}
                      onClick={tool.onClick}
                    >
                      <span className="text-midnight-gray-600 text-md leading-5 font-[500]">
                        {tool.label}
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="bg-midnight-gray-50 border-midnight-gray-200 flex items-center gap-4 border-b-[1px] px-5 py-4">
            <div>
              <p className="text-midnight-gray-900 text-lg font-[600]">
                Signers
              </p>
              <p className="text-midnight-gray-600 text-sm">
                {contract.status === "fully signed"
                  ? "List of people who have signed the document"
                  : "List of people who will sign the document"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-white px-5 py-3">
            {contract.status === "draft" && (
              <div className="bg-midnight-gray-50 border-midnight-gray-200 flex justify-between rounded-[8px] border-[1px] p-[10px]">
                <span className="text-midnight-gray-900 text-sm font-[600]">
                  Add yourself
                </span>
                <Switch
                  onCheckedChange={(checked) =>
                    addRemoveSelfToSignersList(checked)
                  }
                  checked={addMyselfChecked}
                />
              </div>
            )}

            {signers.map((signer, index) => (
              <div className="flex justify-between" key={index}>
                <div className="flex gap-3">
                  <Image
                    src="/placeholder.png"
                    alt="placeholder"
                    height={36}
                    width={36}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-midnight-gray-900 text-xs font-[600]">
                      {signer.name || "User"} &nbsp;
                      <span className="text-silicon">
                        {signer.email === userEmail && "(You)"}
                      </span>
                    </span>
                    <span className="text-midnight-gray-600 truncate text-xs">
                      {signer.email}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
