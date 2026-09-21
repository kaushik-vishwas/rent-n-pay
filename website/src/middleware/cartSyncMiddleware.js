import { api } from '@/lib/axios';

/**
 * Cart Live-Sync Middleware
 * ---------------------------------------------------------------
 * Listens for cart-changing actions and pushes the resulting cart
 * items to the backend (POST /api/live-cart/sync) so admin can see
 * live carts. This runs AFTER the reducer updates state, so existing
 * behavior (localStorage save, UI update) is completely unchanged.
 *
 * If the sync call fails (e.g. user not logged in, network issue),
 * it fails silently — cart still works normally for the user via
 * localStorage, exactly as before this middleware was added.
 */
const CART_SYNC_ACTION_TYPES = new Set([
  'cart/addToCart',
  'cart/removeFromCart',
  'cart/updateQuantity',
  'cart/updateTenure',
  'cart/updateRentalDates',
  'cart/clearCart',
]);

export const cartSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  console.log('[cartSyncMiddleware] action fired:', action.type);

  if (CART_SYNC_ACTION_TYPES.has(action.type)) {
    try {
      const state = store.getState();
      const items = state?.cart?.items || [];
      const isAuthenticated = state?.auth?.isAuthenticated;

      console.log(
        '[cartSyncMiddleware] cart action matched. isAuthenticated:',
        isAuthenticated,
        'items:',
        items,
      );

      if (isAuthenticated) {
        console.log('[cartSyncMiddleware] sending POST /live-cart/sync ...');
        api
          .post('/live-cart/sync', { items })
          .then((res) => {
            console.log('[cartSyncMiddleware] sync SUCCESS:', res.data);
          })
          .catch((err) => {
            console.log(
              '[cartSyncMiddleware] sync FAILED:',
              err?.response?.status,
              err?.response?.data || err.message,
            );
          });
      } else {
        console.log(
          '[cartSyncMiddleware] SKIPPED — user not authenticated, cart not synced to server',
        );
      }
    } catch (e) {
      console.log('[cartSyncMiddleware] unexpected error:', e);
    }
  }

  return result;
};
