'use client';

import { FormEvent, useState } from "react";

type Guest = {
  id: string;
  Name: string;
  Phone: string;
  Email?: string;
  RSVP_Status?: string;
  Attendance?: string;
  Seat_Number?: number;
  Unique_Code?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return `0${digits.slice(3)}`;
  return digits.startsWith("0") ? digits : digits;
}

export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState("Yes");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const weddingTitle = process.env.NEXT_PUBLIC_WEDDING_TITLE || "Gabby & Esther Wedding";
  const weddingDate = process.env.NEXT_PUBLIC_WEDDING_DATE || "Saturday, 14th December 2024";
  const weddingVenue = process.env.NEXT_PUBLIC_WEDDING_VENUE || "The Grand Ballroom, Eko Hotel & Suites";

  const verifyGuest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);
    setGuest(null);
    setIsVerifying(true);

    try {
      const response = await fetch("/api/check-guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Could not verify the phone number.");
        return;
      }

      setGuest(data.guest);
      setEmail(data.guest.Email || "");
      setAttendance(data.guest.Attendance || "Yes");

      if (data.guest.RSVP_Status === "Confirmed") {
        setStatusMessage("You have already confirmed your RSVP. You can download your card below.");
      }
      if (data.guest.RSVP_Status === "Declined") {
        setStatusMessage("We have recorded your response as declined. Thank you.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const submitRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    if (!guest) {
      setErrorMessage("Please verify your phone number before submitting.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: guest.Phone, email, attendance }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Unable to submit your RSVP.");
        return;
      }

      setGuest(data.guest);
      setStatusMessage(data.message || "RSVP submitted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reach the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCard = async () => {
    if (!guest?.Unique_Code) {
      setErrorMessage("No unique code found. Please submit your RSVP first.");
      return;
    }

    setErrorMessage(null);
    setStatusMessage("Preparing your RSVP card...");

    try {
      const response = await fetch(`/api/generate-card?code=${encodeURIComponent(guest.Unique_Code)}`);
      if (!response.ok) {
        const body = await response.json();
        setErrorMessage(body.error || "Failed to generate the card.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${guest.Name.replace(/\s+/g, "_")}-RSVP-card.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatusMessage("Your RSVP card is ready.");
    } catch (error) {
      setErrorMessage("Could not download the RSVP card.");
    }
  };

  const canSubmit = Boolean(guest && guest.RSVP_Status === "Pending");
  const hasAlreadyResponded = Boolean(guest && guest.RSVP_Status && guest.RSVP_Status !== "Pending");

  return (
    <main className="min-h-screen bg-ivory text-deep-green">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12 lg:px-10">
        <section className="mb-10 rounded-[2rem] border border-champagne-200 bg-white/90 p-10 shadow-xl shadow-champagne-100 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.36em] text-champagne-800">Wedding RSVP</p>
            <h1 className="mt-4 text-5xl font-serif font-semibold leading-tight text-deep-green sm:text-6xl">
              {weddingTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-deep-green/75 sm:text-lg">
              Confirm your attendance by verifying your phone number. If you are invited, you will be able to submit your RSVP and download your admission card.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="rounded-3xl bg-champagne-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-deep-green/70">Date</p>
                <p className="mt-3 text-lg font-medium text-deep-green">{weddingDate}</p>
              </div>
              <div className="rounded-3xl bg-champagne-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-deep-green/70">Venue</p>
                <p className="mt-3 text-lg font-medium text-deep-green">{weddingVenue}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl rounded-[2rem] bg-white/95 p-8 shadow-xl shadow-champagne-100 sm:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-deep-green">Verify your invitation</h2>
            <p className="mt-3 text-sm leading-7 text-deep-green/70">
              Start by submitting the phone number you used for the invitation. If you are invited, your name will be auto-populated.
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {statusMessage ? (
            <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {statusMessage}
            </div>
          ) : null}

          <form onSubmit={verifyGuest} className="grid gap-4">
            <label className="space-y-2 text-sm font-medium text-deep-green/85">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="e.g. 08012345678"
                className="w-full rounded-3xl border border-champagne-200 bg-ivory px-4 py-3 text-base text-deep-green shadow-sm outline-none transition focus:border-deep-green/80 focus:ring-2 focus:ring-champagne-200"
              />
            </label>

            <button
              type="submit"
              disabled={isVerifying}
              className="inline-flex items-center justify-center rounded-3xl bg-deep-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2a0f] disabled:cursor-not-allowed disabled:bg-deep-green/60"
            >
              {isVerifying ? "Verifying..." : "Verify invitation"}
            </button>
          </form>

          {guest ? (
            <div className="mt-10 rounded-[2rem] border border-champagne-200 bg-champagne-50 p-6">
              <h3 className="text-xl font-semibold text-deep-green">Guest details</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-deep-green/80">Name</label>
                  <input readOnly value={guest.Name} className="w-full rounded-3xl border border-champagne-200 bg-white px-4 py-3 text-base text-deep-green" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-deep-green/80">Phone</label>
                  <input readOnly value={guest.Phone} className="w-full rounded-3xl border border-champagne-200 bg-white px-4 py-3 text-base text-deep-green" />
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-deep-green">RSVP</h4>

                <form onSubmit={submitRsvp} className="grid gap-4 mt-5">
                  <label className="space-y-2 text-sm font-medium text-deep-green/85">
                    Email address
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-3xl border border-champagne-200 bg-ivory px-4 py-3 text-base text-deep-green outline-none focus:border-deep-green/80 focus:ring-2 focus:ring-champagne-200"
                      disabled={hasAlreadyResponded}
                    />
                  </label>

                  <fieldset className="grid gap-3 rounded-3xl border border-champagne-200 bg-ivory p-4">
                    <legend className="text-sm font-medium text-deep-green/85">Will you be attending?</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: "Yes", label: "Yes, I will attend" },
                        { value: "No", label: "No, I cannot attend" },
                      ].map((option) => (
                        <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-3xl border border-champagne-200 bg-white px-4 py-3 text-sm transition hover:border-deep-green/80">
                          <input
                            type="radio"
                            name="attendance"
                            value={option.value}
                            checked={attendance === option.value}
                            onChange={() => setAttendance(option.value)}
                            disabled={hasAlreadyResponded}
                            className="h-4 w-4 accent-deep-green"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {!hasAlreadyResponded ? (
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="inline-flex items-center justify-center rounded-3xl bg-deep-green px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2a0f] disabled:cursor-not-allowed disabled:bg-deep-green/60"
                    >
                      {isSubmitting ? "Submitting..." : "Submit RSVP"}
                    </button>
                  ) : null}
                </form>

                {guest.RSVP_Status === "Confirmed" ? (
                  <div className="mt-6 rounded-3xl bg-green-50 p-4 text-sm text-green-800">
                    <p className="font-semibold">Confirmed</p>
                    <p className="mt-2">Your RSVP is confirmed. Download your RSVP card below.</p>
                    <button
                      type="button"
                      onClick={downloadCard}
                      className="mt-4 inline-flex items-center justify-center rounded-3xl bg-deep-green px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f2a0f]"
                    >
                      Download RSVP card
                    </button>
                  </div>
                ) : null}

                {guest.RSVP_Status === "Declined" ? (
                  <div className="mt-6 rounded-3xl bg-red-50 p-4 text-sm text-red-800">
                    <p className="font-semibold">Response recorded</p>
                    <p className="mt-2">Sorry you can't make it ❤️ Thank you for letting us know.</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
