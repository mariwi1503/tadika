'use client';

import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';

interface NavigationOptions {
  replace?: boolean;
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((to: string, options?: NavigationOptions) => {
    if (options?.replace) router.replace(to);
    else router.push(to);
  }, [router]);
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, children, ...props },
  ref,
) {
  return (
    <NextLink href={to} ref={ref} {...props}>
      {children}
    </NextLink>
  );
});

type NavLinkState = { isActive: boolean };
type NavLinkProps = Omit<LinkProps, 'className' | 'children'> & {
  end?: boolean;
  className?: string | ((state: NavLinkState) => string);
  children?: ReactNode | ((state: NavLinkState) => ReactNode);
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, end, className, children, ...props },
  ref,
) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  const state = { isActive };

  return (
    <NextLink
      href={to}
      ref={ref}
      className={typeof className === 'function' ? className(state) : className}
      {...props}
    >
      {typeof children === 'function' ? children(state) : children}
    </NextLink>
  );
});

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace }), [navigate, to, replace]);
  return null;
}

const OutletContext = createContext<ReactNode>(null);

export function OutletProvider({ children, outlet }: { children: ReactNode; outlet: ReactNode }) {
  return <OutletContext.Provider value={outlet}>{children}</OutletContext.Provider>;
}

export function Outlet() {
  return <>{useContext(OutletContext)}</>;
}

export function useParams(): { id?: string } {
  const pathname = usePathname();
  const match = pathname.match(/^\/admin\/students\/([^/]+)$/);
  return { id: match ? decodeURIComponent(match[1]) : undefined };
}
