import { useState } from "react";
import { Trash } from "lucide-react";
import emailvalidator from "email-validator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

export interface AddSignerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (signerData: { name: string; email: string }) => void;
  pendingPosition?: {
    x: number;
    y: number;
    pageIndex: number;
  } | null;
}

export default function AddSignerDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddSignerDialogProps) {
  const [signerEmail, setSignerEmail] = useState("");
  const [signerName, setSignerName] = useState("");

  const handleConfirm = () => {
    if (!emailvalidator.validate(signerEmail)) return;

    onConfirm({
      name: signerName,
      email: signerEmail,
    });

    // Reset form
    setSignerEmail("");
    setSignerName("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setSignerEmail("");
    setSignerName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button variant="destructive" onClick={handleCancel}>
              <Trash />
              <span>Cancel</span>
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!emailvalidator.validate(signerEmail)}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
