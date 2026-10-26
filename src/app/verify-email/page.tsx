"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage("Your email has been verified!");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <div className="text-center py-8">
      {status === "loading" && (
        <>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-dark-green border-t-transparent mx-auto mb-4" />
          <p className="text-slate-moss">Verifying your email...</p>
        </>
      )}
      {status === "success" && (
        <>
          <div className="w-14 h-14 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">&#10003;</div>
          <h2 className="text-xl font-bold text-graphite mb-2">Email Verified!</h2>
          <p className="text-sm text-slate-moss mb-6">{message}</p>
          <Link href="/login" className="inline-block bg-obsidian text-warm-white px-6 py-2.5 rounded-lg text-sm font-medium">
            Log In
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">&#10007;</div>
          <h2 className="text-xl font-bold text-graphite mb-2">Verification Failed</h2>
          <p className="text-sm text-slate-moss mb-6">{message}</p>
          <Link href="/login" className="text-dark-green text-sm font-medium hover:underline">
            Go to Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="light-zone min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-moss/20 p-8 shadow-sm">
          <Suspense fallback={<p className="text-center text-slate-moss">Loading...</p>}>
            <VerifyContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
