// @ts-nocheck
import { createClient } from '@/utils/supabase/server';
import { getUser, getProducts } from '@/utils/supabase/queries';
import PricingRounded from './pricing-rounded';

export default async function PricingPage() {
  const supabase = createClient();
  const [user, products] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
  ]);

  return (
    <PricingRounded
      user={user}
      products={products ?? []}
      subscription={null}
    />
  );
}
