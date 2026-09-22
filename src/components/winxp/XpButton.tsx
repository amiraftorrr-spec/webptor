import React, { ButtonHTMLAttributes } from "react";
import { xpAudio } from "@/lib/xp-sound";

interface XpButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "warning" | "danger";
  sound?: boolean;
}

export function XpButton({
  children,
  className = "",
  variant = "default",
  sound = true,
  onClick,
  disabled,
  ...props
}: XpButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (sound) xpAudio.playClickSound();
    onClick?.(e);
  };

  const variantStyles = {
    default: "xp-btn-default",
    primary: "xp-btn-primary font-bold",
    warning: "xp-btn-warning",
    danger: "xp-btn-danger",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`xp-btn ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
