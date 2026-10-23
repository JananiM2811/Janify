import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProductsScreen } from '../screens/ProductsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { CouponsScreen } from '../screens/CouponsScreen';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { cartCount, favorites, isAdmin } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        // Tall enough for icon + label, plus the phone's gesture bar / home indicator
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 4,
          paddingBottom: 4 + insets.bottom,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
        tabBarItemStyle: {
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          lineHeight: 14,
          fontWeight: '600',
        },
        tabBarBadgeStyle: {
          backgroundColor: Colors.primary,
          color: Colors.white,
          fontSize: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ProductsScreen}
        options={{
          tabBarLabel: isAdmin ? 'Inventory' : 'Groceries',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'storefront' : 'storefront-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* Analytics & Coupons are Store Owner-only tabs */}
      {isAdmin && (
        <>
          <Tab.Screen
            name="AnalyticsTab"
            component={AnalyticsScreen}
            options={{
              tabBarLabel: 'Analytics',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'bar-chart' : 'bar-chart-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />

          <Tab.Screen
            name="CouponsTab"
            component={CouponsScreen}
            options={{
              tabBarLabel: 'Coupons',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'pricetags' : 'pricetags-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}

      {/* Favorites & Cart are Customer-only tabs */}
      {!isAdmin && (
        <>
          <Tab.Screen
            name="FavoritesTab"
            component={FavoritesScreen}
            options={{
              tabBarLabel: 'Favorites',
              tabBarBadge: favorites.length > 0 ? favorites.length : undefined,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'heart' : 'heart-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />

          <Tab.Screen
            name="CartTab"
            component={CartScreen}
            options={{
              tabBarLabel: 'My Cart',
              tabBarBadge: cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : undefined,
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'bag-handle' : 'bag-handle-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />
        </>
      )}

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
