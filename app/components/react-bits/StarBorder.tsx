import type { AnchorHTMLAttributes, CSSProperties, ReactNode } from "react";

type StarBorderProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  color?: string;
  speed?: string;
  thickness?: number;
  children: ReactNode;
};

export default function StarBorder({
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  children,
  style,
  ...rest
}: StarBorderProps) {
  const containerStyle: CSSProperties = {
    padding: `${thickness}px 0`,
    ...style,
  };

  const starStyle: CSSProperties = {
    background: `linear-gradient(90deg, transparent, ${color} 50%, transparent)`,
    animationDuration: speed,
  };

  return (
    <a
      className={`star-border-container ${className}`}
      style={containerStyle}
      {...rest}
    >
      <span className="border-gradient-bottom" style={starStyle} aria-hidden="true" />
      <span className="border-gradient-top" style={starStyle} aria-hidden="true" />
      <span className="star-border-content">{children}</span>
    </a>
  );
}
