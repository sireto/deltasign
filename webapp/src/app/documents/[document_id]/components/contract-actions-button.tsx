import { Download, Pen, SendHorizonal } from "lucide-react";
import { Button } from "@/shared/ui/button";

export interface ShareDocumentButtonProps {
  disabled?: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export function ShareDocumentButton({
  disabled = false,
  onClick,
  isLoading = false,
}: ShareDocumentButtonProps) {
  return (
    <Button disabled={disabled || isLoading} onClick={onClick}>
      <SendHorizonal />
      {isLoading ? "Sending..." : "Send Document"}
    </Button>
  );
}

export interface SignDocumentButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SignDocumentButton({
  onClick,
  disabled = false,
}: SignDocumentButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      <Pen />
      Sign Document
    </Button>
  );
}

export interface DownloadDocumentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  documentUrl?: string;
}

export function DownloadDocumentButton({
  onClick,
  disabled = false,
  isLoading = false,
}: DownloadDocumentButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || isLoading}>
      <Download />
      {isLoading ? "Downloading..." : "Download Document"}
    </Button>
  );
}

// Helper function to get the appropriate button based on contract status
export type ContractStatus = "draft" | "pending" | "fully signed";

export interface GetActionButtonProps {
  status: string;
  onShare: () => void;
  onSign: () => void;
  onDownload: () => void;
  shareDisabled?: boolean;
  shareLoading?: boolean;
  signDisabled?: boolean;
  downloadLoading?: boolean;
}

export function getContractActionButton({
  status,
  onShare,
  onSign,
  onDownload,
  shareDisabled = false,
  shareLoading = false,
  signDisabled = false,
  downloadLoading = false,
}: GetActionButtonProps): React.ComponentType {
  switch (status) {
    case "draft":
      return () => (
        <ShareDocumentButton
          disabled={shareDisabled}
          onClick={onShare}
          isLoading={shareLoading}
        />
      );
    case "fully signed":
      return () => (
        <DownloadDocumentButton
          onClick={onDownload}
          isLoading={downloadLoading}
        />
      );
    case "pending":
    default:
      return () => (
        <SignDocumentButton onClick={onSign} disabled={signDisabled} />
      );
  }
}