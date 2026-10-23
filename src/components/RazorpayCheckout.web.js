import { useEffect } from 'react';

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Browser version: loads Razorpay's checkout.js directly (WebView is not available on web).
// Same props / results as RazorpayCheckout.js.
export const RazorpayCheckout = ({ visible, options, onResult }) => {
  useEffect(() => {
    if (!visible || !options) return;
    let cancelled = false;

    loadScript().then((ok) => {
      if (cancelled) return;
      if (!ok) {
        onResult({ status: 'failed', message: 'Could not load Razorpay. Check your internet connection.' });
        return;
      }
      const rzp = new window.Razorpay({
        ...options,
        handler: (res) => onResult({ status: 'success', paymentId: res.razorpay_payment_id }),
        modal: { ondismiss: () => onResult({ status: 'dismissed' }) },
      });
      rzp.on('payment.failed', (res) =>
        onResult({ status: 'failed', message: res.error?.description || 'Payment failed' })
      );
      rzp.open();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return null;
};
