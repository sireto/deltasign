"use client";

import { usePathname } from "next/navigation";
import {
  ChevronUp,
  LoaderCircle,
  Trash,
} from "lucide-react";
import NavBar from "./components/nav-bar";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useGetContractByIdQuery, usePatchContractMutation } from "../api/contracts";
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
import { Rnd } from "react-rnd";
import React from "react";
import { Alex_Brush } from "next/font/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import emailvalidator from "email-validator";
import { PatchContractRequest } from "../types/contract";
interface Annotation {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page : number;
  signer: string;
}

const alexBrush = Alex_Brush({
  weight : "400",
  subsets : ["latin"]
})

const CustomPageRender = React.memo(
  ({
    props,
    annotations,
    updateAnnotation,
    ghostPos,
    currentPage,
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
            className="border-silicon ring-silicon/20 pointer-events-none absolute flex h-[44px] w-[154px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
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

        {/* Actual Annotations */}
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
                parseFloat(ref.style.height)
              )
            }
            style={{
              cursor: "move",
            }}
            className="border-silicon ring-silicon/20 -translate-x-1/2 -translate-y-1/2 rounded-[8px] border-[1.5px] ring-[2px] ring-offset-[1px]"
          >
            <div className="text-xs font-semibold flex items-center justify-center text-center w-full">
              <span className="text-midnight-gray-900 font-[500] break-all">
                {ann.signer}
              </span>
            </div>
          </Rnd>
        ))}
      </div>
    );
  }
);

// ========================
// Page Component
// ========================
export default function Page() {
  const pathName = usePathname();
  
  const contractId = pathName.split("/")[2];
  const { data: contract } = useGetContractByIdQuery({ uuid: contractId });

  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>(() =>
    contract?.annotations?.map((annotation, index) => ({
      id: index + 1,
      x: annotation.x1,
      y: annotation.y1,
      height : annotation.y2 - annotation.y1,
      width : annotation.x2 - annotation.x1,
      page: annotation.page,
      signer: annotation.signer,
    })) || []
  );
  const [signers, setSigners] = useState<{ email: string; name: string }[]>(() =>
  contract?.signers?.map((signer) => ({
    name: "User", // or use signer.name if available in your data
    email: signer,
  })) || []
);

  
  const [nextId, setNextId] = useState(1);
  const [selectedTool, setSelectedTool] = useState("");
  const [addMyselfChecked , setAddMyselfChecked] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null);

  const [showAddSignerDialog, setShowAddSignerDialog] = useState(false);

  const [showSignContractDialog , setShowSignContractDialog] = useState(false)

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
    null
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
    setAddMyselfChecked(!addMyselfChecked)
  };

  const thumbnailPluginInstance = thumbnailPlugin({});
  const { Thumbnails } = thumbnailPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const [patchContract , {isLoading , isSuccess , error}] = usePatchContractMutation();

  const [fullName , setFullName] = useState("")

  const handleSendDocument = async () => {
    if (!contract) {
      return
    }
    const patchContractData : PatchContractRequest = {
      name : contract.name,
      annotations : annotations.map((annotation) => ({
        x1 : annotation.x,
        y1 : annotation.y,
        x2 : annotation.x + annotation.width,
        y2 : annotation.y + annotation.height,
        signer : annotation.signer,
        color : "#000",
        page : annotation.page
      })),
      signers : signers.map((signer) => signer.email),
      message : ""
    }
    console.log(patchContractData)
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
  }

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
      x: ghostPos.x - 77,
      y: ghostPos.y - 22,
      pageIndex: currentPage - 1,
    });

    setShowAddSignerDialog(true);
    setGhostPos(null);
    setIsSignatureMode(false);
    setSelectedTool("");
  };

  const handleConfirmSigner = () => {
    if (!pendingAnnotationPos) return;

    const newAnnotation: Annotation = {
      id: nextId,
      x: pendingAnnotationPos.x,
      y: pendingAnnotationPos.y,
      width: 154,
      height: 44,
      page : pendingAnnotationPos.pageIndex,
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

    if (signerEmail === userEmail){
      setAddMyselfChecked(true)
    }
  };

  const handleThumbnailClick = (pageIndex: number) => {
    setCurrentPage(pageIndex + 1);
    jumpToPage(pageIndex);
  };

  const updateAnnotation = useCallback(
    (id: number, x: number, y: number, width: number, height: number) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, x, y, width, height } : a))
      );
    },
    []
  );

  const deleteAnnotation = useCallback((id: number) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ========================
  // Render
  useEffect(() => {
  if (contract) {
    setAnnotations(
      contract.annotations.map((annotation: any, index: number) => ({
        id: index + 1,
        x: annotation.x1,
        y: annotation.y1,
        height: annotation.y2 - annotation.y1,
        width: annotation.x2 - annotation.x1,
        page: annotation.page,
        signer: annotation.signer,
      }))
    );

    setSigners(
      contract.signers.map((signer: string) => ({
        name: "User",
        email: signer,
      }))
    );
    }
  }, [contract]);
  // ========================
  if (!contract) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderCircle className="h-[50px] w-[50px] animate-spin" />
      </div>
    );
  }


  return (
    <div>
      {/* Add Signer Dialog */}
      <Dialog open={showAddSignerDialog} onOpenChange={setShowAddSignerDialog}>
        <DialogContent className="w-[400px] p-0 overflow-hidden gap-0">
          <DialogTitle className="text-md px-4 py-3 bg-[#F9F9FC] text-midnight-gray-900">
            Add Signer
          </DialogTitle>
          <div>
            <div className="py-6 bg-white border-midnight-gray-200 flex flex-col gap-3 border-y px-4">
              {/* <div className="flex flex-col gap-2">
                <Label className="text-midnight-gray-900">Name</Label>
                <Input
                  placeholder="Full Name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                />
              </div> */}
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
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#F9F9FC]">
              <Button
                variant="destructive"
                onClick={() => setShowAddSignerDialog(false)}
              >
                <Trash />
                <span>Cancel</span>
              </Button>
              <Button onClick={handleConfirmSigner} disabled={!emailvalidator.validate(signerEmail)}>Confirm</Button>         
            </div>
          </div>
        </DialogContent>
      </Dialog>


          <Dialog open={showSignContractDialog} onOpenChange={setShowSignContractDialog}>
      <DialogContent className="w-[500px] p-0 overflow-hidden gap-0">
        <DialogTitle className="text-md px-4 py-3 bg-[#F9F9FC] text-midnight-gray-900">
          Add Signature
        </DialogTitle>

        <div>
          {/* Signature Input Section */}
          <div className="py-6 bg-white border-midnight-gray-200 flex flex-col gap-3 border-y px-4">
            <div className="flex flex-col gap-3">
              <Label className="text-midnight-gray-900">
                Type signature (Full Name)
              </Label>
                {/* Signature Preview Section */}
                <div className="bg-[#FAFAFC] border-b border-midnight-gray-200 py-6 px-4 text-center">
                  <Label className="text-midnight-gray-900 mb-2 block">Preview</Label>
                  <div className="border border-dashed border-midnight-gray-300 rounded-md p-4 bg-white">
                    {fullName ? (
                      <p
                        className={`${alexBrush.className} text-5xl text-midnight-gray-900 italic`}
                      >
                        {fullName}
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
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={10}
              />

              <p className="text-sm text-midnight-gray-600">
                I understand Delta Sign uses my name, email and other information to complete
                the signature process and enhance the user experience. To learn more about
                how Delta Sign uses information, please visit Privacy Policy.
              </p>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-[#F9F9FC]">
            <Button
              variant="outline"
              onClick={() => {
                setFullName("");
                setShowAddSignerDialog(false);
              }}
            >
              <Trash />
              <span>Clear</span>
            </Button>

            <Button
              onClick={handleConfirmSigner}
              disabled={!emailvalidator.validate(signerEmail)}
            >
              Accept & Sign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>


      <NavBar className="sticky top-0" fileName={contract.name} disabledSendDocument={annotations.length == 0} onSendDocument={handleSendDocument}/>
      <div className="flex h-full w-full justify-between p-3">
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
                      "mb-2 overflow-hidden rounded-[4px]"
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
        <div className="flex h-[678px] w-[612px] py-[32px]">
          <div className="no-scrollbar flex-1 overflow-hidden rounded-[12px] border border-gray-200">
            <div
              ref={containerRef}
              onClick={handlePdfClick}
              className="relative h-full w-full flex-1 bg-yellow-100"
              onMouseMove={handleMouseMove}
            >
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={contract.document.s3_url}
                  plugins={[
                    thumbnailPluginInstance,
                    pageNavigationPluginInstance,
                  ]}
                  renderPage={(props: RenderPageProps) => (
                    <CustomPageRender
                      annotations={annotations.filter(
                        (a) => a.page === props.pageIndex
                      )}
                      props={props}
                      updateAnnotation={updateAnnotation}
                      deleteAnnotation={deleteAnnotation}
                      ghostPos={ghostPos}
                      currentPage={currentPage}
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
            {contract.status === "draft" && <>
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
                      selectedTool === tool.label && "border-blue-400"
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
            }


            <div className="bg-midnight-gray-50 border-midnight-gray-200 flex items-center gap-4 border-b-[1px] px-5 py-4">
              <div>
                <p className="text-midnight-gray-900 text-lg font-[600]">
                  Signers
                </p>
                <p className="text-midnight-gray-600 text-sm">
                  List of people who will sign the document
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-white px-5 py-3">
              { contract.status === "draft" &&
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
                }
              

              {signers.map((signer, index) => (
                <div className="flex gap-3" key={index}>
                  <Image
                    src="/placeholder.png"
                    alt="placeholder"
                    height={36}
                    width={36}
                    className="rounded-full"
                    />
                  <div className="flex flex-col">
                    <span className="text-midnight-gray-900 text-xs font-[600]">
                      {signer.name || "User"}
                    </span>
                    <span className="text-midnight-gray-600 text-xs">
                      {signer.email}
                    </span>
                  </div>
                  {
                    contract.status == "pending" && 
                    <Button variant={"outline"} onClick={()=>{setShowSignContractDialog(true)}}>
                      Sign
                    </Button>
                  }
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
