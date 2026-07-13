import Link from "next/link";

export function BackHome() {
  return (
    <Link
      href="/"
      className="group mb-16 inline-flex items-center gap-2 text-sm tracking-wide text-neutral-500 transition-colors hover:text-neutral-900"
    >
      <span
        aria-hidden
        className="inline-block transition-transform group-hover:-translate-x-0.5"
      >
        ←
      </span>
      Home
    </Link>
  );
}
