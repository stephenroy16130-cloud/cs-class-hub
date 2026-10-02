"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [admissionNo, setAdmissionNo] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo, contact, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
          &#10003;
        </div>
        <h1 className="mt-4 font-serif text-2xl font-bold text-navy">Account Created</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account has been created successfully. You can now log in with your admission number and password.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 w-full rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Proceed to Log In
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Get Started</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Create Your Account</h1>
      <p className="mt-2 text-sm text-gray-600">
        Use your admission number and the phone number on your class roster to verify it&apos;s really you.
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
          <label className="mb-1 block text-sm font-medium text-navy">Phone Number on Roster</label>
          <input
            type="text"
            required
            placeholder="07XXXXXXXX"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-400">
            Must match the phone number the class rep has on file for your admission number.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 pr-16 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy hover:text-gold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-md border px-4 py-2 pr-16 text-sm ${
                passwordsMatch ? "border-gray-300" : "border-red-400"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy hover:text-gold"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {!passwordsMatch && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="mt-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-navy hover:text-gold">
          Log in
        </Link>
      </p>
    </section>
  );
}
