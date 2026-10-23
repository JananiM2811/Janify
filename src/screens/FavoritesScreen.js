import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { Colors } from '../theme/colors';
import { readableWidth } from '../utils/layout';
import { formatPrice } from '../utils/currency';

export const FavoritesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { favoriteProducts, toggleFavorite, addToCart, cart, incrementCartItem, decrementCartItem } = useApp();

  const renderItem = ({ item }) => {
    const cartItem = cart.find((c) => c.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          <View style={styles.info}>
            <View style={styles.topInfo}>
              <Text style={styles.category}>{item.category?.toUpperCase()}</Text>
              <TouchableOpacity
                style={styles.removeFavBtn}
                onPress={() => toggleFavorite(item.id)}
                accessibilityLabel="Remove from favorites"
              >
                <Ionicons name="heart" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.unit}>{item.unit}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={Colors.rating} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewsText}>({item.reviewsCount})</Text>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.price}>{formatPrice(item.price)}</Text>

              {/* Add to Cart directly from Favorite Screen */}
              {quantity > 0 ? (
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => decrementCartItem(item.id)}
                  >
                    <Ionicons name="remove" size={14} color={Colors.white} />
                  </TouchableOpacity>
                  <Text style={styles.stepperQuantity}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => incrementCartItem(item.id)}
                  >
                    <Ionicons name="add" size={14} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addToCartBtn}
                  onPress={() => addToCart(item, 1)}
                  accessibilityLabel="Add to Cart from Favorites"
                >
                  <Ionicons name="cart-outline" size={16} color={Colors.white} style={{ marginRight: 4 }} />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Favorite Groceries"
        subtitle={`${favoriteProducts.length} items saved`}
        showBack={route.name === 'Favorites'}
      />

      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Favorites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Browse through daily groceries and tap the heart icon on any product to save it here.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() =>
                navigation.navigate('Main', {
                  screen: 'MainTabs',
                  params: { screen: 'Home' },
                })
              }
            >
              <Text style={styles.exploreBtnText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTouchable: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: Colors.surfaceMuted,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  removeFavBtn: {
    padding: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  unit: {
    fontSize: 12,
    color: Colors.textMuted,
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 12,
    paddingHorizontal: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
