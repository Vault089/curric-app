import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import pricingPlans from '@/config/pricing';

export default function PricingPage() {
  const plan = pricingPlans[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-muted-foreground">
          One plan. No hidden fees. Cancel anytime.
        </p>
      </div>

      <Card className="mt-10 w-full max-w-md border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <span className="text-5xl font-bold">$1.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Beta pricing — locked in while we launch
          </p>
          <ul className="space-y-3">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
