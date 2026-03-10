"use client";

import React, { useState, useRef } from "react";
import { id } from "@instantdb/react";
import db from "@/lib/db";

function Login() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep
            sentEmail={sentEmail}
            onBack={() => setSentEmail("")}
          />
        )}
      </div>
    </div>
  );
}

function EmailStep({
  onSendEmail,
}: {
  onSendEmail: (email: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = inputRef.current?.value?.trim();
    if (!email) return;
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert("Error: " + (err.body?.message ?? err.message));
      onSendEmail("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Log in or sign up
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Enter your email and we&apos;ll send you a verification code. We&apos;ll
        create an account if you don&apos;t have one.
      </p>
      <input
        ref={inputRef}
        type="email"
        className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        placeholder="you@example.com"
        required
        autoFocus
      />
      <button
        type="submit"
        className="w-full rounded bg-zinc-900 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Send code
      </button>
    </form>
  );
}

function CodeStep({
  sentEmail,
  onBack,
}: {
  sentEmail: string;
  onBack: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = inputRef.current?.value?.trim();
    if (!code) return;
    db.auth
      .signInWithMagicCode({ email: sentEmail, code })
      .catch((err) => {
        inputRef.current!.value = "";
        alert("Invalid code: " + (err.body?.message ?? err.message));
      });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Enter your code
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        We sent a code to <strong className="text-zinc-900 dark:text-zinc-100">{sentEmail}</strong>. Check your email and paste it below.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        placeholder="123456"
        required
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded border border-zinc-300 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded bg-zinc-900 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Verify
        </button>
      </div>
    </form>
  );
}

function PostPoemForm() {
  const user = db.useUser();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) {
      setError("Title and body are required.");
      return;
    }
    db.transact(
      db.tx.poems[id()]
        .update({
          title: t,
          body: b,
          createdAt: Date.now(),
        })
        .link({ author: user.id })
    );
    setTitle("");
    setBody("");
  };

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Post a poem
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Title"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full resize-y rounded border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          placeholder="Your poem..."
          required
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-zinc-900 py-2 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Publish
        </button>
      </form>
    </section>
  );
}

function PoemFeed() {
  const { isLoading, error, data } = db.useQuery({
    poems: {
      author: {},
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-zinc-500 dark:text-zinc-400">Loading poems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        Error loading poems: {error.message}
      </div>
    );
  }

  const poems = (data?.poems ?? []).sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
  );

  if (poems.length === 0) {
    return (
      <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">
        No poems yet. Be the first to share one!
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {poems.map((poem) => (
        <li
          key={poem.id}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {poem.title}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {poem.body}
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            by {(poem.author as { email?: string })?.email ?? "Anonymous"} ·{" "}
            {new Date(poem.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

function Main() {
  const user = db.useUser();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Poetry sharing
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => db.auth.signOut()}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <PostPoemForm />
      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          All poems
        </h2>
        <PoemFeed />
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <db.SignedIn>
          <Main />
        </db.SignedIn>
        <db.SignedOut>
          <div className="space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Poetry sharing
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Sign in to post your poems and read others.
              </p>
            </header>
            <Login />
            <section>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                All poems
              </h2>
              <PoemFeed />
            </section>
          </div>
        </db.SignedOut>
      </main>
    </div>
  );
}
