"use client";

import { usePathname } from "next/navigation";
import {
  Check,
  ChevronUp,
  Copy,
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
import {
  Worker,
  Viewer,
  RenderPageProps,
  DocumentLoadEvent,
} from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import emailvalidator from "email-validator";
import { PatchContractRequest } from "../types/contract";
import { SendHorizonal } from "lucide-react";
import "react-pdf/dist/Page/TextLayer.js";
import { toPng } from "html-to-image";
import localFont from "next/font/local";
import { capitalize } from "@/shared/utils";
import { Textarea } from "@/components/ui/textarea";
import { toast, Bounce } from "react-toastify";
import { createSelector } from "@reduxjs/toolkit";
import React from "react";
import { PdfProperties } from "../types/document";

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

const CustomPageRenderComponent = ({
  props,
  annotations,
  ghostPos,
  currentPage,
  previewSignature,
  userEmail,
  ref,
  onMouseMove,
  onClick
}: {
  props: RenderPageProps;
  annotations: Annotation[];
  ghostPos: { x: number; y: number } | null;
  currentPage: number;
  previewSignature: string;
  userEmail: string;
  ref : React.RefObject<HTMLDivElement|null>;
  onMouseMove : (e : React.MouseEvent) => void;
  onClick : () => void;
}) => {
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
      id="page-wrapper"
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      {props.canvasLayer.children}
      {props.textLayer.children}
      {props.annotationLayer.children}

      {ghostPos && currentPage - 1 === props.pageIndex && (
        <div
          className="border-silicon ring-silicon/20 pointer-events-none absolute flex h-[44px] w-[154px] items-center justify-center rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
          style={{
            left: ghostPos.x,
            top: ghostPos.y,
          }}
        >
          <span className="text-midnight-gray-900 text-silicon text-sm font-[500]">
            Signature
          </span>
        </div>
      )}

      {annotations.map((ann: Annotation) => (
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
          >
            {ann.signer == userEmail && <span>{previewSignature}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

const CustomPageRender = React.memo(CustomPageRenderComponent);
CustomPageRender.displayName = "CustomPageRender";


export default function Page() {
  const pathName = usePathname();

  // from your PDF metadata or backend.
  const [pdfDimensions, setPdfDimensions] = useState({
    width: 612,
    height: 792,
  });
  const [scaleFactor, setScaleFactor] = useState(0.75);
  const [pdfKey , setPdfKey] = useState(Date.now())

  
  const contractId = pathName.split("/")[2];
  const { data: contract, refetch: refetchContract } = useGetContractByIdQuery({
    uuid: contractId,
  });

  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>(
    () =>
      contract?.annotations?.map((annotation, index) => ({
        id: index + 1,
        x: annotation.x1,
        y: annotation.y1,
        height: annotation.y2 - annotation.x2,
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

  const selectUserInfo = createSelector(
    (state: RootState) => state.user.name,
    (state: RootState) => state.user.email,
    (name, email) => ({
      userName: name,
      userEmail: email,
    }),
  );

  const {userEmail , userName} = useSelector(selectUserInfo)

  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);

  const thumbnailPluginInstance = thumbnailPlugin({});
  const { Thumbnails } = thumbnailPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const [patchContract, { isLoading: patchingContract }] =
    usePatchContractMutation();

  const [previewSignature, setPreviewSignature] = useState("");

  const [emailMessage, setEmailMessage] = useState("");

  const handleSendDocument = async () => {
    if (!contract) return;

    const patchContractData: PatchContractRequest = {
      name: contract.name,
      annotations: annotations.map((annotation) => {
        const {x : x1 , y : y1} = convertWebCoordinatesToPdf(annotation.x , annotation.y + annotation.height , pdfDimensions.width , pdfDimensions.height , pdfDimensions.width , pdfDimensions.height)
        const {x : x2 , y : y2} = convertWebCoordinatesToPdf(annotation.x + annotation.width , annotation.y , pdfDimensions.width , pdfDimensions.height , pdfDimensions.width , pdfDimensions.height)
        return {
          x1,
          y1,
          x2,
          y2,
          signer: annotation.signer,
          color: "#000",
          page: annotation.page,
        };
      }),
      signers: signers.map((signer) => signer.email),
      message: emailMessage,
    };
    
    console.log("Final PDF coordinates:", patchContractData.annotations);

    try {
      await patchContract({
        uuid: contract.uuid,
        patchContractRequest: patchContractData,
        alert_users: true,
      }).unwrap();
      setEmailMessage("");
      toast.success(
        "🎉 Document has been created and shared successfully with recipents.",
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          transition: Bounce,
        },
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to create and share document.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    }
    setShowShareDocumentDialog(false);
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

 const convertWebCoordinatesToPdf = (
    x: number,
    y: number,
    canvasWidth: number,
    canvasHeight: number,
    pdfWidth: number,
    pdfHeight: number
  ) => {
    return {
      x: (x / canvasWidth) * pdfWidth,
      y: ((canvasHeight - y) / canvasHeight) * pdfHeight
    };
  };

  const convertPdfToWebCoordinates = (
    pdfX: number,
    pdfY: number,
    canvasWidth: number,
    canvasHeight: number,
    pdfWidth: number,
    pdfHeight: number
  ) => {
    return {
      x: (pdfX / pdfWidth) * canvasWidth,
      y: canvasHeight - (pdfY / pdfHeight) * canvasHeight
    };
  };


  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSignatureMode || !containerRef.current) {
      setGhostPos(null);
      return;
    }
  const rect = e.currentTarget.getBoundingClientRect()

  console.log("react" , rect)
  const boxWidth = 154;
  const boxHeight = 44;

  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  // Clamp X so the box never leaves page boundaries
  x = Math.max(0, Math.min(rect.width - boxWidth, x));

  // Clamp Y
  y = Math.max(0, Math.min(rect.height - boxHeight, y));

  setGhostPos({x , y})
  };

  const handlePdfClick = () => {
    if (!isSignatureMode || !containerRef.current || !ghostPos){
      console.log(isSignatureMode)
      console.log(containerRef.current)
      console.log(ghostPos)
      return;
    } 

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
  };

  useEffect(()=>{
    console.log(pdfDimensions)
  },[pdfDimensions])

  // ========================
  // Render
  useEffect(() => {
    if (contract) {
      setAnnotations(
        contract.annotations.map((annotation, index: number) => {         

          const {x , y} = convertPdfToWebCoordinates(annotation.x1 , annotation.y1+44 , pdfDimensions.width , pdfDimensions.height , pdfDimensions.width , pdfDimensions.height)

          console.log("📍 PDF → Web Conversion:");
          console.log("PDF:", {
            x1: annotation.x1,
            y1: annotation.y1,
            x2: annotation.x2,
            y2: annotation.y2,
          });

          return {
            id: index + 1,
            x,
            y,
            width : 154,
            height : 44, 
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

  const handleDocumentLoad = (e: DocumentLoadEvent) => {
    console.log("PDF Document loaded:", e);
  };

useEffect(() => {
  if (!contract?.document?.properties) {
    console.log(contract)
    return;
  }

  try {
    const props: PdfProperties = JSON.parse(contract.document.properties);

    console.log(props)

    if (typeof props.width === "number" && typeof props.height === "number") {
      setPdfDimensions({ width: props.width, height: props.height });
    }
  } catch (err) {
    console.error("Failed to parse PDF properties", err);
  }
}, [contract]);



  const [signContract, { isLoading: isSigningDocument }] =
    useSignContractMutation();

  const handleSignDocument = async () => {
    if (!signatureRef.current) {
      console.error("Signature Ref is NULL");
      return;
    }
    try {
      const dataUrl = await toPng(signatureRef.current, {
        cacheBust: true,
        skipFonts: false,
        width: 154,
        height: 44,
        style: {
          width: "154px",
          height: "44px",
        },
      });
      const blob = await (await fetch(dataUrl)).blob();

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
      await refetchContract();
      setPreviewSignature("")
      setPdfKey(Date.now())
      toast.success("🎉 Document has been signed successfully.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
    } catch (error) {
      toast.error("Failed to sign document.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      console.error("Error:", error);
    }
    setShowSignContractDialog(false);
  };

  const [showShareDocumentDialog, setShowShareDocumentDialog] = useState(false);
  const [hideAnnotationBox, setHideAnnotationBox] = useState(
    contract && contract?.signed_number > 0 ? true : false,
  );

  if (!contract) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderCircle className="h-[50px] w-[50px] animate-spin" />
      </div>
    );
  }

  const ShareDocumentButton = () => {
    return (
      <Button
        disabled={annotations.length === 0}
        onClick={() => {
          setShowShareDocumentDialog(true);
        }}
      >
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
        disabled={
          annotations
            ? contract.annotations.some(
                (annotation) =>
                  annotation.signer === userEmail && annotation.signed != null,
              )
            : false
        }
      >
        <Pen />
        Sign Document
      </Button>
    );
  };

  const handleDownloadDocument = (url: string) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DownloadDocumentButton = () => {
    return (
      <Button onClick={() => handleDownloadDocument(contract.signed_doc_url)}>
        <Download />
        Download Document
      </Button>
    );
  };

  return (
    <div>
      <Dialog
        open={showShareDocumentDialog}
        onOpenChange={setShowShareDocumentDialog}
      >
        <DialogContent className="w-[400px] gap-0 overflow-hidden p-0">
          <DialogTitle className="text-md text-midnight-gray-900 bg-[#F9F9FC] px-4 py-3">
            Send Document
          </DialogTitle>
          <div className="border-midnight-gray-200 flex flex-col gap-[20px] border-y-[1px] bg-white px-5 py-4">
            <div className="flex flex-col gap-2">
              <Label className="text-midnight-gray-900">
                Subject (Optional)
              </Label>
              <Input placeholder="Subject" className="bg-midnight-gray-100" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-midnight-gray-900">
                Message (Optional)
              </Label>
              <Textarea
                className="bg-midnight-gray-100"
                placeholder="Message"
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-[#F9F9FC] p-4">
            <Button
              onClick={() => setShowShareDocumentDialog(false)}
              variant={"outline"}
              disabled={patchingContract}
            >
              <span>Cancel</span>
            </Button>
            <Button onClick={handleSendDocument} isLoading={patchingContract}>
              <SendHorizonal />
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
                        ref={signatureRef}
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
                disabled={isSigningDocument}
              >
                <Trash />
                <span>Clear</span>
              </Button>

              <Button
                onClick={async () => {
                  await handleSignDocument();
                }}
                disabled={previewSignature.length == 0}
                isLoading={isSigningDocument}
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
        contractStatus={`${currentPage}`}
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
        <div className="flex h-[900px] w-full pt-[32px] no-scrollbar">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
                <Viewer
                  key={pdfKey}
                  fileUrl={
                    contract.signed_by.length > 0
                      ? contract.signed_doc_url
                      : contract.document.s3_url
                  }
                  defaultScale={1}
                  plugins={[
                    thumbnailPluginInstance,
                    pageNavigationPluginInstance,
                  ]}
                  onDocumentLoad={handleDocumentLoad}
                  renderPage={(props: RenderPageProps) => (
                    <CustomPageRender
                      annotations={
                        hideAnnotationBox
                          ? []
                          : annotations.filter(
                              (a) => a.page === props.pageIndex,
                            )
                      }
                      props={props}
                      ghostPos={ghostPos}
                      currentPage={currentPage}
                      previewSignature={previewSignature}
                      userEmail={userEmail}
                      ref={containerRef}
                      onMouseMove={handleMouseMove}
                      onClick={handlePdfClick}
                    />
                  )}
                  onPageChange={(e) => setCurrentPage(e.currentPage + 1)}
                />
              </Worker>
        </div>
        <div className="border-midnight-gray-200 min-w-[320px] overflow-clip rounded-lg border-[1.5px] bg-white">
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
          {/* Document MetaData Header */}
          {contract.status == "fully signed" && contract.blockchain_tx_hash && (
            <>
              <div className="bg-midnight-gray-50 border-midnight-gray-200 flex items-center border-b-[1px] px-5 py-4">
                <h3 className="text-midnight-gray-900 text-lg font-semibold">
                  Document MetaData
                </h3>
              </div>
              <div className="flex flex-col gap-3 bg-white px-5 py-4">
                <div className="flex flex-col gap-2">
                  <span className="text-midnight-gray-900 font-medium">
                    Transaction Hash
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-midnight-gray-600 w-[200] truncate">
                      {contract.blockchain_tx_hash}
                    </p>
                    <Copy className="text-midnight-gray-400 hover:text-midnight-gray-900 cursor-pointer transition-colors" />
                  </div>
                  <a
                    href={`https://preview.cardanoscan.io/transaction/${contract.blockchain_tx_hash}?tab=metadata`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View on cardanoscan
                  </a>
                </div>
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
          {/* Hide Annotations Toggle */}
          {contract.signed_number > 0 && (
            <div className="bg-midnight-gray-50 border-midnight-gray-200 flex items-center justify-between border-b-[1px] px-5 py-4">
              <div>
                <p className="text-midnight-gray-900 text-lg font-semibold">
                  Annotations
                </p>
                <p className="text-midnight-gray-600 text-sm">
                  Toggle to show or hide annotation boxes
                </p>
              </div>
              <Switch
                checked={!hideAnnotationBox}
                onCheckedChange={(checked) => setHideAnnotationBox(!checked)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
