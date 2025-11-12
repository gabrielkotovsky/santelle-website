import { redirect } from 'next/navigation';

const STRIPE_PORTAL_URL = 'https://billing.stripe.com/p/login/00wdRaaLq2nT2Nv9lqcAo00';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  redirect(STRIPE_PORTAL_URL);
}

