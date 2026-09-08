import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type FlowCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

type FlowCardActionsProps = {
  children: ReactNode;
  className?: string;
};

type FlowCardActionProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  size?: "md" | "lg";
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  variant?: "primary" | "secondary" | "disabled";
};

export function FlowCard({ children, className, ...props }: FlowCardProps) {
  return (
    <section {...props} className={cn("rounded-[var(--figma-radius-sm)] bg-white shadow-[var(--figma-shadow-card)]", className)}>
      {children}
    </section>
  );
}

export function FlowCardActions({ children, className }: FlowCardActionsProps) {
  return <div className={cn("flex flex-wrap gap-[var(--figma-space-sm)]", className)}>{children}</div>;
}

export function FlowCardAction({
  children,
  className,
  disabled = false,
  href,
  onClick,
  size = "md",
  type = "button",
  variant = "primary",
}: FlowCardActionProps) {
  const resolvedVariant = disabled ? "disabled" : variant;
  const actionClassName = cn(
    "flex min-w-0 flex-1 items-center justify-center rounded-[var(--figma-radius-md)] text-center disabled:text-[var(--figma-color-text-disabled)]",
    size === "lg" ? "h-[52px] text-heading-md" : "h-11 text-label-md",
    resolvedVariant === "primary" && "bg-[var(--figma-color-action-primary)] text-white disabled:bg-[var(--figma-color-action-disabled)]",
    resolvedVariant === "secondary" && "border border-[var(--figma-color-border-strong)] bg-white text-[var(--figma-color-text-primary)]",
    resolvedVariant === "disabled" && "bg-[var(--figma-color-action-disabled)] text-[var(--figma-color-text-disabled)]",
    className,
  );

  if (href && !disabled) {
    return (
      <Link className={actionClassName} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={actionClassName} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
