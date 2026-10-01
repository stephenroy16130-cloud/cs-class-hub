"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [admissionNo, setAdmissionNo] = useState("");
  const [contact, setContact] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo, contact, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      router.push("/login?reset=1");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Account Recovery</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Reset Your Password</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter the admission number and phone number on your class roster to verify it&apos;s you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Admission Number</label>
          <input
            type="text"
            required
            placeholder="IN13/00744/26"
            value={admissionNo}
            onChange={(e) => setAdmissionNo(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Phone Number on File</label>
          <input
            type="text"
            required
            placeholder="07XXXXXXXX"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Confirm New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered it after all?{" "}
        <Link href="/login" className="font-semibold text-navy hover:text-gold">
          Log in
        </Link>
      </p>
    </section>
  );
}
