export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {currentYear} Tacoto.ch. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
