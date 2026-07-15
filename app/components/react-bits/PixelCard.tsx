import type { FocusEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

type PixelCardProps = {
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children?: ReactNode;
};

class Pixel {
  private readonly context: CanvasRenderingContext2D;
  private readonly x: number;
  private readonly y: number;
  private readonly color: string;
  private readonly speed: number;
  private readonly maxSize: number;
  private readonly delay: number;
  private readonly counterStep: number;
  private size = 0;
  private readonly sizeStep = Math.random() * 0.4;
  private readonly minSize = 0.5;
  private counter = 0;
  private isReverse = false;
  private isShimmer = false;
  isIdle = false;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.context = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.random(0.1, 0.9) * speed;
    this.maxSize = this.random(this.minSize, 2);
    this.delay = delay;
    this.counterStep = Math.random() * 4 + (canvas.width + canvas.height) * 0.01;
  }

  private random(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  private draw() {
    const centerOffset = 1 - this.size * 0.5;
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  private shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    if (this.size <= this.minSize) this.isReverse = false;
    this.size += this.isReverse ? -this.speed : this.speed;
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) this.isShimmer = true;
    this.isShimmer ? this.shimmer() : (this.size += this.sizeStep);
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size -= 0.1;
    this.draw();
  }
}

function effectiveSpeed(value: number, reducedMotion: boolean) {
  if (value <= 0 || reducedMotion) return 0;
  return Math.min(value, 100) * 0.001;
}

export default function PixelCard({
  gap = 5,
  speed = 35,
  colors = "#f8fafc,#f1f5f9,#cbd5e1",
  noFocus = false,
  className = "",
  children,
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const previousTimeRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const initPixels = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const context = canvas.getContext("2d");
    if (!context || width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const palette = colors.split(",");
    const pixels: Pixel[] = [];

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const dx = x - width / 2;
        const dy = y - height / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy);
        const color = palette[Math.floor(Math.random() * palette.length)] ?? "#ffffff";
        pixels.push(
          new Pixel(canvas, context, x, y, color, effectiveSpeed(speed, reducedMotionRef.current), delay),
        );
      }
    }
    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    const frame = (time: number) => {
      animationRef.current = requestAnimationFrame(frame);
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context || time - previousTimeRef.current < 1000 / 60) return;
      previousTimeRef.current = time;
      context.clearRect(0, 0, canvas.width, canvas.height);

      let allIdle = true;
      pixelsRef.current.forEach((pixel) => {
        pixel[mode]();
        if (!pixel.isIdle) allIdle = false;
      });
      if (allIdle && animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };

    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    previousTimeRef.current = performance.now();
    initPixels();
    const observer = new ResizeObserver(initPixels);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [initPixels]);

  function handleFocus(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) animate("appear");
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) animate("disappear");
  }

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${className}`}
      onMouseEnter={() => animate("appear")}
      onMouseLeave={() => animate("disappear")}
      onFocus={noFocus ? undefined : handleFocus}
      onBlur={noFocus ? undefined : handleBlur}
      tabIndex={noFocus ? -1 : 0}
    >
      <canvas className="pixel-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="pixel-card-content">{children}</div>
    </div>
  );
}
