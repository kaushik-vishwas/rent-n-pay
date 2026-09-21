import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    res.status(200).json({ orderId: order.id, amount: order.amount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const verifyRazorpayPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;
//     const body = razorpay_order_id + '|' + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(body)
//       .digest('hex');
//     if (expectedSignature !== razorpay_signature) {
//       return res.status(400).json({ message: 'Invalid payment signature' });
//     }
//     res.status(200).json({ verified: true });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Fetch the actual payment method used (card/upi/netbanking/wallet/emi)
    // from Razorpay, and persist it on the Order so refund-method screens
    // (Return modal, Cancel-order page) can show the real source instead
    // of a placeholder. Non-fatal: verification still succeeds even if
    // this lookup or the order update fails for any reason.
    // let paymentMethod = '';
    // try {
    //   const payment = await razorpay.payments.fetch(razorpay_payment_id);
    //   paymentMethod = payment.method || '';
    //   if (orderId && paymentMethod) {
    //     await Order.findByIdAndUpdate(orderId, {
    //       paymentMethod,
    //       paymentId: razorpay_payment_id,
    //     });
    //   }
    // } catch (fetchErr) {
    //   console.error('[razorpay-verify] method fetch/save failed', fetchErr);
    // }

    // res.status(200).json({ verified: true, paymentMethod });
    let paymentMethod = '';
    let paymentMethodDetail = '';
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      paymentMethod = payment.method || '';
      if (payment.method === 'card' && payment.card) {
        paymentMethodDetail = `${payment.card.network || 'Card'} ending ${payment.card.last4 || '----'}`;
      } else if (payment.method === 'upi' && payment.vpa) {
        paymentMethodDetail = payment.vpa;
      } else if (payment.method === 'netbanking' && payment.bank) {
        paymentMethodDetail = `${payment.bank} Net Banking`;
      } else if (payment.method === 'wallet' && payment.wallet) {
        paymentMethodDetail = `${payment.wallet} Wallet`;
      }
      if (orderId && paymentMethod) {
        await Order.findByIdAndUpdate(orderId, {
          paymentMethod,
          paymentMethodDetail,
          paymentId: razorpay_payment_id,
        });
      }
    } catch (fetchErr) {
      console.error('[razorpay-verify] method fetch/save failed', fetchErr);
    }

    res
      .status(200)
      .json({ verified: true, paymentMethod, paymentMethodDetail });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
