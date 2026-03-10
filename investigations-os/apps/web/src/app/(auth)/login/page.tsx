"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const { data: tokens } = await apiClient.post("/auth/login", values);
      localStorage.setItem("access_token", tokens.access_token);
      const { data: me } = await apiClient.get("/auth/me");
      setAuth(
        {
          id: me.id,
          tenantId: me.tenant_id,
          email: me.email,
          displayName: me.display_name,
          role: me.role,
        },
        tokens.access_token
      );
      router.push("/cases");
    } catch (err: unknown) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-sm border">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">CaseGraph</h1>
          <p className="text-sm text-slate-500">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
