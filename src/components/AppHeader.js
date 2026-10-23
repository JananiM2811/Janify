import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { useLayout } from '../utils/layout';

export const AppHeader = ({
  title = 'Janify',
  subtitle,
  showBack = false,
  showCart = true,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isAdmin, cartCount } = useApp();
  const { isWide } = useLayout();

  const handleOpenCart = () => {
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: { screen: 'CartTab' },
    });
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go Back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
        ) : isWide ? null : (
          // Laptop has a permanent side menu, so the menu button is phone-only
          <TouchableOpacity
            style={styles.iconButton}
            // Bubbles up to the Drawer navigator from any tab / drawer screen
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityLabel="Open Menu Drawer"
          >
            <Ionicons name="menu" size={26} color={Colors.text} />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            <View style={styles.roleBadgeContainer}>
              <View style={[styles.roleDot, !isAdmin && styles.roleDotCustomer]} />
              <Text style={styles.roleText}>{isAdmin ? 'Admin' : 'Customer'}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {/* Cart shortcut is only for Customers */}
        {showCart && !isAdmin && (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={handleOpenCart}
            accessibilityLabel="View Cart"
          >
            <Ionicons name="bag-handle-outline" size={24} color={Colors.text} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  roleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
    backgroundColor: Colors.primary,
  },
  roleDotCustomer: {
    backgroundColor: Colors.borderStrong,
  },
  roleText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: Colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
