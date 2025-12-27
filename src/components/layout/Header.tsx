'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Menu, List, User as UserIcon, LogOut, UserCircle } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from '@/firebase/auth/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
  };
  
  const navigateTo = (path: string) => {
    router.push(path);
  }

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Utilisateur'} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || <UserIcon />}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName || 'Mon Compte'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigateTo('/profile')}>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigateTo('/my-listings')}>
          <List className="mr-2 h-4 w-4" />
          <span>Mes annonces</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const AuthLinks = () => (
    <>
       <Button variant="ghost" asChild>
        <Link href="/sell" className="font-semibold" onClick={() => setIsMenuOpen(false)}>Vendre ma voiture</Link>
      </Button>
    </>
  );
  
  const GuestLinks = () => (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
      </Button>
      <Button asChild>
        <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Inscription</Link>
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
            {user ? <AuthLinks /> : null}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-2">
              {user ? <UserMenu /> : <GuestLinks />}
            </div>

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
                    {user ? <AuthLinks /> : <GuestLinks />}
                  </div>
                </SheetContent>
              </Sheet>
               {user && <div className="md:hidden"><UserMenu /></div>}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
