import {
  LayoutDashboard,
  Briefcase,
  User,
  Bookmark,
  FileText,
  Settings
} from 'lucide-react';

export interface NavItem {
  href: string;
  icon: keyof typeof iconComponents;
  label: string;
  disabled?: boolean;
}

export const iconComponents = {
  LayoutDashboard,
  Briefcase,
  User,
  Bookmark,
  FileText,
  Settings
};

export const navConfig = [
  { href: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
  { href: '/dashboard/jobs', icon: 'Briefcase', label: 'Browse Jobs' },
  { href: '/dashboard/profile', icon: 'User', label: 'My Profile' },
  { href: '/dashboard/saved', icon: 'Bookmark', label: 'Saved Jobs' },
  { href: '/dashboard/applications', icon: 'FileText', label: 'Applications' },
  { href: '/dashboard/settings', icon: 'Settings', label: 'Settings' }
];
