import { Link, useLocation } from 'wouter';
import { BookOpen, House, RotateCcw, Library } from 'lucide-react';
import { AnimatedBackground } from './motion-primitives/animated-background';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from './ui/navigation-menu';

const destinations = [
  { href: '/dashboard', label: 'Today', icon: House },
  { href: '/languages', label: 'Learn', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: RotateCcw },
  { href: '/words', label: 'Words', icon: Library },
];

/** Product routes composed with Watermelon navigation and Motion Primitives. */
export default function PrimaryNavigation({ mobile = false }: { mobile?: boolean }) {
  const [location] = useLocation();
  const active = destinations.find(({ href }) => location === href || location.startsWith(href + '/'))?.href
    ?? (location.startsWith('/language/') ? '/languages' : location.startsWith('/conversation') ? '/practice' : '');
  return <NavigationMenu viewport={false} className={mobile ? 'mobile-tabbar' : 'desktop-navigation'} aria-label="Primary navigation">
    <NavigationMenuList className={mobile ? 'mobile-tabbar-inner primary-navigation' : 'desktop-navigation-inner primary-navigation'}>
      <AnimatedBackground value={active} defaultValue={active} className="animated-background-selection" transition={{ type: 'spring', stiffness: 480, damping: 40, mass: .7 }}>
        {destinations.map(({ href, label, icon: Icon }) => <NavigationMenuItem key={href} data-id={href}>
          <NavigationMenuLink asChild active={active === href} className={`${mobile ? 'mobile-tab' : 'desktop-tab'} ${active === href ? 'is-active' : ''}`}>
            <Link href={href} aria-current={active === href ? 'page' : undefined}><span className="nav-item-content"><Icon size={18} aria-hidden="true" /><span>{label}</span></span></Link>
          </NavigationMenuLink>
        </NavigationMenuItem>)}
      </AnimatedBackground>
    </NavigationMenuList>
  </NavigationMenu>;
}
