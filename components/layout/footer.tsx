// components/layout/footer.tsx
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Image
              src="/image/Logo Beres.png"
              alt="Beres"
              width={120}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              All-in-one PDF tools. Free, fast, and secure.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Tools</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li><Link href="/merge-pdf">Merge PDF</Link></li>
              <li><Link href="/split-pdf">Split PDF</Link></li>
              <li><Link href="/compress-pdf">Compress PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Beres. All rights reserved.
        </p>
      </div>
    </footer>
  );
}