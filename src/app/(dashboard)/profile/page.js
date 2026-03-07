import GlobalSettingsLayout from '@/components/settings/GlobalSettingsLayout';

export const metadata = { title: 'User Profile - TraceWeave' };

export default function ProfilePage() {
  // Mounts the layout with 'profile' tab pre-selected
  return <GlobalSettingsLayout initialTab="profile" />;
}