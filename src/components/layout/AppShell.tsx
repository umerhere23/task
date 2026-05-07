"use client";

import { useEffect, type ReactNode, type SVGProps } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AppShell.module.css';
import { useAppAuth } from '@/hooks/useAppAuth';

type IconProps = SVGProps<SVGSVGElement>;

function DashboardIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h7V4H4v9Zm9 7h7V4h-7v16ZM4 20h7v-5H4v5Z" />
    </svg>
  );
}

function CustomersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 20c.8-2.7 2.8-4.2 5.5-4.2 2.3 0 4.2 1 5.2 2.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 20c.8-2.3 2.3-3.4 4.5-3.4 2.1 0 3.8.8 4.5 2.5" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-1.5a4 4 0 0 0-3-3.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a4 4 0 0 1 0 7.6" />
    </svg>
  );
}

function ActivityIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l5 5" />
    </svg>
  );
}

function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

interface AppShellProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, organization, logout, isAuthenticated } = useAppAuth();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
    { href: '/customers', label: 'Customers', icon: CustomersIcon },
    { href: '/users', label: 'Users', icon: UsersIcon },
    { href: '/activity', label: 'Activity', icon: ActivityIcon },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brandMark}>M</div>
          <div className={styles.brandTextBlock}>
            <p className={styles.brandName}>Multi-tenant CRM</p>
            <p className={styles.brandSubtext}>{organization?.name || 'Organization workspace'}</p>
          </div>
        </div>

        <nav className={styles.sidebarNav} aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const NavIcon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarLink} ${active ? styles.sidebarLinkActive : ''}`}
              >
                <NavIcon className={styles.sidebarLinkIcon} />
                <span>{item.label}</span>
                <ChevronRightIcon className={styles.sidebarLinkChevron} />
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarCard}>
          <p className={styles.sidebarCardLabel}>Signed in as</p>
          <p className={styles.sidebarCardName}>{session?.name || 'User'}</p>
          <p className={styles.sidebarCardMeta}>{session?.role || 'member'}</p>
        </div>
      </aside>

      <div className={styles.mainArea}>
        <header className={styles.topbar}>
          <div className={styles.topbarSearch}>
            <SearchIcon className={styles.topbarSearchIcon} />
            <span>Search customers, users, or activity</span>
          </div>

          <div className={styles.topbarActions}>
            {actions}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className={styles.logoutButton}
            >
              <LogoutIcon className={styles.buttonIcon} />
              Logout
            </button>
          </div>
        </header>

        {(title || subtitle) && (
          <div className={styles.pageHeader}>
            <div>
              {title && <h1 className={styles.pageTitle}>{title}</h1>}
              {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
            </div>
          </div>
        )}

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
