"use client";

import { usePathname } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import NavBar from "./components/nav-bar";
import {
  useGetContractByIdQuery,
  usePatchContractMutation,
  useSignContractMutation,
} from "../api/contracts";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/store/store";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { useRef, useState } from "react";
import localFont from "next/font/local";
import AddSignerDialog from "./components/add-signer-dialog";
import SignContractDialog from "./components/sign-contract-dialog";
import { getContractActionButton } from "./components/contract-actions-button";
import ThumbnailsSidebar from "./components/thumbnails-sidebar";
import PDFViewer from "./components/pdf-viewer";
import ContractSidebar from "./components/side-bar";
import {
  useContractAnnotations,
  useContractSigners,
  useSignatureMode,
  usePendingAnnotation,
} from "./hooks/use-contract-hooks";
import { ContractService } from "./services/contract-service";
import { PDFAnnotation, Tool } from "../types";

const signatureFont = localFont({
  src: "../../../../public/fonts/Madeva Suarte Signature Font.ttf",
});

export default function ContractPage() {
  const pathName = usePathname();
  const contractId = pathName.split("/")[2];

  const [pdfDimensions, setPdfDimensions] = useState({
    width: 612,
    height: 792,
  });
  const [scaleFactor, setScaleFactor] = useState(0.75);
  const annotationDimensions = { height: 44, width: 154 };

  // API queries
  const { data: contract, isLoading: isLoadingContract } =
    useGetContractByIdQuery({ uuid: contractId });
  const [patchContract, { isLoading: isPatchingContract }] =
    usePatchContractMutation();
  const [signContract] = useSignContractMutation();

  // Redux state
  const { userName, userEmail } = useSelector((state: RootState) => ({
    userName: state.user.name,
    userEmail: state.user.email,
  }));

  // Custom hooks
  const { annotations, addAnnotation, updateAnnotation, deleteAnnotation } =
    useContractAnnotations(contract);
  const { signers, addMyselfChecked, addSigner, addRemoveSelfToSignersList } =
    useContractSigners(contract, userEmail, userName);
  const {
    isSignatureMode,
    selectedTool,
    ghostPos,
    setGhostPos,
    enableSignatureMode,
    disableSignatureMode,
  } = useSignatureMode();
  const { pendingAnnotationPos, setPendingPosition, clearPendingPosition } =
    usePendingAnnotation();

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddSignerDialog, setShowAddSignerDialog] = useState(false);
  const [showSignContractDialog, setShowSignContractDialog] = useState(false);
  const [userHasSigned, setUserHasSigned] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);

  // PDF plugins
  const thumbnailPluginInstance = thumbnailPlugin({});
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Tools configuration
  const tools: Tool[] = [
    {
      label: "Signature",
      onClick: enableSignatureMode,
    },
  ];

  // Handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSignatureMode) {
      setGhostPos(null);
      return;
    }
    const pos = ContractService.calculateGhostPosition(e, containerRef);
    setGhostPos(pos);
  };

  const handlePdfClick = (e: React.MouseEvent) => {
    if (!isSignatureMode || !ghostPos) return;

    const annotationPos = ContractService.calculateAnnotationPosition(ghostPos);
    setPendingPosition({
      x: annotationPos.x,
      y: annotationPos.y,
      pageIndex: currentPage - 1,
    });

    setShowAddSignerDialog(true);
    disableSignatureMode();
  };

  const handleAddSigner = (signerData: { name: string; email: string }) => {
    if (!pendingAnnotationPos) return;

    const newAnnotation: Omit<PDFAnnotation, "id"> = {
      x: pendingAnnotationPos.x,
      y: pendingAnnotationPos.y,
      width: annotationDimensions.width,
      height: annotationDimensions.height,
      page: pendingAnnotationPos.pageIndex,
      signer: signerData.name || signerData.email,
    };

    addAnnotation(newAnnotation);
    addSigner(signerData);
    clearPendingPosition();
    setShowAddSignerDialog(false);
  };

  const handleThumbnailClick = (pageIndex: number) => {
    setCurrentPage(pageIndex + 1);
    jumpToPage(pageIndex);
  };

  const handleSendDocument = async () => {
    if (!contract) return;

    const patchData = ContractService.preparePatchData(
      contract,
      annotations,
      signers,
    );

    try {
      await patchContract({
        uuid: contract.uuid,
        patchContractRequest: patchData,
        alert_users: true,
      }).unwrap();
      console.log("Document sent successfully");
    } catch (err) {
      console.error("Failed to send document:", err);
    }
  };

  const handleSign = async (signature: string) => {
    const formData =
      await ContractService.exportSignatureAsFormData(signatureRef);
    if (!formData) {
      console.error("Failed to export signature");
      return;
    }

    try {
      await signContract({ uuid: contractId, formData }).unwrap();
      setUserHasSigned(true);
      setShowSignContractDialog(false);
      console.log("Document signed successfully");
    } catch (error) {
      console.error("Failed to sign document:", error);
      throw error;
    }
  };

  const handleDownloadDocument = () => {
    if (contract?.signed_doc_url) {
      window.open(contract.signed_doc_url, "_blank");
    }
  };

  // Loading state
  if (!contract || isLoadingContract) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoaderCircle className="h-[50px] w-[50px] animate-spin" />
      </div>
    );
  }

  const fileUrl = ContractService.getFileUrl(contract);
  const visibleAnnotations = ContractService.shouldShowAnnotations(
    contract.status,
  )
    ? annotations
    : [];

  return (
    <div>
      {/* Dialogs */}
      <AddSignerDialog
        open={showAddSignerDialog}
        onOpenChange={setShowAddSignerDialog}
        onConfirm={handleAddSigner}
      />

      <SignContractDialog
        open={showSignContractDialog}
        onOpenChange={setShowSignContractDialog}
        onSign={handleSign}
        signatureFontClassName={signatureFont.className}
        signatureRef={signatureRef}
      />

      {/* Navigation Bar */}
      <NavBar
        className="sticky top-0"
        fileName={contract.name}
        RenderButton={getContractActionButton({
          status: contract.status,
          onShare: handleSendDocument,
          onSign: () => setShowSignContractDialog(true),
          onDownload: handleDownloadDocument,
          shareDisabled: annotations.length === 0,
          shareLoading: isPatchingContract,
        })}
      />

      <div className="flex h-full w-full justify-between px-3 pt-3">
        {/* Thumbnails Sidebar */}
        <ThumbnailsSidebar
          currentPage={currentPage}
          onThumbnailClick={handleThumbnailClick}
          thumbnailPluginInstance={thumbnailPluginInstance}
        />

        {/* PDF Viewer */}
        <PDFViewer
          fileUrl={fileUrl}
          annotations={visibleAnnotations}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          updateAnnotation={updateAnnotation}
          deleteAnnotation={deleteAnnotation}
          ghostPos={ghostPos}
          userHasSigned={userHasSigned}
          previewSignature=""
          userEmail={userEmail}
          signatureRef={signatureRef}
          onPdfClick={handlePdfClick}
          onMouseMove={handleMouseMove}
          thumbnailPluginInstance={thumbnailPluginInstance}
          pageNavigationPluginInstance={pageNavigationPluginInstance}
          containerRef={containerRef}
        />

        {/* Contract Sidebar */}
        <ContractSidebar
          contractStatus={contract.status}
          contractName={contract.name}
          tools={tools}
          selectedTool={selectedTool}
          signers={signers}
          userEmail={userEmail}
          addMyselfChecked={addMyselfChecked}
          onAddRemoveSelf={addRemoveSelfToSignersList}
        />
      </div>
    </div>
  );
}
