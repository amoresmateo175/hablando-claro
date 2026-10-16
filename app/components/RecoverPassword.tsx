
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRecover(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Introduce tu correo electrónico.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      setError("No se pudo enviar la solicitud. Inténtalo de nuevo.");
      return;
    }

    setMessage(
      "Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer la contraseña."
    );
  }

  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="mb-2 text-2xl font-bold">
        Recuperar contraseña
      </h1>

      <p className="mb-6 text-sm text-gray-600">
        Introduce tu correo y te enviaremos las instrucciones.
      </p>

      <form onSubmit={handleRecover} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Correo electrónico
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border p-3"
            placeholder="tu@correo.com"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>
      </form>
    </main>
  );
}
