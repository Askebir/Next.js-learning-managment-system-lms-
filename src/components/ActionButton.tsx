"use client";

import { ComponentPropsWithRef, ReactNode, useTransition } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ActionButton({
  action,
  requireAreYouSure,
  children,
  ...props
}: Omit<ComponentPropsWithRef<typeof Button>, "onClick"> & {
  action: () => Promise<unknown>;
  requireAreYouSure?: boolean;
}) {
  const [isLoading, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      await action();
    });
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button {...props}>
            <LoadingTextSwap isLoading={isLoading}>{children}</LoadingTextSwap>
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={isLoading}
              onClick={() => performAction()}
            >
              <LoadingTextSwap isLoading={isLoading}>Yes</LoadingTextSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button {...props} onClick={performAction}>
      <LoadingTextSwap isLoading={isLoading}>{children}</LoadingTextSwap>
    </Button>
  );
}

function LoadingTextSwap({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "invisible" : "visible",
        )}
      >
        {children}
      </div>

      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "visible" : "invisible",
        )}
      >
        <Loader2Icon className="animate-spin" />
      </div>
    </div>
  );
}
