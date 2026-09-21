import ProtectedRoute from '@/components/ProtectedRoute';
import Referral from '@/site-pages/Referral';

export default function ReferralPage() {
  return (
    <ProtectedRoute>
      <Referral />
    </ProtectedRoute>
  );
}
