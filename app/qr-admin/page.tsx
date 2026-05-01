"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";

export default function QRAdminPage() {
  const [quantity, setQuantity] = useState(25);
  const [codes, setCodes] = useState<string[]>([]);

  function generateCodes() {
    const batch: string[] = [];

    for (let i = 0; i < quantity; i++) {
      const code =
        "CYL-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 8).toUpperCase();

      batch.push(code);
    }

    setCodes(batch);
  }

  function printPage() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 print:bg-white print:text-black">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 print:hidden">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-3">
            QR Admin
          </p>

          <h1 className="text-4xl font-bold mb-3">Printable Cylinder QR Codes</h1>

          <p className="text-slate-400 mb-8">
            Generate unique cylinder QR stickers. Each QR opens the scan page
            with its own unique tracking token.
          </p>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 mb-8">
            <label className="block text-slate-300 mb-2">
              Number of QR stickers to generate
            </label>

            <input
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 p-4 mb-4"
            />

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={generateCodes}
                className="rounded-2xl bg-cyan-500 text-slate-950 font-bold px-6 py-4 hover:bg-cyan-400"
              >
                Generate QR Stickers
              </button>

              {codes.length > 0 && (
                <button
                  onClick={printPage}
                  className="rounded-2xl bg-white text-slate-950 font-bold px-6 py-4 hover:bg-slate-200"
                >
                  Print Sheet
                </button>
              )}
            </div>
          </div>
        </div>

        {codes.length > 0 && (
          <div className="mb-4 text-slate-400 print:hidden">
            Generated {codes.length} QR stickers.
          </div>
        )}

        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4 print:gap-3">
          {codes.map((code) => {
            const url = `${APP_BASE_URL}/scan?code=${encodeURIComponent(code)}`;

            return (
              <div
                key={code}
                className="rounded-2xl bg-white text-black p-4 flex flex-col items-center justify-center border border-slate-300 break-inside-avoid print:rounded-none print:border-black"
              >
                <div className="text-[10px] font-bold tracking-widest mb-2">
                  CYLINDER TRACKING
                </div>

                <QRCodeSVG
                  value={url}
                  size={130}
                  level="H"
                  includeMargin={true}
                />

                <div className="mt-2 font-mono text-xs font-bold text-center">
                  {code}
                </div>

                <div className="mt-1 text-[9px] text-center">
                  SCAN TO ACTIVATE
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}