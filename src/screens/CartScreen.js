import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { Colors } from '../theme/colors';
import { readableWidth } from '../utils/layout';
import { formatPrice } from '../utils/currency';
import { FREE_DELIVERY_MIN } from '../context/AppContext';
import { RazorpayCheckout } from '../components/RazorpayCheckout';
import { buildRazorpayOptions, isRazorpayConfigured } from '../config/razorpay';

export const CartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    cart,
    cartSubtotal,
    deliveryFee,
    discountAmount,
    appliedCoupon,
    cartTotal,
    incrementCartItem,
    decrementCartItem,
    removeFromCart,
    clearCart,
    placeOrder,
    applyCoupon,
    removeCoupon,
    products,
    showToast,
    user,
  } = useApp();

  const productName = (productId) => products.find((p) => p.id === productId)?.name || 'a product';
  const describeCoupon = (c) =>
    c.productId ? `${c.percent}% off on ${productName(c.productId)}` : `${c.percent}% off on entire cart`;

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' (Razorpay) | 'cod'
  const [lastPayment, setLastPayment] = useState(null); // { method, paymentId }
  const [razorpayOptions, setRazorpayOptions] = useState(null);

  const handleApplyCoupon = (code = couponInput) => {
    if (!code.trim()) {
      setCouponError('Please enter a voucher code');
      return;
    }
    const result = applyCoupon(code);
    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const showOrderSuccess = (payment) => {
    setLastOrderId(`HV-${Math.floor(100000 + Math.random() * 900000)}`);
    setLastPayment(payment);
    setIsSuccessModalVisible(true);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'cod') {
      showOrderSuccess({ method: 'cod' });
      return;
    }
    if (!isRazorpayConfigured()) {
      showToast('Razorpay key not set - add it in src/config/razorpay.js');
      return;
    }
    setRazorpayOptions(
      buildRazorpayOptions({
        amount: cartTotal,
        user,
        description: `Janify order (${cart.length} items)`,
      })
    );
  };

  const handleRazorpayResult = (result) => {
    setRazorpayOptions(null);
    if (result.status === 'success') {
      showOrderSuccess({ method: 'online', paymentId: result.paymentId });
    } else if (result.status === 'failed') {
      showToast(result.message || 'Payment failed. Please try again.');
    } else {
      showToast('Payment cancelled');
    }
  };

  const handleBrowseGroceries = () => {
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: { screen: 'Home' },
    });
  };

  const handleFinishCheckout = () => {
    setIsSuccessModalVisible(false);
    placeOrder();
    handleBrowseGroceries();
  };

  const renderCartItem = ({ item }) => {
    const itemTotal = item.unitPrice * item.quantity;

    return (
      <View style={styles.cartCard}>
        <Image source={{ uri: item.product.image }} style={styles.itemImage} resizeMode="cover" />

        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.product.name}
            </Text>
            <TouchableOpacity
              onPress={() => removeFromCart(item.id)}
              style={styles.deleteBtn}
              accessibilityLabel="Remove Item"
            >
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>

          <Text style={styles.itemWeight}>Weight: {item.weight}</Text>
          <Text style={styles.itemUnitPrice}>
            {formatPrice(item.unitPrice)} each
          </Text>

          {/* Stepper & Line Total */}
          <View style={styles.itemBottomRow}>
            <Text style={styles.itemTotal}>{formatPrice(itemTotal)}</Text>

            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => decrementCartItem(item.id)}
                accessibilityLabel="Subtract quantity"
              >
                <Ionicons name="remove" size={16} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.stepperQuantity}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => incrementCartItem(item.id)}
                accessibilityLabel="Add quantity"
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="My Shopping Cart"
        subtitle={`${cart.length} distinct items`}
        showCart={false}
        showBack={route.name === 'Cart'}
      />

      {cart.length > 0 ? (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.cartHeaderBar}>
              <Text style={styles.cartHeaderTitle}>Items in Your Basket</Text>
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearCartText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footerSection}>
              {/* Promo Code Input Card */}
              <View style={styles.couponCard}>
                <Text style={styles.couponCardTitle}>Have a Promo Voucher?</Text>
                {appliedCoupon ? (
                  <View style={styles.appliedRow}>
                    <View style={styles.appliedBadge}>
                      <Ionicons name="pricetag" size={14} color={Colors.primary} />
                      <View style={styles.appliedInfo}>
                        <Text style={styles.appliedText}>{appliedCoupon.code} applied</Text>
                        <Text style={styles.appliedSub}>
                          {discountAmount > 0
                            ? describeCoupon(appliedCoupon)
                            : `Add ${productName(appliedCoupon.productId)} to use this coupon`}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={removeCoupon}>
                      <Text style={styles.removeCouponText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.couponInputRow}>
                      <TextInput
                        style={[styles.couponInput, couponError ? styles.couponInputError : null]}
                        placeholder="Enter promo code"
                        placeholderTextColor={Colors.textMuted}
                        value={couponInput}
                        onChangeText={(t) => {
                          setCouponInput(t);
                          if (couponError) setCouponError('');
                        }}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity style={styles.applyBtn} onPress={() => handleApplyCoupon()}>
                        <Text style={styles.applyBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                    {couponError ? <Text style={styles.errorText}>{couponError}</Text> : null}
                  </>
                )}
              </View>

              {/* Order Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatPrice(cartSubtotal)}</Text>
                </View>

                {discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: Colors.primary }]}>Discount</Text>
                    <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                      -{formatPrice(discountAmount)}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    {deliveryFee === 0 && (
                      <View style={styles.freeBadge}>
                        <Text style={styles.freeBadgeText}>FREE OVER {formatPrice(FREE_DELIVERY_MIN)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.summaryValue}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Estimated Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(cartTotal)}</Text>
                </View>

                {/* Payment Method */}
                <Text style={styles.paymentTitle}>Payment Method</Text>
                {[
                  { id: 'online', icon: 'card-outline', label: 'Pay Online', sub: 'UPI, Cards, Netbanking via Razorpay' },
                  { id: 'cod', icon: 'cash-outline', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
                ].map((m) => {
                  const selected = paymentMethod === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.paymentOption, selected && styles.paymentOptionActive]}
                      onPress={() => setPaymentMethod(m.id)}
                    >
                      <Ionicons name={m.icon} size={20} color={Colors.text} />
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentLabel}>{m.label}</Text>
                        <Text style={styles.paymentSub}>{m.sub}</Text>
                      </View>
                      <Ionicons
                        name={selected ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={selected ? Colors.primary : Colors.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}

                {/* Checkout Button */}
                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={handleCheckout}
                  activeOpacity={0.85}
                >
                  <Text style={styles.checkoutBtnText}>
                    {paymentMethod === 'cod' ? 'Place Order' : 'Pay'} ({formatPrice(cartTotal)})
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bag-handle-outline" size={54} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added any fresh groceries to your cart yet.
          </Text>
          <TouchableOpacity
            style={styles.startShoppingBtn}
            onPress={handleBrowseGroceries}
          >
            <Ionicons name="cart" size={18} color={Colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.startShoppingBtnText}>Browse Fresh Groceries</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Razorpay payment sheet */}
      <RazorpayCheckout
        visible={!!razorpayOptions}
        options={razorpayOptions}
        onResult={handleRazorpayResult}
      />

      {/* Checkout Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleFinishCheckout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-sharp" size={40} color={Colors.white} />
            </View>

            <Text style={styles.modalTitle}>Order Placed Successfully!</Text>
            <Text style={styles.modalSub}>Order #{lastOrderId}</Text>

            <View style={styles.modalInfoBox}>
              <View style={styles.modalInfoRow}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={styles.modalInfoText}>Estimated Delivery: 25 - 35 mins</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
                <Text style={styles.modalInfoText} numberOfLines={2}>
                  {user.address}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
                <Text style={styles.modalInfoText}>
                  {lastPayment?.method === 'cod'
                    ? `Pay on Delivery: ${formatPrice(cartTotal)}`
                    : `Total Paid: ${formatPrice(cartTotal)}`}
                </Text>
              </View>
              {lastPayment?.paymentId ? (
                <View style={styles.modalInfoRow}>
                  <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                  <Text style={styles.modalInfoText} numberOfLines={1}>
                    Payment ID: {lastPayment.paymentId}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={handleFinishCheckout}>
              <Text style={styles.doneBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    ...readableWidth,
    padding: 16,
    paddingBottom: 40,
  },
  cartHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  clearCartText: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '600',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  itemWeight: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  itemUnitPrice: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperQuantity: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
    paddingHorizontal: 8,
  },
  footerSection: {
    marginTop: 10,
  },
  couponCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  couponCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    outlineStyle: 'none', // hide browser focus box on web
    flex: 1,
    height: 42,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.text,
  },
  couponInputError: {
    borderColor: Colors.danger,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  applyBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  appliedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 10,
    borderRadius: 10,
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedText: {
    color: Colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  appliedInfo: {
    flexShrink: 1,
  },
  appliedSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  removeCouponText: {
    color: Colors.danger,
    fontWeight: '600',
    fontSize: 12,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  freeBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  freeBadgeText: {
    color: Colors.primaryDark,
    fontSize: 9,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  paymentInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  paymentSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  startShoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  startShoppingBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    maxWidth: 440,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInfoBox: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  modalInfoText: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
