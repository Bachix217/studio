'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Menu, List, User as UserIcon, LogOut, UserCircle, X } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
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
import { Separator } from '../ui/separator';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const { auth } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut(auth);
    router.push('/');
  };
  
  const navigateTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  }

  const UserMenuDesktop = () => (
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
  
  const GuestLinks = () => (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Connexion</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Inscription</Link>
      </Button>
    </>
  );
  
  const MobileSheetMenu = () => (
     <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
          <SheetHeader className="p-4 border-b">
              <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary" onClick={() => setIsMenuOpen(false)}>
                <Car size={28} />
                <span>Tacoto.ch</span>
              </Link>
          </SheetHeader>
          <div className="flex flex-col h-full p-4">
              {user ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                     <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Utilisateur'} />
                      <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || <UserIcon />}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col space-y-0.5">
                      <p className="text-base font-medium leading-none">{user?.displayName || 'Mon Compte'}</p>
                      <p className="text-sm leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <nav className="flex flex-col space-y-2 mt-4 text-lg">
                     <Button variant="ghost" className="justify-start text-base" onClick={() => navigateTo('/sell')}>Vendre ma voiture</Button>
                     <Button variant="ghost" className="justify-start text-base" onClick={() => navigateTo('/profile')}>Profil</Button>
                     <Button variant="ghost" className="justify-start text-base" onClick={() => navigateTo('/my-listings')}>Mes annonces</Button>
                  </nav>
                  <div className="mt-auto">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Inscription</Link>
                  </Button>
                </div>
              )}
          </div>
        </SheetContent>
      </Sheet>
  )

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Car size={28} />
              <span>Tacoto.ch</span>
            </Link>
             {user && (
              <nav className="hidden md:flex items-center">
                 <Button variant="ghost" asChild>
                  <Link href="/sell" className="font-semibold">Vendre ma voiture</Link>
                </Button>
              </nav>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? <UserMenuDesktop /> : <GuestLinks />}
          </div>

          <div className="md:hidden">
            <MobileSheetMenu />
          </div>

        </div>
      </div>
    </header>
  );
}
