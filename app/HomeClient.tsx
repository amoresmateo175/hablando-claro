
"use client";

import PostFeed from "./components/PostFeed";
import { useAuth } from "./components/AuthContext";

export const instant = false;

export default function Home() {
  const { user, checkingSession } = useAuth();

  if (checkingSession) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center bg-gray-50">
        <p className="text-gray-500">Checking your session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 pb-36 md:pb-10">
      <div className="mx-auto w-full max-w-2xl">
        <PostFeed user={user} />
      </div>
    </main>
  );
}
