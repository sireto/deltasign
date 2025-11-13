import { number } from "framer-motion";
import { Document } from "../types/document";

export interface Annotation {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  signer: string;
  page: number;
  color: string;
  signed: string | null;
}

export interface Contract {
  uuid: string;
  name: string;
  document: Document;
  signed_doc_url: string;
  message: string;
  created_date: string;
  status: string;
  signers: string[];
  annotations: Annotation[];
  signed_number: number;
  blockchain_tx_hash: string;
  creator: string;
}

export interface PostContractRequest {
  name: string;
  document_uuid: string;
  message: string;
  signers: string[];
  annotations: Annotation[];
}

export interface PatchContractRequest {
  name: string;
  annotations: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    signer: string;
    page: number;
    color: string;
  }[];
  signers: string[];
  message: string;
}

export interface CountractsCountResponse {
  draft : number
  pending : number
  "fully signed" : number
  total : number
}