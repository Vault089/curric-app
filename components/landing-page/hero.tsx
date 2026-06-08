'use client';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Star } from 'lucide-react';
import Particles from '@/components/magicui/particles';
import Ripple from '@/components/magicui/ripple';
import AnimatedGradientText from '@/components/magicui/animated-shiny-text';
import { ArrowRightIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  const { theme } = useTheme();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles
          className="absolute inset-0"
          quantity={300}
          ease={80}
          color={theme === 'dark' ? '#FFFFFF' : '#000000'}
          refresh
        />
        <Ripple />
      </div>
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-32">
        <div className="relative z-10 flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
          <Link href="/#features" className="w-fit">
            <div
              className={cn(
                'group rounded-full border border-black/5 bg-neutral-100 text-base text-secondary transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800',
              )}
            >
              <AnimatedGradientText className="inline-flex items-center justify-center px-4 py-2 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                🌏 <span className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300"></span>{' '}
                <span
                  className={cn(
                    `inline animate-gradient bg-gradient-to-r from-[#b76a24] via-[#6a24b7] to-[#b76a24] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                  )}
                >
                  Trusted by teachers across Asia
                </span>
                <ArrowRightIcon className="ml-2 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedGradientText>
            </div>
          </Link>

          <h1 className="font-heading tracking-tight font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            Find Your Dream ESL Teaching Job in Asia
          </h1>
          <div className="max-w-[42rem] font-bold tracking-tight text-primary sm:text-xl sm:leading-8 rounded-full p-2">
            Connect with top international schools, language centers, and universities. Built for non-native English teachers.
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/jobs" className={cn(buttonVariants({ size: 'xl' }), 'rounded-full border-2 border-primary dark:border-white text-bold text-white')}>
              Browse Jobs
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: 'outline', size: 'xl' }), 'rounded-full border-2 border-primary dark:border-white text-semibold')}
            >
              Create Profile
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full">
            <div className="flex flex-col mt-2">
              <div className="flex flex-row justify-center sm:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-yellow-200 text-yellow-300 size-5"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold">
                Join 2,500+ teachers finding jobs in Asia
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
