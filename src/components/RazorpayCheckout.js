import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

// Phone version (Expo Go): runs Razorpay's web checkout inside a WebView, so no
// native Razorpay SDK and no backend are needed. The web version is RazorpayCheckout.web.js.
//
// onResult receives { status: 'success', paymentId } | { status: 'failed', message } | { status: 'dismissed' }
export const RazorpayCheckout = ({ visible, options, onResult }) => {
  const insets = useSafeAreaInsets();

  if (!visible || !options) return null;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="margin:0;background:#ffffff;">
<script>
  function send(data) { window.ReactNativeWebView.postMessage(JSON.stringify(data)); }
  var options = ${JSON.stringify(options)};
  options.handler = function (res) { send({ status: 'success', paymentId: res.razorpay_payment_id }); };
  options.modal = { ondismiss: function () { send({ status: 'dismissed' }); } };
  try {
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (res) {
      send({ status: 'failed', message: (res.error && res.error.description) || 'Payment failed' });
    });
    rzp.open();
  } catch (e) {
    send({ status: 'failed', message: 'Could not load Razorpay. Check your internet connection.' });
  }
</script>
</body>
</html>`;

  const handleMessage = (event) => {
    try {
      onResult(JSON.parse(event.nativeEvent.data));
    } catch {
      onResult({ status: 'failed', message: 'Unexpected response from Razorpay' });
    }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={() => onResult({ status: 'dismissed' })}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: 'https://checkout.razorpay.com' }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          )}
          // UPI apps open via intent/upi:// links - hand those to the phone
          onShouldStartLoadWithRequest={(req) => {
            if (/^(https?|about|data|blob):/.test(req.url)) return true;
            Linking.openURL(req.url).catch(() => {});
            return false;
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
