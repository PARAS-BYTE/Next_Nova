"use client";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, href, ...props }, ref) => {
    const pathname = usePathname() || "";
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
