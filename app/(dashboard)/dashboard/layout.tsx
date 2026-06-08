// @ts-nocheck
import Link from 'next/link';
import { NavItem, navConfig } from '@/config/dashboard';
import { createClient } from '@/utils/supabase/server';
import {
  getUser,
  getUserDetails,
} from '@/utils/supabase/queries';
import { Navbar } from '@/components/dashboard-navbar';
import Sidebar from '@/components/dashboard-sidebar';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const supabase = createClient();
  const [user, userDetails] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
  ]);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <Sidebar navConfig={navConfig as NavItem[]} />
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Navbar userDetails={userDetails} navConfig={navConfig as NavItem[]} />
        <main className="grid flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
