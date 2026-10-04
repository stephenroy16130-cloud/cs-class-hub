"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const justReset = searchParams.get("reset") === "1";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioSupported, setBioSupported] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Could not reach the server. Try again.");
      setLoading(false);
    }
  }

  async function handleBiometricLogin() {
    if (!identifier.trim()) {
      setError("Enter your admission number or email first, then tap the biometric button.");
      return;
    }

    setError("");
    setBioLoading(true);
    try {
      const optionsRes = await fetch("/api/webauthn/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const optionsData = await optionsRes.json();

      if (!optionsRes.ok) {
        setError(optionsData.error || "Could not start biometric login.");
        setBioLoading(false);
        return;
      }

      const authResponse = await startAuthentication({ optionsJSON: optionsData.options });

      const verifyRes = await fetch("/api/webauthn/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: optionsData.userId, response: authResponse }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.error || "Biometric verification failed.");
        setBioLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setError("Biometric login was cancelled.");
      } else {
        setError("Your device doesn't support biometric login, or it failed. Use your password instead.");
      }
      setBioLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Welcome Back</p>
      <h1 className="mt-1 font-serif text-3xl font-bold text-navy">Log In</h1>

      {justReset && (
        <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Password reset successfully. Log in with your new password.
        </p>
      )}

      <form onSubmit={handleSubmit} autoComplete="on" className="mt-8 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-navy">Admission Number or Email</label>
          <input
            type="text"
            name="identifier"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-navy">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-navy hover:text-gold">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleBiometricLogin}
        disabled={bioLoading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-navy px-4 py-2 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white disabled:opacity-50"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
        </svg>
        {bioLoading ? "Verifying..." : "Sign in with Fingerprint / Face"}
      </button>
      <p className="mt-2 text-center text-xs text-gray-400">
        Enter your admission number or email above first, then tap this button.
      </p>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-navy hover:text-gold">
          Sign up
        </Link>
      </p>
    </section>
  );
}
