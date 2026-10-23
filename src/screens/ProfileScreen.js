import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { Colors } from '../theme/colors';
import { readableWidth } from '../utils/layout';

const StatCard = ({ icon, value, label }) => (
  <View style={styles.statCard}>
    <View style={styles.statIconBox}>
      <Ionicons name={icon} size={20} color={Colors.text} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const OptionItem = ({ icon, label, onPress, isLast }) => (
  <TouchableOpacity style={[styles.optionItem, isLast && styles.lastItem]} onPress={onPress}>
    <View style={styles.optionLeft}>
      <Ionicons name={icon} size={20} color={Colors.text} />
      <Text style={styles.optionLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
  </TouchableOpacity>
);

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, isAdmin, products, logout } = useApp();

  const lowStockCount = products.filter((p) => (p.stock ?? 0) < 25).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);

  return (
    <View style={styles.container}>
      <AppHeader title="My Profile" subtitle={isAdmin ? 'Admin' : 'Customer Account'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <ProfileAvatar size={84} editable />
            <Text style={styles.avatarHint}>Tap photo to change</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
            <View style={[styles.rolePill, isAdmin && styles.rolePillAdmin]}>
              <Text style={[styles.rolePillText, isAdmin && styles.rolePillTextAdmin]}>
                {isAdmin ? 'Admin' : 'Customer'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={15} color={Colors.textMuted} />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          {user.phone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats Row */}
        {isAdmin ? (
          <View style={styles.statsRow}>
            <StatCard icon="cube-outline" value={products.length} label="Products" />
            <StatCard icon="alert-circle-outline" value={lowStockCount} label="Low Stock" />
            <StatCard icon="layers-outline" value={totalUnits} label="Units in Stock" />
          </View>
        ) : (
          <View style={styles.statsRow}>
            <StatCard icon="gift-outline" value={user.loyaltyPoints ?? 0} label="Fresh Points" />
            <StatCard icon="basket-outline" value={user.ordersCount ?? 0} label="Total Orders" />
            <StatCard
              icon="ribbon-outline"
              value={(user.ordersCount ?? 0) >= 10 ? 'Gold' : 'Silver'}
              label="Member Tier"
            />
          </View>
        )}

        {/* Action: Edit Profile Button */}
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color={Colors.white} />
          <Text style={styles.editProfileBtnText}>Edit Profile Information</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.white} />
        </TouchableOpacity>

        {/* Address Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={Colors.text} />
            <Text style={styles.sectionTitle}>
              {isAdmin ? 'Store Address' : 'Default Delivery Address'}
            </Text>
          </View>
          <Text style={styles.addressText}>{user.address || 'No address added yet'}</Text>
          {!isAdmin && <Text style={styles.deliveryNote}>Standard Delivery: 25 - 35 mins</Text>}
        </View>

        {/* Role-based Options */}
        <View style={styles.optionsList}>
          {isAdmin ? (
            <>
              <OptionItem
                icon="storefront-outline"
                label="Manage Store Inventory"
                onPress={() => navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'Home' } })}
              />
              <OptionItem
                icon="people-outline"
                label="View Customers"
                onPress={() => navigation.navigate('Customers')}
              />
            </>
          ) : (
            <>
              <OptionItem
                icon="heart-outline"
                label="My Favorite Groceries"
                onPress={() => navigation.navigate('Favorites')}
              />
              <OptionItem
                icon="cart-outline"
                label="Active Cart & Orders"
                onPress={() => navigation.navigate('Cart')}
              />
            </>
          )}

          <TouchableOpacity style={[styles.optionItem, styles.lastItem]} onPress={logout}>
            <View style={styles.optionLeft}>
              <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
              <Text style={[styles.optionLabel, styles.logoutLabel]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
          </TouchableOpacity>
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
  profileCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  rolePill: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rolePillAdmin: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  rolePillTextAdmin: {
    color: Colors.white,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  editProfileBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginLeft: 10,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  deliveryNote: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 6,
  },
  optionsList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  logoutLabel: {
    color: Colors.danger,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
});
