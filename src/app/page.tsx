"use client";

import React, { useState, useRef } from "react";
import { id } from "@instantdb/react";
import db from "@/lib/db";

/* Burnt sienna palette: #E35336, #F5F5DC, #F4A460, #A0522D */
const POEM_EMOJIS = ["📜", "✨", "🌸", "🌙", "🖋️", "📝", "💫", "🌿", "🍂", "🌊"];
const PREVIEW_LINES = 3;

function getPoemEmoji(title: string, index: number) {
  const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return POEM_EMOJIS[(hash + index) % POEM_EMOJIS.length];
}

function getPreviewLines(body: string, maxLines: number = PREVIEW_LINES): string {
  const lines = body.split(/\r?\n/).filter(Boolean);
  return lines.slice(0, maxLines).join("\n") + (lines.length > maxLines ? "…" : "");
}

function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function AuthorAvatar({ email }: { email?: string | null }) {
  const initial = email ? email[0].toUpperCase() : null;
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#F5F5DC] font-semibold"
      style={{ backgroundColor: "#A0522D" }}
      title={email ?? "Anonymous"}
    >
      {initial ?? <PersonIcon />}
    </div>
  );
}

function Login() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border-2 p-6 shadow-md" style={{ borderColor: "#F4A460", backgroundColor: "#F5F5DC" }}>
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
      <h2 className="text-xl font-semibold" style={{ color: "#A0522D" }}>
        Log in or sign up
      </h2>
      <p className="text-sm" style={{ color: "#A0522D" }}>
        Enter your email and we&apos;ll send you a verification code. We&apos;ll
        create an account if you don&apos;t have one.
      </p>
      <input
        ref={inputRef}
        type="email"
        className="w-full rounded-lg border-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E35336]"
        style={{ borderColor: "#F4A460", color: "#A0522D", backgroundColor: "#F5F5DC" }}
        placeholder="you@example.com"
        required
        autoFocus
      />
      <button
        type="submit"
        className="w-full rounded-lg py-2 font-medium text-[#F5F5DC] transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#E35336" }}
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
      <h2 className="text-xl font-semibold" style={{ color: "#A0522D" }}>
        Enter your code
      </h2>
      <p className="text-sm" style={{ color: "#A0522D" }}>
        We sent a code to <strong style={{ color: "#A0522D" }}>{sentEmail}</strong>. Check your email and paste it below.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="w-full rounded-lg border-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E35336]"
        style={{ borderColor: "#F4A460", color: "#A0522D", backgroundColor: "#F5F5DC" }}
        placeholder="123456"
        required
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border-2 py-2 font-medium transition-opacity hover:opacity-90"
          style={{ borderColor: "#F4A460", color: "#A0522D", backgroundColor: "#F5F5DC" }}
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg py-2 font-medium text-[#F5F5DC] transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#E35336" }}
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
    <section className="rounded-xl border-2 p-6 shadow-md font-sans" style={{ borderColor: "#F4A460", backgroundColor: "#F5F5DC" }}>
      <h2 className="mb-4 text-lg font-semibold" style={{ color: "#A0522D" }}>
        Post a poem
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E35336]"
          style={{ borderColor: "#F4A460", color: "#A0522D", backgroundColor: "#F5F5DC" }}
          placeholder="Title"
          required
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-lg border-2 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E35336] font-serif text-lg"
          style={{ borderColor: "#F4A460", color: "#A0522D", backgroundColor: "#F5F5DC" }}
          placeholder="Your poem..."
          required
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg py-2 font-medium text-[#F5F5DC] transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#E35336" }}
        >
          Publish
        </button>
      </form>
    </section>
  );
}

function PoemFeed() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isLoading, error, data } = db.useQuery({
    poems: {
      author: {},
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <p className="font-sans" style={{ color: "#A0522D" }}>Loading poems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border-2 p-4 font-sans" style={{ borderColor: "#F4A460", backgroundColor: "#F5F5DC", color: "#A0522D" }}>
        Error loading poems: {error.message}
      </div>
    );
  }

  const poems = (data?.poems ?? []).sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
  );

  if (poems.length === 0) {
    return (
      <p className="py-8 text-center font-sans" style={{ color: "#A0522D" }}>
        No poems yet. Be the first to share one!
      </p>
    );
  }

  const activeId = selectedId && poems.some((p) => p.id === selectedId) ? selectedId : poems[0]?.id ?? null;
  const selectedPoem = activeId ? poems.find((p) => p.id === activeId) : poems[0];

  return (
    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: "#F4A460", backgroundColor: "#F5F5DC" }}>
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b-2 p-2"
        style={{ borderColor: "#F4A460" }}
      >
        {poems.map((poem, index) => {
          const isSelected = poem.id === activeId;
          return (
            <button
              key={poem.id}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`poem-panel-${poem.id}`}
              id={`poem-tab-${poem.id}`}
              type="button"
              onClick={() => setSelectedId(poem.id)}
              className="rounded-lg border-2 px-3 py-2 text-left font-sans transition-opacity hover:opacity-90 w-full min-w-[140px] max-w-[220px]"
              style={{
                borderColor: isSelected ? "#E35336" : "#F4A460",
                backgroundColor: isSelected ? "#E35336" : "#F5F5DC",
                color: isSelected ? "#F5F5DC" : "#A0522D",
              }}
            >
              <div className="truncate text-sm font-semibold">
                <span className="mr-1" aria-hidden>{getPoemEmoji(poem.title ?? "", index)}</span>
                {poem.title}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs opacity-90" style={{ color: isSelected ? "#F5F5DC" : "#A0522D" }}>
                {getPreviewLines(poem.body ?? "")}
              </div>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`poem-panel-${activeId}`}
        aria-labelledby={`poem-tab-${activeId}`}
        className="p-6"
      >
        {selectedPoem && (() => {
          const author = selectedPoem.author as { email?: string } | undefined;
          const email = author?.email;
          return (
            <>
              <h3 className="inline-block rounded px-2 py-0.5 text-lg font-bold font-sans" style={{ color: "#A0522D", backgroundColor: "#F4A460" }}>
                <span className="mr-2" aria-hidden>{getPoemEmoji(selectedPoem.title ?? "", poems.indexOf(selectedPoem))}</span>
                {selectedPoem.title}
              </h3>
              <p className="mt-4 whitespace-pre-wrap font-serif text-xl leading-relaxed" style={{ color: "#A0522D" }}>
                {selectedPoem.body}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <AuthorAvatar email={email} />
                <div className="min-w-0 font-sans text-sm" style={{ color: "#A0522D" }}>
                  <span className="font-medium">{email ?? "Anonymous"}</span>
                  <span className="ml-1">· {new Date(selectedPoem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </>
          );
        })()}
      </div>
      <div className="border-t-2 px-4 py-2 font-sans text-xs" style={{ borderColor: "#F4A460", color: "#A0522D" }}>
        Preview: {poems.length} poem{poems.length !== 1 ? "s" : ""} — select a tab to read the full poem.
      </div>
    </div>
  );
}

function Main() {
  const user = db.useUser();

  return (
    <div className="space-y-8 font-sans">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 pb-4" style={{ borderColor: "#F4A460" }}>
        <h1 className="text-2xl font-bold" style={{ color: "#A0522D" }}>
          Poetry sharing
        </h1>
        <div className="flex items-center gap-3">
          <AuthorAvatar email={user.email} />
          <span className="text-sm" style={{ color: "#A0522D" }}>
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => db.auth.signOut()}
            className="rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ borderColor: "#F4A460", color: "#A0522D", backgroundColor: "#F5F5DC" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <PostPoemForm />
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "#A0522D" }}>
          All poems
        </h2>
        <PoemFeed />
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F5F5DC" }}>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <db.SignedIn>
          <Main />
        </db.SignedIn>
        <db.SignedOut>
          <div className="space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold" style={{ color: "#A0522D" }}>
                Poetry sharing
              </h1>
              <p className="mt-2 text-sm" style={{ color: "#A0522D" }}>
                Sign in to post your poems and read others.
              </p>
            </header>
            <Login />
            <section>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: "#A0522D" }}>
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
