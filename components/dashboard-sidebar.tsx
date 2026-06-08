'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem, iconComponents } from '@/config/dashboard';

const Sidebar = ({ navConfig }: { navConfig: NavItem[] }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
      <TooltipProvider>
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          prefetch={false}
        >
          <span className="text-xs font-bold">C</span>
          <span className="sr-only">Curric.app</span>
        </Link>
        {navConfig.map((item, index) => {
          const IconComponent =
            iconComponents[item.icon as keyof typeof iconComponents];
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
          const isDisabled = item.disabled;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
                    isDisabled
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isDisabled ? (
                    <IconComponent className="h-5 w-5 opacity-50" />
                  ) : (
                    <Link
                      href={item.href}
                      className="flex h-full w-full items-center justify-center"
                      prefetch={false}
                    >
                      <IconComponent className="h-5 w-5" />
                    </Link>
                  )}
                  <span className="sr-only">{item.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isDisabled ? `${item.label} (Coming Soon)` : item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </nav>
  );
};

export default Sidebar;
