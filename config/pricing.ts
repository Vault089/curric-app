import { Tables } from '@/types/db';

interface Plan {
  name: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  yearlyPrice: number;
}

const pricingPlans: Plan[] = [
  {
    name: 'Curric.app Pro',
    description: 'Everything you need to land your dream teaching job abroad.',
    features: [
      'Unlimited job applications',
      'Full teacher profile',
      'Direct messaging with schools',
      'Priority matching',
      'CV hosting'
    ],
    monthlyPrice: 199,
    yearlyPrice: 1990
  }
];

export default pricingPlans;

type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}

export const dummyPricing: ProductWithPrices[] = [
  {
    id: 'curric-pro',
    name: 'Curric.app Pro',
    description: 'Everything you need to land your dream teaching job abroad.',
    prices: [
      {
        id: 'curric-pro-price-month',
        currency: 'USD',
        unit_amount: 199,
        interval: 'month',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'curric-pro',
        description: null,
        metadata: null
      },
      {
        id: 'curric-pro-price-year',
        currency: 'USD',
        unit_amount: 1990,
        interval: 'year',
        interval_count: 1,
        trial_period_days: null,
        type: 'recurring',
        active: true,
        product_id: 'curric-pro',
        description: null,
        metadata: null
      }
    ],
    image: null,
    metadata: null,
    active: true
  }
];
