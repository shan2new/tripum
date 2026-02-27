"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { BilingualText } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

interface SkipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepTitle: BilingualText;
  consequence: BilingualText | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function SkipDialog({
  open,
  onOpenChange,
  stepTitle,
  consequence,
  onConfirm,
  loading,
}: SkipDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-4 max-w-sm rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Skip {t(stepTitle)}?
          </DialogTitle>
          {consequence && (
            <DialogDescription className="text-sm leading-relaxed text-zinc-600">
              {t(consequence)}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700"
          >
            {loading ? "Skipping..." : "Skip"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
