'use client';

import { features } from '@/config/features';
import { motion } from 'framer-motion';
import React from 'react';

export default function FeaturesHover() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-zinc-50 py-8 dark:bg-zinc-900 md:py-12 lg:py-24 rounded-6xl mb-10"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Everything You Need to Land Your Next Teaching Job
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Curric.app gives you the tools to showcase your skills, connect with
          schools, and secure your ideal ESL teaching position in Asia.
        </p>
      </div>
      <div className="mx-auto grid w-full gap-6 sm:grid-cols-2 md:grid-cols-2 md:max-w-[54rem]">
        {features.map((feature) => (
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', bounce: 0.7 }}
            key={feature.title}
            className="relative overflow-hidden rounded-lg border bg-background dark:bg-zinc-950 p-6"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 fill-current mb-4"
            >
              <path d={feature.svgPath} />
            </svg>
            <div className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              {feature.title}
            </div>
            <div className="text-sm font-normal text-gray-500 dark:text-gray-500">
              {feature.description}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
