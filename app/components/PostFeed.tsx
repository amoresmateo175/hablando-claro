"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useApprovalStatus } from "@/lib/useApprovalStatus";
import ApprovalNotice from "@/app/components/ApprovalNotice";

type Post = {
  id: string;
  texto: string;
  usuario_id: string;
  created_at: string;
  usuarios: {
    nombre: string;
  } | null;
};

type PostFeedProps = {
  user: User | null;
};

export default function PostFeed({ user }: PostFeedProps) {
  const POSTS_PER_PAGE = 5;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { canInteract, approvalLoaded } =
  useApprovalStatus(user?.id ?? null);

  const loadPosts = useCallback(async () => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from("posts")
      .select(
        `
          id,
          texto,
          usuario_id,
          created_at,
          usuarios!posts_usuario_id_fkey (
            nombre
          )
        `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(start, end);

    if (error) {
      setError(error.message);
      return;
    }

    setPosts((data ?? []) as unknown as Post[]);
    setTotalPosts(count ?? 0);
    setError("");
  }, [currentPage]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      await loadPosts();

      if (active) {
        setLoading(false);
      }
    }

    void initialize();

    const channel = supabase
      .channel("social-posts-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          void loadPosts();
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [loadPosts]);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Require an approved user before publishing.
    if (!user) {
      setError("Sign in or register to publish posts.");
      return;
    }

    if (!canInteract) {
      setError(
        "Your account is pending approval. You will be notified when you can publish posts."
      );
      return;
    }

    const content = texto.trim();

    if (!content || publishing) return;

    setPublishing(true);
    setError("");
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          texto: content,
          usuario_id: user.id,
        })
        .select();

      if (error) {
        console.error("Post insert error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });

        throw new Error(
          `${error.message} (Code: ${error.code ?? "unknown"})`
        );
      }

      console.log("Post created successfully:", data);

      setTexto("");
      setCurrentPage(1);
      setMessage("Post published successfully.");

      if (currentPage === 1) {
        await loadPosts();
      }
    } catch (error) {
      console.error("Publish post failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to publish the post."
      );
    } finally {
      setPublishing(false);
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="w-full max-w-2xl pb-36">           
      <header className="mb-8 border-b border-gray-200 pb-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            La conversación comienza contigo.
          </h1>

          <p className="mt-3 text-base leading-7 text-gray-600">
            Explora las ideas, descubre diferentes puntos de vista y
            comparte tu opinión. Regístrate para participar en la conversación.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Lectura abierta para todos
            </span>

            <span className="inline-flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
              </svg>
              Participación con registro y aprobación
            </span>
          </div>
        </div>
      </header>

      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Create a post
        </h2>

        {user && (
          <ApprovalNotice userId={user.id} />
        )}

        {user && approvalLoaded && canInteract ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="What would you like to share?"
              rows={4}
              maxLength={5000}
              required
              className="w-full resize-y rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500">
                {texto.length}/5000
              </span>

              <button
                type="submit"
                disabled={publishing || !texto.trim()}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {publishing ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-600">
            {!user
              ? "Sign in or create an account to publish posts."
              : !approvalLoaded
                ? "Checking your approval status..."
                : "Your account is pending approval. You will be notified when you can publish posts."}
          </p>
        )}

        {message && (
          <p role="status" className="mt-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 break-words text-sm text-red-600">
            {error}
          </p>
        )}        
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Recent Posts
        </h2>

        {loading ? (
          <p className="py-8 text-center text-gray-500">
            Loading posts...
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="font-medium text-gray-700">No posts yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to share something!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (              
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {(post.usuarios?.nombre || "U")
                      .charAt(0)
                      .toUpperCase()}
                    </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.usuarios?.nombre || "Unknown user"}
                    </p>

                    <time
                      dateTime={post.created_at}
                      className="text-xs text-gray-500"
                    >
                      {new Date(post.created_at).toLocaleString()}
                    </time>
                  </div>
                </div>

                <p className="whitespace-pre-wrap break-words text-gray-800">
                  {post.texto}
                </p>

                <p className="mt-4 text-sm font-medium text-blue-600">
                  View post and comments →
                </p>
              </Link>
            ))}
          </div>
        )}
        {!loading && totalPosts > POSTS_PER_PAGE && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setCurrentPage((page) => Math.max(1, page - 1));
              }}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="text-center text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(totalPosts / POSTS_PER_PAGE)}
            </span>

            <button
              type="button"
              onClick={() => {
                setCurrentPage((page) =>
                  Math.min(
                    Math.ceil(totalPosts / POSTS_PER_PAGE),
                    page + 1
                  )
                );
              }}
              disabled={
                currentPage >= Math.ceil(totalPosts / POSTS_PER_PAGE)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
