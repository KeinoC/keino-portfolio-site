"use client";

/**
 * HiTide Capital storyboard — UI recreation for the KEI-024 video demo.
 *
 * NOT live recording. Faithful replica of the borrower funnel + DocuSign
 * contract flow + loan-status dashboard. The recording script
 * (scripts/record-demo.ts) drives this page through three scenes via
 * scripted clicks. The PiP chrome surfaces a "Recreation" watermark, and
 * this page does too — visible above the fold so a real user landing
 * here understands what they're looking at.
 *
 * Three scenes, advance via "Next" / "Continue" / "Finish" buttons:
 *   1. Borrower intake (Identity → Eligibility)
 *   2. DocuSign contract flow (Generating → Signing → Signed)
 *   3. Loan status (timeline dashboard)
 *
 * Gated to development. notFound() in production.
 */

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FileSignature,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Scene =
  | "intake-identity"
  | "intake-eligibility"
  | "contract-generating"
  | "contract-signing"
  | "contract-signed"
  | "status";

const STEPS = [
  { id: "intake", label: "Identity" },
  { id: "eligibility", label: "Eligibility" },
  { id: "contract", label: "Contract" },
  { id: "status", label: "Status" },
] as const;

function Watermark() {
  return (
    <div
      aria-hidden
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 text-[10px] tracking-[3px] uppercase text-zinc-400 bg-white/90 px-3 py-1 rounded-full ring-1 ring-zinc-200 shadow-sm pointer-events-none"
    >
      Demo recreation · Not a live system
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="size-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-900 text-[15px] tracking-tight">
            HiTide Capital
          </span>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-zinc-500">
          <ShieldCheck className="size-3.5" />
          Secured by 256-bit TLS
        </div>
      </div>
    </header>
  );
}

function Stepper({ active }: { active: (typeof STEPS)[number]["id"] }) {
  const activeIndex = STEPS.findIndex((s) => s.id === active);
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`size-6 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-sky-600 text-white"
                      : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              <span
                className={`text-[13px] ${
                  current ? "text-zinc-900 font-medium" : "text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <ChevronRight className="size-3.5 text-zinc-300" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function IntakeIdentity({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const valid = name.trim().length > 0 && email.includes("@");
  return (
    <Card>
      <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
        Let&apos;s get to know you
      </h1>
      <p className="mt-1.5 text-[14px] text-zinc-500">
        Step 1 of 4. Takes about 2 minutes.
      </p>
      <div className="mt-8 space-y-5">
        <Field label="Legal name">
          <input
            id="storyboard-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sample Applicant"
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </Field>
        <Field label="Email address">
          <input
            id="storyboard-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="demo@hitide.example"
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 text-[15px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </Field>
      </div>
      <button
        id="storyboard-next-identity"
        type="button"
        onClick={onNext}
        disabled={!valid}
        className="mt-8 w-full px-5 py-3 rounded-lg bg-sky-600 text-white text-[15px] font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        Continue to eligibility
        <ChevronRight className="size-4" />
      </button>
    </Card>
  );
}

function IntakeEligibility({ onNext }: { onNext: () => void }) {
  const checks = [
    { label: "Identity verified", detail: "Government ID matched on file" },
    { label: "Credit profile pulled", detail: "Hard inquiry not yet performed" },
    { label: "Income documentation accepted", detail: "Last 2 months of bank statements" },
  ];
  return (
    <Card>
      <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
        Eligibility check
      </h1>
      <p className="mt-1.5 text-[14px] text-zinc-500">
        We ran the standard checks before underwriting takes a look.
      </p>
      <ul className="mt-8 space-y-4">
        {checks.map((c, i) => (
          <motion.li
            key={c.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.18, duration: 0.3 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 ring-1 ring-emerald-200"
          >
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-[14px] text-zinc-900 font-medium">
                {c.label}
              </div>
              <div className="text-[12px] text-zinc-500 mt-0.5">{c.detail}</div>
            </div>
          </motion.li>
        ))}
      </ul>
      <button
        id="storyboard-next-eligibility"
        type="button"
        onClick={onNext}
        className="mt-8 w-full px-5 py-3 rounded-lg bg-sky-600 text-white text-[15px] font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
      >
        Generate contract
        <FileSignature className="size-4" />
      </button>
    </Card>
  );
}

function ContractGenerating({ onNext }: { onNext: () => void }) {
  // Auto-advance after a short delay so the recorder doesn't have to click.
  // Mirrors how a real envelope-generation transition feels.
  useEffect(() => {
    const t = setTimeout(onNext, 1800);
    return () => clearTimeout(t);
  }, [onNext]);
  return (
    <Card>
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="size-12 mx-auto rounded-full border-2 border-sky-200 border-t-sky-600"
        />
        <h1 className="mt-6 text-xl font-semibold text-zinc-900 tracking-tight">
          Generating envelope…
        </h1>
        <p className="mt-1.5 text-[13px] text-zinc-500">
          Pulling your terms from underwriting and packaging for DocuSign.
        </p>
      </div>
    </Card>
  );
}

function ContractSigning({ onNext }: { onNext: () => void }) {
  const [signed, setSigned] = useState(false);
  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Sign your loan agreement
          </h1>
          <p className="mt-1 text-[12px] text-zinc-500">
            Powered by DocuSign · Envelope #HT-2026-04-A12
          </p>
        </div>
        <span className="text-[11px] tracking-[1px] uppercase text-amber-700 bg-amber-100 px-2 py-1 rounded">
          Awaiting signature
        </span>
      </div>
      <div className="rounded-lg ring-1 ring-zinc-200 bg-zinc-50 p-6">
        <p className="text-[12px] text-zinc-500 leading-relaxed">
          BORROWER ACKNOWLEDGEMENT — By executing this agreement, the
          undersigned agrees to the terms set forth in the attached
          schedules. The lender reserves the right to amend conditions
          subject to satisfaction of the contingencies enumerated in
          Section 4.2…
        </p>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <div className="text-[10px] tracking-[2px] uppercase text-zinc-400">
              Signature
            </div>
            <div className="mt-1 h-12 w-64 border-b-2 border-zinc-300 flex items-end pb-1">
              <AnimatePresence>
                {signed ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                    className="text-2xl italic text-sky-700"
                  >
                    Sample Applicant
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
          <button
            id="storyboard-sign"
            type="button"
            onClick={() => {
              setSigned(true);
              setTimeout(onNext, 1100);
            }}
            disabled={signed}
            className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-[14px] font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            <FileSignature className="size-4" />
            {signed ? "Signing…" : "Sign here"}
          </button>
        </div>
      </div>
    </Card>
  );
}

function ContractSigned({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <div className="text-center py-10">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="size-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <Check className="size-8 text-emerald-600" />
        </motion.div>
        <h1 className="mt-6 text-xl font-semibold text-zinc-900 tracking-tight">
          Contract signed
        </h1>
        <p className="mt-1.5 text-[13px] text-zinc-500">
          Underwriting has been notified. Funding clears within 2 business days.
        </p>
        <button
          id="storyboard-view-status"
          type="button"
          onClick={onNext}
          className="mt-7 px-5 py-2.5 rounded-lg bg-sky-600 text-white text-[14px] font-medium hover:bg-sky-700 transition-colors inline-flex items-center gap-2"
        >
          View loan status
          <ChevronRight className="size-4" />
        </button>
      </div>
    </Card>
  );
}

function StatusDashboard() {
  const milestones = [
    {
      label: "Submitted",
      detail: "Apr 21 · 9:42 AM",
      done: true,
    },
    {
      label: "Underwriting",
      detail: "Apr 22 · 1:08 PM",
      done: true,
    },
    {
      label: "Approved",
      detail: "Apr 24 · 4:30 PM",
      done: true,
      current: true,
    },
    {
      label: "Funded",
      detail: "Apr 26 · pending",
      done: false,
    },
  ];
  return (
    <Card wide>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-[11px] tracking-[1px] uppercase text-zinc-500">
            Loan #HT-26-A12
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900 tracking-tight">
            $185,000 · Term loan
          </h1>
          <div className="mt-1 text-[13px] text-zinc-500">
            6.85% APR · 60 months · Fixed
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] tracking-[1px] uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
            Approved
          </span>
          <div className="mt-2 text-[12px] text-zinc-500">
            Funding scheduled
          </div>
        </div>
      </div>
      <div className="rounded-lg ring-1 ring-zinc-200 bg-white p-6">
        <ol className="space-y-5">
          {milestones.map((m, i) => (
            <li key={m.label} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`size-7 rounded-full flex items-center justify-center ${
                    m.current
                      ? "bg-sky-600 text-white ring-4 ring-sky-100"
                      : m.done
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-200 text-zinc-400"
                  }`}
                >
                  {m.current ? (
                    <CircleDot className="size-4" />
                  ) : m.done ? (
                    <Check className="size-4" />
                  ) : (
                    <span className="size-2 rounded-full bg-zinc-400" />
                  )}
                </div>
                {i < milestones.length - 1 ? (
                  <span
                    className={`flex-1 w-px mt-1 ${
                      m.done ? "bg-emerald-300" : "bg-zinc-200"
                    }`}
                    style={{ minHeight: 28 }}
                  />
                ) : null}
              </div>
              <div
                data-storyboard-milestone={m.label.toLowerCase()}
                className={`flex-1 px-4 py-3 rounded-lg ${
                  m.current ? "bg-sky-50 ring-1 ring-sky-200" : ""
                }`}
              >
                <div
                  className={`text-[14px] font-medium ${
                    m.current
                      ? "text-sky-900"
                      : m.done
                        ? "text-zinc-900"
                        : "text-zinc-400"
                  }`}
                >
                  {m.label}
                </div>
                <div className="text-[12px] text-zinc-500 mt-0.5">
                  {m.detail}
                </div>
                {m.current ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-sky-700">
                    <Sparkles className="size-3" />
                    Funds clear within 2 business days
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] tracking-[1px] uppercase text-zinc-500 mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function Card({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`bg-white rounded-2xl shadow-sm ring-1 ring-zinc-200 p-8 ${
        wide ? "max-w-3xl" : "max-w-xl"
      } w-full`}
    >
      {children}
    </motion.div>
  );
}

export default function HitideStoryboardPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const [scene, setScene] = useState<Scene>("intake-identity");

  const stepperActive: (typeof STEPS)[number]["id"] = (() => {
    if (scene === "intake-identity") return "intake";
    if (scene === "intake-eligibility") return "eligibility";
    if (
      scene === "contract-generating" ||
      scene === "contract-signing" ||
      scene === "contract-signed"
    )
      return "contract";
    return "status";
  })();

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 font-body">
      <Watermark />
      <Header />
      <div className="max-w-5xl mx-auto px-8 pt-10 pb-12">
        <Stepper active={stepperActive} />
      </div>
      <div className="max-w-5xl mx-auto px-8 pb-16 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={scene} className="w-full flex justify-center">
            {scene === "intake-identity" ? (
              <IntakeIdentity onNext={() => setScene("intake-eligibility")} />
            ) : scene === "intake-eligibility" ? (
              <IntakeEligibility onNext={() => setScene("contract-generating")} />
            ) : scene === "contract-generating" ? (
              <ContractGenerating onNext={() => setScene("contract-signing")} />
            ) : scene === "contract-signing" ? (
              <ContractSigning onNext={() => setScene("contract-signed")} />
            ) : scene === "contract-signed" ? (
              <ContractSigned onNext={() => setScene("status")} />
            ) : (
              <StatusDashboard />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
