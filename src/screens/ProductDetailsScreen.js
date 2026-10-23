import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { formatPrice } from '../utils/currency';

export const ProductDetailsScreen = ({ route, navigation }) => {
  const { productId } = route.params || {};
  const { products, isAdmin, isFavorite, toggleFavorite, addToCart } = useApp();
  const insets = useSafeAreaInsets();
  // Read the live catalog entry so Owner edits / deletes are reflected here
  const product = products.find((p) => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const weights = product?.weights || ['500g', '1 kg', '2 kg'];
  const [selectedWeight, setSelectedWeight] = useState(weights[0]);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const favorite = isFavorite(product.id);
  const unitPrice = parseFloat(product.price);
  const totalPrice = unitPrice * quantity;

  const handleIncrement = () => {
    setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedWeight);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isAdmin ? styles.scrollContentAdmin : styles.scrollContent}
      >
        {/* Top Image Hero with Floating Actions */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

          {/* Top Navigation Bar */}
          <View style={[styles.navBar, { top: insets.top + 12 }]}>
            <TouchableOpacity
              style={styles.circleBtn}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go Back"
            >
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>

            {!isAdmin && (
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => toggleFavorite(product.id)}
                accessibilityLabel="Toggle Favorite"
              >
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={Colors.text}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Organic Floating Badge */}
          {product.isOrganic && (
            <View style={styles.organicFloatingBadge}>
              <Ionicons name="leaf" size={14} color={Colors.white} />
              <Text style={styles.organicBadgeText}>100% Certified Organic</Text>
            </View>
          )}
        </View>

        {/* Content Card */}
        <View style={styles.detailsCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryBadge}>{product.category?.toUpperCase()}</Text>
            <View style={styles.stockPill}>
              <View style={styles.stockDot} />
              <Text style={styles.stockText}>
                {(product.stock ?? 0) > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.originText}>Origin: {product.origin || 'Certified Organic Farms'}</Text>

          {/* Ratings & Reviews */}
          <View style={styles.ratingBar}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.floor(product.rating) ? Colors.rating : Colors.border}
                />
              ))}
              <Text style={styles.ratingNumber}>{product.rating}</Text>
            </View>
            <Text style={styles.reviewsCount}>({product.reviewsCount} customer reviews)</Text>
          </View>

          {/* Price & Quantity Stepper */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Unit Price</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                <Text style={styles.unitText}>/ {product.unit}</Text>
              </View>
            </View>

            {/* Stepper (Customer only) */}
            {!isAdmin && (
              <View style={styles.quantityPicker}>
                <TouchableOpacity
                  style={[styles.stepperBtn, quantity <= 1 && styles.stepperBtnDisabled]}
                  onPress={handleDecrement}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={quantity <= 1 ? Colors.textMuted : Colors.text}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityNumber}>{quantity}</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrement}>
                  <Ionicons name="add" size={18} color={Colors.text} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Pack / Weight Options (Customer only) */}
          {!isAdmin && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Select Weight / Pack Size</Text>
            <View style={styles.weightOptions}>
              {weights.map((w) => {
                const isSelected = selectedWeight === w;
                return (
                  <TouchableOpacity
                    key={w}
                    style={[styles.weightPill, isSelected && styles.weightPillActive]}
                    onPress={() => setSelectedWeight(w)}
                  >
                    <Text
                      style={[styles.weightPillText, isSelected && styles.weightPillTextActive]}
                    >
                      {w}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          )}

          {/* Product Description */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeaderTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Nutritional Facts */}
          {product.nutrition && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeaderTitle}>Nutritional Facts</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutrition.calories}</Text>
                  <Text style={styles.nutritionLabel}>Energy</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutrition.protein}</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutrition.carbs}</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{product.nutrition.fat}</Text>
                  <Text style={styles.nutritionLabel}>Healthy Fats</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quality Guarantee Banner */}
          <View style={styles.guaranteeBanner}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.guaranteeTitle}>Freshness Guaranteed</Text>
              <Text style={styles.guaranteeText}>
                100% replacement or refund if you are not fully satisfied with this item.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar (Customer only - the Owner does not shop) */}
      {!isAdmin && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
          <View style={styles.totalBlock}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalAmount}>{formatPrice(totalPrice)}</Text>
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Ionicons name="bag-handle" size={20} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  scrollContentAdmin: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 320,
    backgroundColor: Colors.surfaceMuted,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navBar: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  organicFloatingBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  organicBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  detailsCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  stockText: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  originText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 6,
  },
  reviewsCount: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  unitText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperBtnDisabled: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  quantityNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 14,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  weightOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  weightPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  weightPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  weightPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  weightPillTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  nutritionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  guaranteeText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  totalBlock: {
    marginRight: 16,
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addToCartButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backBtnText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
