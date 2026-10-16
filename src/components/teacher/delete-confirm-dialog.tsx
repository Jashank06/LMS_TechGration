"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"

interface DeleteConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  itemName?: string
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  title,
  description,
  itemName,
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-3xl border border-destructive/30 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight text-center text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground text-center leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        {itemName && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center my-2">
            <p className="text-xs font-semibold text-destructive truncate">
              &quot;{itemName}&quot;
            </p>
          </div>
        )}

        <DialogFooter className="pt-2 sm:justify-center flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl text-xs h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl text-xs h-10 font-bold bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
