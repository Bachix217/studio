'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Button variant="ghost" asChild>
        <Link href="/sell" className="font-semibold" onClick={() => setIsMenuOpen(false)}>Vendre ma voiture</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="#" className="flex items-center gap-2 font-semibold" onClick={() => setIsMenuOpen(false)}>
          <Heart size={18} />
          Mes favoris
        </Link>
      </Button>
    </>
  );

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Car size={28} />
              <span>Tacoto.ch</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </nav>

          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 pt-10">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
