import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-3">
          Cylinder QR Tracking
        </p>

        <h1 className="text-4xl font-bold mb-4">
          Concrete Cylinder Tracking System
        </h1>

        <p className="text-slate-300 text-lg mb-8">
          Track concrete test cylinders from creation, through curing, pickup,
          and final lab arrival using unique QR stickers.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/dashboard"
            className="rounded-2xl bg-cyan-500 text-slate-950 font-semibold p-5 text-center hover:bg-cyan-400"
          >
            Dashboard
          </Link>

          <Link
            href="/qr-admin"
            className="rounded-2xl bg-slate-800 font-semibold p-5 text-center hover:bg-slate-700"
          >
            QR Admin
          </Link>

          <Link
            href="/scan?code=TEST-QR-001"
            className="rounded-2xl bg-slate-800 font-semibold p-5 text-center hover:bg-slate-700"
          >
            Test Scan
          </Link>
        </div>
      </div>
    </main>
  );
}