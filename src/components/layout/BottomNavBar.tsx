
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/firebase/auth/use-user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, List, User, LogIn, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} className={cn(
      "flex flex-col items-center justify-center gap-1 w-full text-xs transition-colors",
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
    )}>
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
};

export default function BottomNavBar() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const pathname = usePathname();

  // An authenticated user must have an email. Anonymous users do not.
  const isFullUser = user && user.email;

  const hiddenOnPages = ['/login', '/signup', '/sell'];

  if (!isMobile || hiddenOnPages.includes(pathname)) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
      <div className="container h-full mx-auto px-4">
        <div className="flex justify-around items-center h-full">
          {isFullUser ? (
            <>
              <NavLink href="/" icon={Home} label="Accueil" />
              <NavLink href="/my-favorites" icon={Heart} label="Favoris" />
              <NavLink href="/sell" icon={PlusCircle} label="Vendre" />
              <NavLink href="/my-listings" icon={List} label="Annonces" />
              <NavLink href="/profile" icon={User} label="Profil" />
            </>
          ) : (
            <>
              <NavLink href="/" icon={Home} label="Accueil" />
              <NavLink href="/login" icon={LogIn} label="Connexion" />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
