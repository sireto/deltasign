import { useState, forwardRef } from "react";
import { Check, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export interface SignContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSign: (signature: string) => void | Promise<void>;
  signatureFontClassName?: string;
  signatureRef?: React.RefObject<HTMLDivElement | null>;
}

export default function SignContractDialog({
  open,
  onOpenChange,
  onSign,
  signatureFontClassName,
  signatureRef,
}: SignContractDialogProps) {
  const [previewSignature, setPreviewSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClear = () => {
    setPreviewSignature("");
  };

  const handleAcceptAndSign = async () => {
    if (!previewSignature) return;

    setIsSubmitting(true);
    try {
      await onSign(previewSignature);
      // Reset form after successful submission
      setPreviewSignature("");
    } catch (error) {
      console.error("Failed to sign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setPreviewSignature("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  <div ref={signatureRef}>
                    {previewSignature ? (
                      <p
                        className={`${signatureFontClassName || ""} text-midnight-gray-900 text-5xl italic`}
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
              </div>

              <Input
                placeholder="Full name"
                value={previewSignature}
                onChange={(e) => setPreviewSignature(e.target.value)}
                maxLength={50}
                disabled={isSubmitting}
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
              onClick={handleClear}
              disabled={isSubmitting}
            >
              <Trash />
              <span>Clear</span>
            </Button>

            <Button
              onClick={handleAcceptAndSign}
              disabled={previewSignature.length === 0 || isSubmitting}
              className="gap-1"
            >
              <Check />
              {isSubmitting ? "Signing..." : "Accept & Sign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
