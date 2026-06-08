'use client';
import { useEffect, useState } from 'react';

export default function LogoCloud() {
  const [primaryColor, setPrimaryColor] = useState('');

  useEffect(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColorValue = rootStyles.getPropertyValue('--primary');
    setPrimaryColor(primaryColorValue.trim());
  }, []);

  const logos = [
    { name: 'International Schools', icon: '🏫' },
    { name: 'Language Centers', icon: '📚' },
    { name: 'Universities', icon: '🎓' },
    { name: 'Training Programs', icon: '📋' },
    { name: 'Online Teaching', icon: '💻' },
    { name: 'Government Programs', icon: '🏛️' },
  ];

  return (
    <div>
      <p className="mt-12 text-xs uppercase text-primary text-center font-bold tracking-[0.3em]">
        Trusted by schools across Asia
      </p>
      <div className="grid grid-cols-2 place-items-center justify-center my-12 sm:mt-8 md:mx-auto md:max-w-3xl sm:grid sm:gap-8 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex flex-col items-center justify-center h-20 w-32 hover:scale-105 transition-transform"
          >
            <span className="text-3xl mb-1">{logo.icon}</span>
            <span className="text-xs text-muted-foreground font-medium text-center">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
