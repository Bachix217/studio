import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={cn(
      "bg-card border-t",
      "hidden md:block" // Caché sur mobile, visible sur desktop
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left text-sm text-muted-foreground">
              &copy; {currentYear} Tacoto.ch. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
                <Link href="/legal/mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors">
                    Mentions légales
                </Link>
                 <Link href="/legal/politique-de-confidentialite" className="text-muted-foreground hover:text-foreground transition-colors">
                    Confidentialité
                </Link>
                <Link href="/legal/cgu" className="text-muted-foreground hover:text-foreground transition-colors">
                    CGU
                </Link>
                <Link href="/legal/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
