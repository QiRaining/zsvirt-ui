"use client";
import * as React from "react";

import type { ButtonProps } from "./button";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "./dialog";

const AlertDialog = Dialog;
const AlertDialogTrigger = DialogTrigger;
const AlertDialogPortal = DialogPortal;
const AlertDialogOverlay = DialogOverlay;

export interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogContent
> {}
const AlertDialogContent = DialogContent;

export interface AlertDialogHeaderProps extends React.ComponentPropsWithoutRef<
  typeof DialogHeader
> {}
const AlertDialogHeader = DialogHeader;

export interface AlertDialogFooterProps extends React.ComponentPropsWithoutRef<
  typeof DialogFooter
> {}
const AlertDialogFooter = DialogFooter;

export interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<
  typeof DialogTitle
> {}
const AlertDialogTitle = DialogTitle;

export interface AlertDialogDescriptionProps extends React.ComponentPropsWithoutRef<
  typeof DialogDescription
> {}
const AlertDialogDescription = DialogDescription;

const AlertDialogAction = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <DialogClose asChild>
      <Button ref={ref} {...props} />
    </DialogClose>
  ),
);
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => (
    <DialogClose asChild>
      <Button variant="secondary" ref={ref} {...props} />
    </DialogClose>
  ),
);
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
