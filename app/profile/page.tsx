"use client";

import { useEffect, useRef, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";

type Passkey = { id: number; deviceLabel: string; createdAt: string };

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [passkeyMessage, setPasskeyMessage] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setName(data.name);
        setRole(data.role);
        setAvatarData(data.avatarData);
      });
    loadPasskeys();
  }, []);

  async function loadPasskeys() {
    const res = await fetch("/api/webauthn/list");
    if (res.ok) {
      const data = await res.json();
      setPasskeys(data.passkeys || []);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPreview(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarData: preview ?? avatarData }),
      });
      const result = await res.json();
      if (!res.ok) {
        setMessage(result.error || "Something went wrong.");
        return;
      }
      setMessage("Profile updated.");
      setAvatarData(preview ?? avatarData);
      setPreview(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarData: null }),
      });
      setAvatarData(null);
      setPreview(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleEnrollPasskey() {
    setEnrolling(true);
    setPasskeyMessage("");
    try {
      const optionsRes = await fetch("/api/webauthn/register/options", { method: "POST" });
      const options = await optionsRes.json();

      if (!optionsRes.ok) {
        setPasskeyMessage(options.error || "Could not start setup.");
        setEnrolling(false);
        return;
      }

      const registrationResponse = await startRegistration({ optionsJSON: options });

      const deviceLabel =
        (navigator as any).userAgentData?.platform ||
        (navigator.userAgent.includes("Android") ? "Android device" :
         navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad") ? "iPhone/iPad" :
         navigator.userAgent.includes("Mac") ? "Mac" :
         navigator.userAgent.includes("Windows") ? "Windows PC" : "This device");

      const verifyRes = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: registrationResponse, deviceLabel }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setPasskeyMessage(verifyData.error || "Could not save this device.");
        return;
      }

      setPasskeyMessage("Biometric login set up for this device.");
      loadPasskeys();
    } catch (err: any) {
      console.error("WebAuthn error:", err?.name, err?.message, err);
      if (err?.name === "NotAllowedError") {
        setPasskeyMessage("Setup was cancelled.");
      } else {
        setPasskeyMessage(`Setup failed: ${err?.name || "Unknown"} - ${err?.message || "no details"}`);
      }
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRemovePasskey(id: number) {
    if (!confirm("Remove biometric login for this device?")) return;
    await fetch(`/api/webauthn/${id}`, { method: "DELETE" });
    loadPasskeys();
  }

  const displayImage = preview ?? avatarData;
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Your Account</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Edit Profile</h1>

      <div className="mt-8 flex flex-col items-center">
        {displayImage ? (
          <img src={displayImage} alt="" className="h-28 w-28 rounded-full object-cover" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-navy font-serif text-3xl text-gold">
            {initials}
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 rounded-md border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white"
        >
          Choose Photo
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {displayImage && (
          <button onClick={handleRemove} className="mt-2 text-xs text-red-600 hover:underline">
            Remove Photo
          </button>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 p-4 text-sm">
        <p className="text-gray-500">Name</p>
        <p className="font-medium text-navy">{name}</p>
        <p className="mt-2 text-gray-500">Role</p>
        <p className="font-medium capitalize text-navy">{role}</p>
      </div>

      {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !preview}
        className="mt-6 w-full rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <div className="mt-10 border-t border-gray-200 pt-6">
        <p className="font-serif text-lg font-semibold text-navy">Fingerprint / Face Login</p>
        <p className="mt-1 text-sm text-gray-500">
          Set up biometric sign-in on this device so you can log in without typing your password.
        </p>

        {passkeys.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {passkeys.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm">
                <span className="text-navy">{p.deviceLabel}</span>
                <button onClick={() => handleRemovePasskey(p.id)} className="text-xs font-semibold text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {passkeyMessage && <p className="mt-3 text-sm text-emerald-700">{passkeyMessage}</p>}

        <button
          onClick={handleEnrollPasskey}
          disabled={enrolling}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white disabled:opacity-50"
        >
          {enrolling ? "Setting up..." : "Set Up on This Device"}
        </button>
      </div>
    </section>
  );
}


