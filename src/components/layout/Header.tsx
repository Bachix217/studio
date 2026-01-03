'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Car, Menu, List, User as UserIcon, LogOut, UserCircle, X, FileText, Shield, HelpCircle, BookUser, Heart, Sparkles } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const legalLinks = [
    { href: "/legal/mentions-legales", label: "Mentions légales", icon: FileText },
    { href: "/legal/politique-de-confidentialite", label: "Confidentialité", icon: Shield },
    { href: "/legal/cgu", label: "CGU", icon: BookUser },
    { href: "/legal/faq", label: "FAQ", icon: HelpCircle },
];

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

  // An authenticated user must have an email.
  const isFullUser = user && user.email;

  const UserMenuDesktop = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
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
         <DropdownMenuItem onClick={() => navigateTo('/my-favorites')}>
          <Heart className="mr-2 h-4 w-4" />
          <span>Mes favoris</span>
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
              <Link href="/" className="flex items-center gap-2 text-xl font-black text-primary" onClick={() => setIsMenuOpen(false)}>
                <Car size={24} />
                <span>Tacoto</span>
              </Link>
          </SheetHeader>
          <div className="flex flex-col h-full p-4">
              <div className="flex-grow space-y-6">
                {isFullUser ? (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
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
                    <nav className="flex flex-col space-y-2 mt-6 text-lg">
                      <Button variant="ghost" className="justify-start text-base py-6" onClick={() => navigateTo('/sell')}>Vendre ma voiture</Button>
                      <Button variant="ghost" className="justify-start text-base py-6" onClick={() => navigateTo('/catch-car')}>CatchCar</Button>
                      <Button variant="ghost" className="justify-start text-base py-6" onClick={() => navigateTo('/my-listings')}>Mes annonces</Button>
                      <Button variant="ghost" className="justify-start text-base py-6" onClick={() => navigateTo('/my-favorites')}>Mes favoris</Button>
                      <Button variant="ghost" className="justify-start text-base py-6" onClick={() => navigateTo('/profile')}>Profil</Button>
                    </nav>
                    <div className="mt-auto">
                        <Button variant="ghost" className="justify-start w-full text-base py-6 text-destructive hover:text-destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Button size="lg" asChild className="w-full">
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Inscription</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" asChild>
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-auto">
                 <Separator className="my-4" />
                 <nav className="flex flex-col space-y-2 text-base">
                    {legalLinks.map(({href, label, icon: Icon}) => (
                         <Button key={href} variant="ghost" className="justify-start text-muted-foreground" onClick={() => navigateTo(href)}>
                           <Icon className="mr-2 h-4 w-4" />
                           {label}
                         </Button>
                    ))}
                 </nav>
              </div>
          </div>
        </SheetContent>
      </Sheet>
  )

  return (
    <header className="bg-background/80 border-b shadow-sm sticky top-0 z-40 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-black text-primary">
              <Car size={24} />
              <span>Tacoto</span>
            </Link>
             {isFullUser && (
              <nav className="hidden md:flex items-center gap-6">
                 <Link href="/sell" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Vendre</Link>
                 <Link href="/catch-car" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <Sparkles size={16} />
                    CatchCar
                </Link>
                 <Link href="/my-listings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Mes annonces</Link>
                 <Link href="/my-favorites" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Mes favoris</Link>
              </nav>
            )}
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {isFullUser ? <UserMenuDesktop /> : <GuestLinks />}
          </div>

          <div className="md:hidden">
            <MobileSheetMenu />
          </div>

        </div>
      </div>
    </header>
  );
}
