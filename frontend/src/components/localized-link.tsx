'use client';

import Link, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { localeFromPathname, withLocale } from '@/lib/locale-path';

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children: ReactNode;
  };

export function LocalizedLink({ href, children, ...props }: Props) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const localizedHref =
    typeof href === 'string' ? withLocale(href, locale) : href;

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}
