import ProtectedRoute from '@/components/ProtectedRoute';
import MyPayments from '@/site-pages/MyPayments';

export default function PaymentListsPage() {
  return (
    <ProtectedRoute>
      <MyPayments />
    </ProtectedRoute>
  );
}
