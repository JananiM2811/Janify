import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { Colors } from '../theme/colors';
import { readableWidth } from '../utils/layout';

// Store Owner only: create & delete discount coupons for the whole cart or one product
export const CouponsScreen = () => {
  const { coupons, products, addCoupon, deleteCoupon } = useApp();

  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('');
  const [productId, setProductId] = useState(null); // null = all products
  const [error, setError] = useState('');

  const productName = (id) => products.find((p) => p.id === id)?.name || 'Deleted product';

  const handleCreate = () => {
    const res = addCoupon({ code, percent, productId });
    if (!res.success) {
      setError(res.message);
      return;
    }
    setCode('');
    setPercent('');
    setProductId(null);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AppHeader title="Coupons" subtitle="Admin • Create offers for customers" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Create Coupon */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Coupon</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1.4, marginRight: 8 }]}>
              <Text style={styles.label}>Coupon Code *</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="e.g. MANGO15"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                maxLength={15}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Discount % *</Text>
              <TextInput
                style={styles.input}
                value={percent}
                onChangeText={(t) => {
                  setPercent(t.replace(/[^0-9]/g, ''));
                  if (error) setError('');
                }}
                placeholder="15"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          <Text style={styles.label}>Applies to</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scopeScroll}>
            <TouchableOpacity
              style={[styles.scopeChip, productId === null && styles.scopeChipActive]}
              onPress={() => setProductId(null)}
            >
              <Text style={[styles.scopeText, productId === null && styles.scopeTextActive]}>
                All Products
              </Text>
            </TouchableOpacity>
            {products.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.scopeChip, productId === p.id && styles.scopeChipActive]}
                onPress={() => setProductId(p.id)}
              >
                <Text style={[styles.scopeText, productId === p.id && styles.scopeTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.createBtnText}>Create Coupon</Text>
          </TouchableOpacity>
        </View>

        {/* Existing Coupons */}
        <Text style={styles.sectionTitle}>Active Coupons ({coupons.length})</Text>
        {coupons.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="pricetags-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No coupons yet. Create one above.</Text>
          </View>
        ) : (
          coupons.map((c) => (
            <View key={c.code} style={styles.couponRow}>
              <View style={styles.couponCode}>
                <Text style={styles.couponCodeText}>{c.code}</Text>
              </View>
              <View style={styles.couponInfo}>
                <Text style={styles.couponPercent}>{c.percent}% OFF</Text>
                <Text style={styles.couponScope} numberOfLines={1}>
                  {c.productId ? `Only on ${productName(c.productId)}` : 'On entire cart'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteCoupon(c.code)}
                accessibilityLabel={`Delete coupon ${c.code}`}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    outlineStyle: 'none', // hide browser focus box on web
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  scopeScroll: {
    flexGrow: 0,
    marginBottom: 6,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 6,
  },
  scopeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  scopeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  scopeTextActive: {
    color: Colors.white,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 6,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  createBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
  },
  couponCode: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  couponCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  couponInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  couponPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  couponScope: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
});
