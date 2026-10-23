import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { formatPrice } from '../utils/currency';

export const ProductCard = ({ product, onEdit }) => {
  const navigation = useNavigation();
  const { isAdmin, isFavorite, toggleFavorite, addToCart, cart, incrementCartItem, decrementCartItem, deleteProduct } = useApp();

  const favorite = isFavorite(product.id);
  const cartItem = cart.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleCardPress = () => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleDelete = () => {
    deleteProduct(product.id);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      {/* Header: Badges & Favorite Heart */}
      <View style={styles.topRow}>
        {product.isOrganic ? (
          <View style={styles.badgeOrganic}>
            <Text style={styles.badgeOrganicText}>ORGANIC</Text>
          </View>
        ) : (
          <View style={styles.badgeSale}>
            <Text style={styles.badgeSaleText}>FRESH</Text>
          </View>
        )}

        {isAdmin ? (
          <Text style={styles.stockText}>Stock: {product.stock ?? 0}</Text>
        ) : (
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(product.id)}
            accessibilityLabel="Toggle Favorite"
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Info Section */}
      <View style={styles.info}>
        <Text style={styles.category}>{product.category?.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.rating} />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewsText}>({product.reviewsCount})</Text>
        </View>

        {/* Price & Add to Cart / Stepper */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Store Owner manages products - no shopping controls */}
          {isAdmin ? null : quantity > 0 ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => decrementCartItem(product.id)}
              >
                <Ionicons name="remove" size={16} color={Colors.white} />
              </TouchableOpacity>
              <Text style={styles.stepperQuantity}>{quantity}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => incrementCartItem(product.id)}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product, 1)}
              accessibilityLabel="Add to Cart"
            >
              <Ionicons name="add" size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Admin Controls */}
        {isAdmin && (
          <View style={styles.adminBar}>
            <TouchableOpacity
              style={styles.adminEditBtn}
              onPress={() => onEdit && onEdit(product)}
            >
              <Ionicons name="pencil" size={14} color={Colors.primary} />
              <Text style={styles.adminEditText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminDelBtn} onPress={handleDelete}>
              <Ionicons name="trash" size={14} color={Colors.danger} />
              <Text style={styles.adminDelText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeOrganic: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeOrganicText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  badgeSale: {
    backgroundColor: Colors.secondaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeSaleText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  favBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  unit: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 18,
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
    paddingHorizontal: 6,
  },
  adminBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  adminEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminEditText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 3,
  },
  adminDelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminDelText: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '600',
    marginLeft: 3,
  },
});
