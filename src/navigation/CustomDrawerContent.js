import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { Colors } from '../theme/colors';

export const CustomDrawerContent = (props) => {
  const { user, isAdmin, logout, cartCount, favorites } = useApp();
  const insets = useSafeAreaInsets();

  const go = (screen, params) => {
    props.navigation.closeDrawer();
    props.navigation.navigate(screen, params);
  };

  return (
    <View style={styles.container}>
      {/* Drawer Header with User Info */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatar}>
          <ProfileAvatar size={60} dark />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.roleRow}>
          <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
            <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
              {isAdmin ? 'Admin' : 'Customer'}
            </Text>
          </View>
        </View>
      </View>

      {/* Nav List */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => go('MainTabs', { screen: 'Home' })}
        >
          <Ionicons name="storefront-outline" size={22} color={Colors.text} />
          <Text style={styles.navLabel}>{isAdmin ? 'Store Inventory' : 'Daily Groceries'}</Text>
        </TouchableOpacity>

        {isAdmin && (
          <>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => go('MainTabs', { screen: 'AnalyticsTab' })}
            >
              <Ionicons name="bar-chart-outline" size={22} color={Colors.text} />
              <Text style={styles.navLabel}>Store Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => go('MainTabs', { screen: 'CouponsTab' })}
            >
              <Ionicons name="pricetags-outline" size={22} color={Colors.text} />
              <Text style={styles.navLabel}>Coupons</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => go('MainTabs', { screen: 'CustomersTab' })}>
              <Ionicons name="people-outline" size={22} color={Colors.text} />
              <Text style={styles.navLabel}>Customers</Text>
            </TouchableOpacity>
          </>
        )}

        {!isAdmin && (
          <>
            <TouchableOpacity style={styles.navItem} onPress={() => go('FavoritesDrawer')}>
              <Ionicons name="heart-outline" size={22} color={Colors.text} />
              <Text style={styles.navLabel}>My Favorites</Text>
              {favorites.length > 0 && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterText}>{favorites.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => go('CartDrawer')}>
              <Ionicons name="cart-outline" size={22} color={Colors.text} />
              <Text style={styles.navLabel}>My Shopping Cart</Text>
              {cartCount > 0 && (
                <View style={styles.counterBadge}>
                  <Text style={styles.counterText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.navItem} onPress={() => go('ProfileDrawer')}>
          <Ionicons name="person-circle-outline" size={22} color={Colors.text} />
          <Text style={styles.navLabel}>{isAdmin ? 'Admin Profile' : 'My Profile'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            props.navigation.closeDrawer();
            logout();
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.borderStrong,
    marginTop: 2,
  },
  roleRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  roleBadgeAdmin: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  roleTextAdmin: {
    color: Colors.primary,
  },
  navList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 14,
    flex: 1,
  },
  counterBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  counterText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    backgroundColor: Colors.background,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});
