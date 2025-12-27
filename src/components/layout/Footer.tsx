import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left text-sm text-muted-foreground">
              &copy; {currentYear} Tacoto.ch. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4 text-sm">
                <Link href="/legal/mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors">
                    Mentions légales
                </Link>
                <Link href="/legal/politique-de-confidentialite" className="text-muted-foreground hover:text-foreground transition-colors">
                    Politique de confidentialité
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
