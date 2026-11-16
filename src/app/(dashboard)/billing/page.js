import GlobalSettingsLayout from '@/components/settings/GlobalSettingsLayout';

export const metadata = { title: 'Billing & Plan - TraceWeave' };

export default function BillingPage() {
  return <GlobalSettingsLayout initialTab="billing" />;
}
