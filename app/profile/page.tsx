"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setName(data.name);
        setRole(data.role);
        setAvatarData(data.avatarData);
      });
  }, []);

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
    </section>
  );
}
