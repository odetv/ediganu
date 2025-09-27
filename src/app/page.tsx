"use client";
import React, { useEffect, useRef, useState } from "react";

const W = 1080;
const H = 1080;
const SS = 2;

function tryLoadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function loadFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function drawRoundedCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.save();
  ctx.beginPath();
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
  ctx.clip();

  const scale = Math.max(w / img.width, h / img.height);
  const sW = w / scale;
  const sH = h / scale;
  const sX = (img.width - sW) / 2;
  const sY = (img.height - sH) / 2;
  ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);

  ctx.restore();
}

export default function MenuEditorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [subtitle, setSubtitle] = useState(
    "Menu MBG SPPG Buleleng Sukasada Pancasari"
  );
  const [title, setTitle] = useState("Ayam Crispy Saus Teriyaki");
  const today = new Date();
  const dateTextDefault = new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(today);
  const defaultDateISO = today.toISOString().split("T")[0];

  const [dateText, setDateText] = useState(dateTextDefault);
  const [dateInput, setDateInput] = useState(defaultDateISO);
  const [imgSmall, setImgSmall] = useState<string | null>(null);
  const [imgBig, setImgBig] = useState<string | null>(null);

  // ✍️ Label editable untuk masing-masing gambar porsi
  const [labelSmall, setLabelSmall] = useState("Porsi Kecil");
  const [labelBig, setLabelBig] = useState("Porsi Besar");

  const BG_PATTERN = "/bg-pattern.png";
  const ICON_KECIL = "/icon-porsi-kecil.png";
  const ICON_BESAR = "/icon-porsi-besar.png";
  const LOGO_BGN = "/logo-bgn.png";

  useEffect(() => {
    renderCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitle, title, dateText, imgSmall, imgBig, labelSmall, labelBig]);

  async function renderCanvas() {
    const out = canvasRef.current;
    if (!out) return;

    const off = document.createElement("canvas");
    off.width = W * SS;
    off.height = H * SS;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
    ctx.scale(SS, SS);

    /* --- Background --- */
    ctx.fillStyle = "#B5E0EA";
    ctx.fillRect(0, 0, W, H);

    const bg = await tryLoadImage(BG_PATTERN);
    if (bg) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(bg, 0, 0, W, H);
      ctx.restore();
    }

    /* --- Logo BGn --- */
    const logo = await tryLoadImage(LOGO_BGN);
    if (logo) {
      const maxW = 200; // diperbesar
      const ratio = logo.width / logo.height;
      const drawW = ratio >= 1 ? maxW : maxW * ratio;
      const drawH = ratio >= 1 ? maxW / ratio : maxW;
      ctx.drawImage(logo, W - drawW - 25, 18, drawW, drawH);
    }

    /* --- Text tengah dengan line spacing konsisten --- */
    const centerY = H / 2 + 12;
    const lineSpacing = 45;
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "bold 28px Poppins";
    ctx.fillText(subtitle, W / 2, centerY - lineSpacing);
    ctx.font = "bold 42px Poppins";
    ctx.fillText(title, W / 2, centerY);
    ctx.font = "24px Poppins";
    ctx.fillText(dateText, W / 2, centerY + 40);

    /* --- Gambar porsi kecil --- */
    const margin = 50;
    const boxW = 520 + 55;
    const boxH = 340 + 55;
    const radius = 25;

    if (imgSmall) {
      const small = await tryLoadImage(imgSmall);
      if (small) {
        const x = margin;
        const y = margin;
        drawRoundedCover(ctx, small, x, y, boxW, boxH, radius);

        const icon = await tryLoadImage(ICON_KECIL);
        if (icon)
          ctx.drawImage(icon, x + boxW + 15, y + boxH / 2 - 55, 110, 110);

        ctx.textAlign = "left";
        ctx.font = "28px Poppins";
        ctx.fillText(labelSmall, x + boxW + 140, y + boxH / 2 + 14);
      }
    }

    /* --- Gambar porsi besar --- */
    if (imgBig) {
      const big = await tryLoadImage(imgBig);
      if (big) {
        const x = W - boxW - margin;
        const y = H - boxH - margin;
        drawRoundedCover(ctx, big, x, y, boxW, boxH, radius);

        const icon = await tryLoadImage(ICON_BESAR);
        if (icon) ctx.drawImage(icon, x - 125, y + boxH / 2 - 55, 110, 110);

        ctx.textAlign = "right";
        ctx.font = "28px Poppins";
        ctx.fillText(labelBig, x - 140, y + boxH / 2 + 14);
      }
    }

    /* --- Transfer ke canvas output --- */
    const outCtx = out.getContext("2d");
    if (!outCtx) return;
    out.width = W;
    out.height = H;
    outCtx.imageSmoothingEnabled = true;
    if (outCtx.imageSmoothingQuality) outCtx.imageSmoothingQuality = "high";
    outCtx.clearRect(0, 0, W, H);
    outCtx.drawImage(off, 0, 0, W, H);
  }

  function onPick(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string | null) => void
  ) {
    const f = e.target.files?.[0];
    if (!f) return;
    loadFileAsDataUrl(f).then((url) => setter(url));
  }

  function download() {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    a.download = `Menu MBG ${dateStr}.jpg`;
    a.href = c.toDataURL("image/jpeg");
    a.click();
  }

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center gap-6">
      <div className="text-center sm:mb-4">
        <h1 className="text-3xl font-bold">EDIGANU</h1>
        <p className="text-lg font-medium">Editor Gambar Menu MBG BGN</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            className="shadow rounded-2xl w-full max-w-xl"
          />
        </div>
        <div className="flex flex-col items-center gap-6">
          <div className="grid grid-cols-1 gap-4 w-full max-w-4xl">
            <label className="flex flex-col gap-2">
              <span className="font-semibold">Nama SPPG</span>
              <input
                maxLength={50}
                className="border rounded px-3 py-2"
                placeholder="Cth: Menu MBG SPPG Buleleng Sukasada Pancasari"
                // value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-semibold">Menu</span>
              <input
                maxLength={26}
                className="border rounded px-3 py-2"
                placeholder="Cth: Ayam Crispy Saus Teriyaki"
                // value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="font-semibold">Tanggal</span>
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={dateInput}
                onChange={(e) => {
                  const selected = e.target.value;
                  setDateInput(selected);
                  if (!selected) return;

                  const date = new Date(selected + "T00:00:00");
                  const formatted = new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(date);
                  setDateText(formatted);
                }}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Gambar 1</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPick(e, setImgSmall)}
              />
              <input
                maxLength={16}
                type="text"
                className="border rounded px-3 py-2"
                value={labelSmall}
                onChange={(e) => setLabelSmall(e.target.value)}
                placeholder="Masukkan Keterangan Gambar 1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Gambar 2</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPick(e, setImgBig)}
              />
              <input
                maxLength={16}
                type="text"
                className="border rounded px-3 py-2"
                value={labelBig}
                onChange={(e) => setLabelBig(e.target.value)}
                placeholder="Masukkan Keterangan Gambar 2"
              />
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center justify-center">
            <button
              onClick={download}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Download
            </button>
            <a
              href="https://wa.me/6285739683673?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20EDIGANU."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              Pusat Bantuan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
