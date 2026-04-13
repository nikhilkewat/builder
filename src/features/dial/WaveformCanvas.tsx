"use client";

import { useEffect, useRef } from "react";

type WaveformCanvasProps = {
  className?: string;
  speaking: boolean;
  accent?: "agent" | "customer";
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function WaveformCanvas({
  className,
  speaking,
  accent = "agent",
}: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speakingRef = useRef(speaking);
  const accentRef = useRef(accent);

  speakingRef.current = speaking;
  accentRef.current = accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    let phase = 0;

    const resize = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);

    const render = (t: number) => {
      const elapsed = (t - start) / 1000;

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      const isSpeaking = speakingRef.current;
      const base = isSpeaking ? 0.55 : 0.12;
      const wobble = isSpeaking ? 0.35 : 0.08;
      const amp =
        base +
        wobble * (0.5 + 0.5 * Math.sin(elapsed * (isSpeaking ? 2.2 : 0.6)));

      const color =
        accentRef.current === "agent"
          ? { stroke: "#0f172a", glow: "rgba(15, 23, 42, 0.18)" }
          : { stroke: "#0b4a2b", glow: "rgba(11, 74, 43, 0.18)" };

      // Background subtle grid line
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      ctx.fillRect(0, h / 2 - 0.5, w, 1);

      // Glow
      ctx.lineWidth = 6;
      ctx.strokeStyle = color.glow;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const p = x / w;
        const env = 1 - Math.abs(p - 0.5) * 1.8;
        const a = clamp01(env) * amp;
        const y =
          h / 2 +
          Math.sin(phase + x * 0.035) * (h * 0.28) * a +
          Math.sin(phase * 0.7 + x * 0.012) * (h * 0.12) * a;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Stroke
      ctx.lineWidth = 2;
      ctx.strokeStyle = color.stroke;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const p = x / w;
        const env = 1 - Math.abs(p - 0.5) * 1.8;
        const a = clamp01(env) * amp;
        const y =
          h / 2 +
          Math.sin(phase + x * 0.035) * (h * 0.22) * a +
          Math.sin(phase * 0.8 + x * 0.012) * (h * 0.09) * a;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += isSpeaking ? 0.16 : 0.07;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}

