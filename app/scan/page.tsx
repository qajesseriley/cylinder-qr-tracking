"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useSearchParams } from "next/navigation";

type Cylinder = {
  id: string;
  qr_code: string;
  status: string;
  activated_at: string | null;
  pickup_at: string | null;
  lab_received_at: string | null;
};

export default function ScanPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [cylinder, setCylinder] = useState<Cylinder | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [gpsStatus, setGpsStatus] = useState("Waiting for GPS permission...");

  useEffect(() => {
    if (!code) {
      setMessage("No QR code was provided.");
      setLoading(false);
      return;
    }

    loadOrCreateCylinder();
  }, [code]);

  async function loadOrCreateCylinder() {
    if (!code) return;

    setLoading(true);

    const { data: existing, error: findError } = await supabase
      .from("cylinders")
      .select("*")
      .eq("qr_code", code)
      .maybeSingle();

    if (findError) {
      setMessage(findError.message);
      setLoading(false);
      return;
    }

    if (existing) {
      setCylinder(existing);
      setMessage("QR code found.");
      setLoading(false);
      return;
    }

    const { data: created, error: createError } = await supabase
      .from("cylinders")
      .insert({
        qr_code: code,
        status: "inactive",
      })
      .select()
      .single();

    if (createError) {
      setMessage(createError.message);
      setLoading(false);
      return;
    }

    setCylinder(created);
    setMessage("New inactive QR code created.");
    setLoading(false);
  }

  async function activateCylinder() {
    if (!cylinder) return;

    setMessage("");
    setGpsStatus("Requesting precise GPS location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        if (accuracy > 20) {
          setMessage("Cylinder was NOT activated.");
          setGpsStatus(
            `GPS too weak: ${accuracy.toFixed(
              1
            )} meters. Move outside, turn on Precise Location, and try again.`
          );
          return;
        }

        setGpsStatus(
          `GPS locked at ${accuracy.toFixed(1)} meters. Activating cylinder...`
        );

        const { data, error } = await supabase
          .from("cylinders")
          .update({
            status: "active",
            activated_at: new Date().toISOString(),
            activation_latitude: latitude,
            activation_longitude: longitude,
            activation_accuracy: accuracy,
            updated_at: new Date().toISOString(),
          })
          .eq("id", cylinder.id)
          .select()
          .single();

        if (error) {
          setMessage(error.message);
          return;
        }

        setCylinder(data);
        setMessage("Cylinder activated successfully.");
        setGpsStatus(`Location saved with ${accuracy.toFixed(1)}m accuracy.`);
      },
      (error) => {
        setMessage("Cylinder was NOT activated.");
        setGpsStatus("GPS failed: " + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  }

  async function markPickedUp() {
    if (!cylinder) return;

    const { data, error } = await supabase
      .from("cylinders")
      .update({
        status: "picked_up",
        pickup_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cylinder.id)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setCylinder(data);
    setMessage("Cylinder marked as picked up.");
  }

  async function markReceivedAtLab() {
    if (!cylinder) return;

    const { data, error } = await supabase
      .from("cylinders")
      .update({
        status: "received_in_lab",
        lab_received_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", cylinder.id)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setCylinder(data);
    setMessage("Cylinder marked as received in lab.");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <p>Loading scan...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-3">
          QR Scan
        </p>

        <h1 className="text-3xl font-bold mb-4">Cylinder Scan</h1>

        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 mb-5">
          <p className="text-slate-400 text-sm">QR Code</p>
          <p className="text-xl font-mono">{code}</p>
        </div>

        {cylinder && (
          <div className="space-y-3 mb-6">
            <Info label="Current Status" value={cylinder.status} />
            <Info
              label="Activated At"
              value={cylinder.activated_at || "Not activated"}
            />
            <Info
              label="Picked Up At"
              value={cylinder.pickup_at || "Not picked up"}
            />
            <Info
              label="Received At Lab"
              value={cylinder.lab_received_at || "Not received"}
            />
          </div>
        )}

        <div className="space-y-3">
          {cylinder?.status === "inactive" && (
            <button
              onClick={activateCylinder}
              className="w-full rounded-2xl bg-cyan-500 text-slate-950 font-bold py-4 hover:bg-cyan-400"
            >
              Activate Cylinder With Precise GPS
            </button>
          )}

          {cylinder?.status === "active" && (
            <button
              onClick={markPickedUp}
              className="w-full rounded-2xl bg-amber-400 text-slate-950 font-bold py-4 hover:bg-amber-300"
            >
              Mark As Picked Up
            </button>
          )}

          {cylinder?.status === "picked_up" && (
            <button
              onClick={markReceivedAtLab}
              className="w-full rounded-2xl bg-emerald-400 text-slate-950 font-bold py-4 hover:bg-emerald-300"
            >
              Mark As Received In Lab
            </button>
          )}
        </div>

        <p className="text-slate-300 mt-5">{message}</p>
        <p className="text-slate-500 text-sm mt-2">{gpsStatus}</p>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-800 p-3">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="font-semibold break-words">{value}</p>
    </div>
  );
}