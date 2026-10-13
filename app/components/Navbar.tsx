
"use client";

import Link from "next/link";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type NavbarProps = {
  user: User | null;
  onSignInClick: () => void;
};

export default function Navbar({
  user,
  onSignInClick,
}: NavbarProps) {
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">        
        <Link
          href="/"
          aria-label="Hablando Claro home"
          className="flex items-center"
        >
          <Image
            src="/images/logo-hablando-claro.png"
            alt="Hablando Claro"
            width={180}
            height={50}
            priority
            className="h-25 w-auto object-contain"
          />
        </Link>

        {user ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={onSignInClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Sign in / Register
          </button>
        )}
      </nav>
    </header>
  );
}
