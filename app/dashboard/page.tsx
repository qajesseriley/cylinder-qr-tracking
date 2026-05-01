"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Cylinder = {
  id: string;
  qr_code: string;
  status: string;
  created_at: string;
  activated_at: string | null;
  pickup_at: string | null;
  lab_received_at: string | null;
  activation_latitude: number | null;
  activation_longitude: number | null;
};

export default function DashboardPage() {
  const [cylinders, setCylinders] = useState<Cylinder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCylinders();
  }, []);

  async function loadCylinders() {
    const { data, error } = await supabase
      .from("cylinders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCylinders(data);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-3">
            Dashboard
          </p>
          <h1 className="text-4xl font-bold">Cylinder Tracking Dashboard</h1>
          <p className="text-slate-400 mt-2">
            View all QR tracked concrete cylinders and their current status.
          </p>
        </div>

        {loading ? (
          <p>Loading cylinders...</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left bg-slate-900">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4">QR Code</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Activated</th>
                  <th className="p-4">Picked Up</th>
                  <th className="p-4">Lab Received</th>
                  <th className="p-4">Location</th>
                </tr>
              </thead>
              <tbody>
                {cylinders.map((cylinder) => (
                  <tr key={cylinder.id} className="border-t border-slate-800">
                    <td className="p-4 font-mono">{cylinder.qr_code}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-slate-700 px-3 py-1 text-sm">
                        {cylinder.status}
                      </span>
                    </td>
                    <td className="p-4">{formatDate(cylinder.activated_at)}</td>
                    <td className="p-4">{formatDate(cylinder.pickup_at)}</td>
                    <td className="p-4">{formatDate(cylinder.lab_received_at)}</td>
                    <td className="p-4">
                      {cylinder.activation_latitude && cylinder.activation_longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${cylinder.activation_latitude},${cylinder.activation_longitude}`}
                          target="_blank"
                          className="text-cyan-400 underline"
                        >
                          Open Map
                        </a>
                      ) : (
                        "No GPS"
                      )}
                    </td>
                  </tr>
                ))}

                {cylinders.length === 0 && (
                  <tr>
                    <td className="p-6 text-slate-400" colSpan={6}>
                      No cylinders logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}