import type { CSSProperties, ReactNode } from "react";

type GlitchTextProps = {
  children: ReactNode;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
};

type GlitchStyles = CSSProperties & {
  "--after-duration": string;
  "--before-duration": string;
  "--after-shadow": string;
  "--before-shadow": string;
};

export default function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = "",
}: GlitchTextProps) {
  const inlineStyles: GlitchStyles = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
    "--after-shadow": enableShadows ? "-5px 0 #ff2b00" : "none",
    "--before-shadow": enableShadows ? "5px 0 #00ecff" : "none",
  };

  return (
    <span
      className={`glitch-text ${enableOnHover ? "enable-on-hover" : ""} ${className}`}
      style={inlineStyles}
      data-text={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}
