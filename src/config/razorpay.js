// Razorpay TEST key (Dashboard → Account & Settings → API Keys → Generate Test Key).
// Only the Key ID goes here - never put the Key Secret inside the app.
export const RAZORPAY_KEY_ID = 'rzp_test_TrFR9aRKwA0Bh9';

export const isRazorpayConfigured = () =>
  /^rzp_(test|live)_[A-Za-z0-9]+$/.test(RAZORPAY_KEY_ID) && !RAZORPAY_KEY_ID.includes('REPLACE');

// Builds the options object passed to Razorpay Checkout
export const buildRazorpayOptions = ({ amount, user, description }) => ({
  key: RAZORPAY_KEY_ID,
  amount: Math.round(amount * 100), // Razorpay expects paise
  currency: 'INR',
  name: 'Janify',
  description,
  prefill: {
    name: user.name || '',
    email: user.email || '',
    contact: (user.phone || '').replace(/[^0-9]/g, '').slice(-10),
  },
  theme: { color: '#111111' },
});
