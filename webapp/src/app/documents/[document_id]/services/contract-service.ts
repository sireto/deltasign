import { toPng } from "html-to-image";
import { PDFAnnotation, PatchContractRequest, Contract, PDF_CONSTANTS } from "../../types/index";
// import Signer

export class ContractService {
  /**
   * Prepare contract data for patching
   */
  static preparePatchData(
    contract: Contract,
    annotations: PDFAnnotation[],
    signers: any[]
  ): PatchContractRequest {
    return {
      name: contract.name,
      annotations: annotations.map((annotation) => (
        {
        x1: annotation.x,
        y1: PDF_CONSTANTS.HEIGHT - annotation.y,
        x2: annotation.x + annotation.width,
        y2: (PDF_CONSTANTS.HEIGHT - annotation.y ) + annotation.width,
        signer: annotation.signer,
        color: "#000",
        page: annotation.page,
      })),
      signers: signers.map((signer) => signer.email),
      message: "",
    };
  }

  static async exportSignatureAsFormData(
    signatureRef: React.RefObject<HTMLDivElement|null>
  ): Promise<FormData | null> {
    if (!signatureRef.current) {
      console.error("Signature ref is not available");
      return null;
    }

    try {
      const dataUrl = await toPng(signatureRef.current, {
        cacheBust: true,
        skipFonts: false,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      
      const formData = new FormData();
      formData.append("file", blob, "signature.png");
      
      return formData;
    } catch (error) {
      console.error("Failed to export signature:", error);
      return null;
    }
  }

  /**
   * Calculate ghost position for annotation placement
   */
  static calculateGhostPosition(
    e: React.MouseEvent,
    containerRef: React.RefObject<HTMLDivElement|null>
  ): { x: number; y: number } | null {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }

  /**
   * Calculate annotation position from ghost position
   */
  static calculateAnnotationPosition(ghostPos: {
    x: number;
    y: number;
  }): { x: number; y: number } {
    // Offset by half of annotation dimensions to center it
    return {
      x: ghostPos.x,
      y: ghostPos.y,
    };
  }

  /**
   * Get the appropriate file URL based on contract status
   */
  static getFileUrl(contract: Contract): string {
    return contract.status === "fully signed"
      ? contract.signed_doc_url || contract.document.s3_url
      : contract.document.s3_url;
  }

  /**
   * Check if annotations should be visible based on contract status
   */
  static shouldShowAnnotations(contractStatus: string): boolean {
    return contractStatus !== "fully signed";
  }
}