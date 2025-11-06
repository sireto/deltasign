export interface PDFAnnotation {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  signer: string;
}

export interface Signer {
  name: string;
  email: string;
}

export interface Tool {
  label: string;
  onClick: () => void;
}

export type ContractStatus = "draft" | "pending" | "fully signed";

export interface Contract {
  uuid: string;
  name: string;
  status: string;
  document: {
    s3_url: string;
  };
  signed_doc_url?: string;
  annotations: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    page: number;
    signer: string;
    color: string;
  }[];
  signers: string[];
}

// Patch contract request interface
export interface PatchContractRequest {
  name: string;
  annotations: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    signer: string;
    color: string;
    page: number;
  }[];
  signers: string[];
  message: string;
}

// PDF dimensions constants
export const PDF_CONSTANTS = {
  WIDTH: 612,
  HEIGHT: 792,
  ANNOTATION_WIDTH: 154,
  ANNOTATION_HEIGHT: 44,
} as const;