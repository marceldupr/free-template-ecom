"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession } = useAuth();
  const isRegister = searchParams.get("register") === "1";
  const returnTo = searchParams.get("returnTo") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/signup" : "/api/auth/signin";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "Request failed");
      }
      if (data.access_token && data.user) {
        setSession(data.access_token, data.user);
        router.push(returnTo);
      } else if (data.user && (data as { message?: string }).message) {
        setError((data as { message: string }).message);
      } else {
        setError("Unexpected response");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <div className="flex gap-2 mb-6">
        <Link
          href={isRegister ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}` : "/auth/required"}
          className={`px-4 py-2 rounded-component text-sm font-medium ${
            !isRegister ? "bg-aurora-surface border border-aurora-border" : "text-aurora-muted"
          }`}
        >
          Login
        </Link>
        <Link
          href={isRegister ? "/auth/required" : `/auth/login?register=1&returnTo=${encodeURIComponent(returnTo)}`}
          className={`px-4 py-2 rounded-component text-sm font-medium ${
            isRegister ? "bg-aurora-surface border border-aurora-border" : "text-aurora-muted"
          }`}
        >
          Register
        </Link>
      </div>
      <div className="p-6 rounded-component bg-aurora-surface border border-aurora-border">
        <h2 className="text-lg font-semibold mb-2">
          {isRegister ? "Create your account" : "Login to your account"}
        </h2>
        <p className="text-aurora-muted text-sm mb-6">
          {isRegister
            ? "Enter your details to create an account"
            : "Enter your email and password to access your account"}
        </p>
        {error && (
          <p className="mb-4 p-3 rounded-component bg-red-500/20 text-red-300 text-sm">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-3 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder:text-aurora-muted focus:ring-2 focus:ring-aurora-accent/50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-component bg-aurora-bg border border-aurora-border text-white placeholder:text-aurora-muted focus:ring-2 focus:ring-aurora-accent/50"
            />
            {!isRegister && (
              <Link href="/auth/forgot" className="text-aurora-accent text-sm mt-1 inline-block">
                Forgot password?
              </Link>
            )}
          </div>
          {!isRegister && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-component bg-aurora-accent text-aurora-bg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Please wait…" : isRegister ? "Create Account" : "Login"}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-aurora-border">
          <p className="text-aurora-muted text-sm text-center mb-4">OR CONTINUE WITH</p>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 py-3 rounded-component border border-aurora-border hover:bg-aurora-surface-hover"
            >
              Google
            </button>
            <button
              type="button"
              className="flex-1 py-3 rounded-component border border-aurora-border hover:bg-aurora-surface-hover"
            >
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-16 px-6 text-center text-aurora-muted">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
