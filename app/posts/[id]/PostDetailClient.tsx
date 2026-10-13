
"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
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

type Comment = {
  id: string;
  texto: string;
  post_id: string;
  usuario_id: string;
  created_at: string;
  usuarios: {
    nombre: string;
  } | null;
};

export default function PostDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <p className="text-gray-500">Loading post...</p>
        </main>
      }
    >
      <PostDetailContent />
    </Suspense>
  );
}

function PostDetailContent() {
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [texto, setTexto] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { canInteract, approvalLoaded } =
  useApprovalStatus(user?.id ?? null);

  
  const loadPostAndComments = useCallback(async () => {
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select(`
        id,
        texto,
        usuario_id,
        created_at,
        usuarios!posts_usuario_id_fkey (
          nombre
        )
      `)
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      setError(postError.message);
      return;
    }

    if (!postData) {
      setPost(null);
      setComments([]);
      setTotalComments(0);
      setHasMoreComments(false);
      setError("");
      return;
    }

    setPost(postData as unknown as Post);

    const { data: commentData, error: commentError, count } =
      await supabase
        .from("comentarios")
        .select(
          `
            id,
            texto,
            post_id,
            usuario_id,
            created_at,
            usuarios!comentarios_usuario_id_fkey (
              nombre
            )
          `,
          { count: "exact" }
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(0, 4);

    if (commentError) {
      setError(commentError.message);
      return;
    }

    const initialComments = (commentData ?? []) as unknown as Comment[];

    setComments(initialComments);
    setTotalComments(count ?? initialComments.length);
    setHasMoreComments(
      initialComments.length < (count ?? initialComments.length)
    );
    setError("");
  }, [postId]);

  
  async function handleLoadMoreComments() {
    if (loadingMoreComments || !hasMoreComments) return;

    setLoadingMoreComments(true);
    setError("");

    try {
      const start = comments.length;
      const end = start + 4;

      const { data, error: commentError } = await supabase
        .from("comentarios")
        .select(`
          id,
          texto,
          post_id,
          usuario_id,
          created_at,
          usuarios!comentarios_usuario_id_fkey (
            nombre
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(start, end);

      if (commentError) throw commentError;

      const nextComments = (data ?? []) as unknown as Comment[];

      setComments((previous) => [...previous, ...nextComments]);
      setHasMoreComments(nextComments.length === 5);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load more comments."
      );
    } finally {
      setLoadingMoreComments(false);
    }
  }



  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError) {
        setError(authError.message);
      }

      setUser(data.user ?? null);
      setCheckingSession(false);

      await loadPostAndComments();

      if (active) {
        setLoading(false);
      }

      setUser(data.user);
      setCheckingSession(false);

      await loadPostAndComments();

      if (active) {
        setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [loadPostAndComments, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Prevent users without approval from publishing comments.
    if (!user || !canInteract) {
      setError("Your account must be approved before you can comment.");
      return;
    }

    const content = texto.trim();

    if (!content || !user || submitting) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { error: insertError } = await supabase
        .from("comentarios")
        .insert({
          texto: content,
          post_id: postId,
          usuario_id: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      setTexto("");
      await loadPostAndComments();
      setMessage("Comment published successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish the comment."
      );
    } finally {
      setSubmitting(false);
    }
  }
  
  if (checkingSession || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500">Loading post...</p>
      </main>
    );
  }
  
  if (!post) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">
            Post not found
          </h1>

          <p className="mt-2 text-gray-600">
            This post may have been deleted or does not exist.
          </p>

          <Link
            href="/"
            className="mt-5 inline-block font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to feed
          </Link>
        </div>
      </main>
    );
  }

  return (    
    <main className="min-h-screen bg-gray-50 px-4 py-8 pb-36 md:pb-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to feed
        </Link>

        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {(post.usuarios?.nombre || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h1 className="font-semibold text-gray-900">
                {post.usuarios?.nombre || "Unknown user"}
              </h1>

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
        </article>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Comments ({totalComments})
          </h2>

          {user && (
            <ApprovalNotice userId={user.id} />
          )}

          {user && approvalLoaded && canInteract ? (
            <form
              onSubmit={handleSubmit}
              className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <label
                htmlFor="comment-text"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Write a comment
              </label>

              <textarea
                id="comment-text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                maxLength={3000}
                required
                className="w-full resize-y rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  {texto.length}/3000
                </span>

                <button
                  type="submit"
                  disabled={submitting || !texto.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Posting..." : "Add Comment"}
                </button>
              </div>

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
            </form>
          ) : (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-gray-700">
                {!user
                  ? "Sign in or create an account to join the conversation."
                  : !approvalLoaded
                    ? "Checking your approval status..."
                    : "Your account is pending approval. You will be notified when you can comment."}
              </p>

              {!user && (
                <Link
                  href="/"
                  className="mt-2 inline-block font-medium text-blue-600 hover:text-blue-800"
                >
                  Sign in or register
                </Link>
              )}
            </div>
          )}
          
          {comments.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="font-medium text-gray-700">
                No comments yet
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Be the first to comment on this post.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                        {(comment.usuarios?.nombre || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {comment.usuarios?.nombre || "Unknown user"}
                        </p>

                        <time
                          dateTime={comment.created_at}
                          className="text-xs text-gray-500"
                        >
                          {new Date(comment.created_at).toLocaleString()}
                        </time>
                      </div>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-gray-700">
                      {comment.texto}
                    </p>
                  </article>
                ))}
              </div>

              {hasMoreComments && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreComments}
                    disabled={loadingMoreComments}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingMoreComments
                      ? "Loading comments..."
                      : "Load 5 more comments"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
