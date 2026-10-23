import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { Colors } from '../theme/colors';
import { readableWidth } from '../utils/layout';
import { formatPrice } from '../utils/currency';

const LOW_STOCK_LIMIT = 25;

const MetricCard = ({ icon, value, label }) => (
  <View style={styles.metricCard}>
    <View style={styles.metricIcon}>
      <Ionicons name={icon} size={18} color={Colors.text} />
    </View>
    <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
      {value}
    </Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

// Store Owner only: inventory overview that used to sit on top of the product list
export const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { products, categories, coupons } = useApp();

  const stats = useMemo(() => {
    const totalUnits = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const inventoryValue = products.reduce((sum, p) => sum + p.price * (p.stock ?? 0), 0);
    const lowStock = products
      .filter((p) => (p.stock ?? 0) < LOW_STOCK_LIMIT)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
    const outOfStock = products.filter((p) => (p.stock ?? 0) <= 0).length;

    const byCategory = categories
      .filter((c) => c.id !== 'all')
      .map((c) => {
        const items = products.filter((p) => p.category === c.id);
        return {
          id: c.id,
          name: c.name,
          count: items.length,
          units: items.reduce((sum, p) => sum + (p.stock ?? 0), 0),
        };
      });
    const maxUnits = Math.max(1, ...byCategory.map((c) => c.units));

    return { totalUnits, inventoryValue, lowStock, outOfStock, byCategory, maxUnits };
  }, [products, categories]);

  return (
    <View style={styles.container}>
      <AppHeader title="Store Analytics" subtitle="Admin • Inventory overview" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Key numbers */}
        <View style={styles.metricsGrid}>
          <MetricCard icon="cube-outline" value={products.length} label="Products" />
          <MetricCard icon="layers-outline" value={stats.totalUnits} label="Units in Stock" />
          <MetricCard icon="wallet-outline" value={formatPrice(stats.inventoryValue)} label="Inventory Value" />
          <MetricCard icon="alert-circle-outline" value={stats.lowStock.length} label="Low Stock" />
          <MetricCard icon="close-circle-outline" value={stats.outOfStock} label="Out of Stock" />
          <MetricCard icon="pricetags-outline" value={coupons.length} label="Active Coupons" />
        </View>

        {/* Stock by category */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stock by Category</Text>
          {stats.byCategory.map((c) => (
            <View key={c.id} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={styles.barLabel}>{c.name}</Text>
                <Text style={styles.barValue}>
                  {c.units} units • {c.count} {c.count === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[styles.barFill, { width: `${(c.units / stats.maxUnits) * 100}%` }]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Low stock list */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Low Stock (below {LOW_STOCK_LIMIT})</Text>
          {stats.lowStock.length === 0 ? (
            <Text style={styles.emptyText}>All products are well stocked.</Text>
          ) : (
            stats.lowStock.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.lowRow}
                onPress={() => navigation.navigate('ProductDetails', { productId: p.id })}
              >
                <Image source={{ uri: p.image }} style={styles.lowImage} />
                <View style={styles.lowInfo}>
                  <Text style={styles.lowName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.lowPrice}>{formatPrice(p.price)}</Text>
                </View>
                <View style={[styles.stockPill, (p.stock ?? 0) <= 0 && styles.stockPillOut]}>
                  <Text style={[styles.stockPillText, (p.stock ?? 0) <= 0 && styles.stockPillTextOut]}>
                    {(p.stock ?? 0) <= 0 ? 'Out' : `${p.stock} left`}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    ...readableWidth,
    padding: 16,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricCard: {
    width: '31.5%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  barRow: {
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  barValue: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  lowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lowImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
  },
  lowInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  lowName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  lowPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  stockPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stockPillOut: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stockPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  stockPillTextOut: {
    color: Colors.white,
  },
});
