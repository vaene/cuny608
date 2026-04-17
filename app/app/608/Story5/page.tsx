'use client';

import Link from "next/link";
import { useEffect } from "react";

export default function Story5Redirect() {
  useEffect(() => {
    window.location.replace("/608/Story5/opening");
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-3xl flex-col rounded-lg bg-slate-950 p-6 shadow-2xl md:min-h-[calc(100vh-4rem)] border border-slate-700">
        <h1 className="text-2xl font-semibold text-white">Story 5: Climate & Storms</h1>
        <p className="mt-3 text-sm text-slate-300">
          Redirecting to the opening slide...
        </p>
        <Link
          className="mt-4 inline-flex w-fit items-center rounded-md bg-slate-700 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-600"
          href="/608/Story5/opening"
        >
          Go to Opening
        </Link>
      </div>
    </main>
  );
}
