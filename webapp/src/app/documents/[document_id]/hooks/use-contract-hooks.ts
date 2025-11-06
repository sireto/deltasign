import { useState, useCallback, useEffect } from "react";
import { PDF_CONSTANTS, PDFAnnotation } from "../../types";

export interface Signer {
  name: string;
  email: string;
}

// Hook for managing PDF annotations
export function useContractAnnotations(contract: any) {
  const [annotations, setAnnotations] = useState<PDFAnnotation[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    if (contract?.annotations) {
      setAnnotations(
        contract.annotations.map((annotation: any, index: number) => ({
          id: index + 1,
          x: annotation.x1,
          y: PDF_CONSTANTS.HEIGHT -  annotation.y1,
          height: 44,
          width: 154,
          page: annotation.page,
          signer: annotation.signer,
        }))
      );
      setNextId(contract.annotations.length + 1);
    }
  }, [contract]);

  const addAnnotation = useCallback(
    (annotation: Omit<PDFAnnotation, "id">) => {
      const newAnnotation: PDFAnnotation = {
        ...annotation,
        id: nextId,
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
      setNextId((prev) => prev + 1);
    },
    [nextId]
  );

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

  return {
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  };
}

// Hook for managing contract signers
export function useContractSigners(contract: any, userEmail: string, userName: string) {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [addMyselfChecked, setAddMyselfChecked] = useState(false);

  useEffect(() => {
    if (contract?.signers) {
      const signersList = contract.signers.map((signer: string) => ({
        name: "User",
        email: signer,
      }));
      setSigners(signersList);
      
      setAddMyselfChecked(signersList.some((s: Signer) => s.email === userEmail));
    }
  }, [contract, userEmail]);

  const addSigner = useCallback((signer: Signer) => {
    setSigners((prev) => {
      if (prev.some((s) => s.email === signer.email)) return prev;
      return [...prev, signer];
    });
  }, []);

  const addRemoveSelfToSignersList = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSigners((prev) => {
          if (prev.some((s) => s.email === userEmail)) return prev;
          return [...prev, { email: userEmail, name: userName }];
        });
      } else {
        setSigners((prev) => prev.filter((s) => s.email !== userEmail));
      }
      setAddMyselfChecked(checked);
    },
    [userEmail, userName]
  );

  return {
    signers,
    addMyselfChecked,
    addSigner,
    addRemoveSelfToSignersList,
  };
}

// Hook for managing signature mode
export function useSignatureMode() {
  const [isSignatureMode, setIsSignatureMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState("");
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

  const enableSignatureMode = useCallback(() => {
    setIsSignatureMode(true);
    setSelectedTool("Signature");
  }, []);

  const disableSignatureMode = useCallback(() => {
    setIsSignatureMode(false);
    setSelectedTool("");
    setGhostPos(null);
  }, []);

  return {
    isSignatureMode,
    selectedTool,
    ghostPos,
    setGhostPos,
    setIsSignatureMode,
    setSelectedTool,
    enableSignatureMode,
    disableSignatureMode,
  };
}

// Hook for managing pending annotation position
export function usePendingAnnotation() {
  const [pendingAnnotationPos, setPendingAnnotationPos] = useState<{
    x: number;
    y: number;
    pageIndex: number;
  } | null>(null);

  const setPendingPosition = useCallback((pos: { x: number; y: number; pageIndex: number }) => {
    setPendingAnnotationPos(pos);
  }, []);

  const clearPendingPosition = useCallback(() => {
    setPendingAnnotationPos(null);
  }, []);

  return {
    pendingAnnotationPos,
    setPendingPosition,
    clearPendingPosition,
  };
}