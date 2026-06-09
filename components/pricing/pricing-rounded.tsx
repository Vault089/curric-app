'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card-header';
import type { Tables } from '@/types/db';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import pricingPlans, { dummyPricing } from '@/config/pricing';
import Link from 'next/link';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

interface Props {
  user: any | null | undefined;
  products: ProductWithPrices[];
  subscription: any;
}

export default function PricingRounded({ user, products }: Props) {
  const displayProducts = products.length ? products : dummyPricing;
  const plan = pricingPlans[0];

  if (!displayProducts.length) {
    return (
      <section className="container mx-auto" id="pricing">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <p className="text-4xl font-extrabold text-center sm:text-6xl">
            No pricing plans found.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto" id="pricing">
      <div className="flex flex-col items-center justify-center w-full min-h-screen py-10">
        <h1 className="text-3xl font-bold text-center">
          Simple, transparent pricing
        </h1>
        <p className="mt-2 text-center text-muted-foreground">
          One plan. No hidden fees. Cancel anytime.
        </p>

        <div className="grid gap-6 mt-10 md:grid-cols-1 max-w-md w-full">
          <Card className="w-full rounded-lg border-2">
            <CardHeader className="flex flex-col justify-center text-center">
              <CardTitle className="text-2xl font-bold">
                {plan.name}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {plan.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-5xl font-bold">$1.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Beta pricing — locked in while we launch
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant="default"
                className="mt-6 w-full"
                size="lg"
              >
                <Link href="/signup">
                  {user ? 'Manage Subscription' : 'Get Started'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
