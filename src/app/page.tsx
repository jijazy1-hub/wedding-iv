export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="rounded-3xl border border-champagne-200 bg-white/80 p-10 shadow-xl shadow-champagne-100 backdrop-blur-sm">
        <h1 className="text-4xl font-serif text-deep-green sm:text-5xl">
          {process.env.NEXT_PUBLIC_WEDDING_TITLE || "Wedding RSVP"}
        </h1>
        <p className="mt-4 text-lg text-deep-green/80 sm:text-xl">
          {process.env.NEXT_PUBLIC_WEDDING_DATE || "Wedding date not configured yet."}
        </p>
        <p className="mt-1 text-sm text-deep-green/70 sm:text-base">
          {process.env.NEXT_PUBLIC_WEDDING_VENUE || "Please set wedding venue in .env.local."}
        </p>
        <div className="mt-8 rounded-2xl bg-champagne-50 p-6 text-left text-sm leading-7 text-deep-green/90">
          <p className="font-semibold">Deployment restored</p>
          <p className="mt-3">
            The app source was missing from this repository, so a minimal Next.js shell was added.
          </p>
          <p className="mt-3">
            Replace this page with your full RSVP application in <code className="rounded bg-white px-1 py-0.5 text-xs text-deep-green">src/app</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
