
"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "./AuthContext";
import Navbar from "./Navbar";
import AuthForm from "./AuthForm";
import Footer from "./Footer";

function AppShellContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, checkingSession } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);

  return (
    <>
      <Navbar
        user={user}
        onSignInClick={() => setShowAuthForm((current) => !current)}
      />

      {showAuthForm && !user && !checkingSession && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative my-auto w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <button
              type="button"
              onClick={() => setShowAuthForm(false)}
              aria-label="Close sign in form"
              className="absolute right-4 top-3 text-2xl text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>

            <AuthForm />
          </div>
        </div>
      )}

      {checkingSession ? (
        <main className="flex min-h-[50vh] items-center justify-center bg-gray-50">
          <p className="text-gray-500">Checking your session...</p>
        </main>
      ) : (
        children
      )}

      <Footer />
    </>
  );
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}
