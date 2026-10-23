import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BottomTabNavigator } from './BottomTabNavigator';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomDrawerContent } from './CustomDrawerContent';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';
import { useLayout } from '../utils/layout';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  const { isAdmin } = useApp();
  const { isWide } = useLayout();

  return (
    <Drawer.Navigator
      id="Drawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // Laptop: menu always visible on the left like a website. Phone: slide-out menu.
        drawerType: isWide ? 'permanent' : 'front',
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textMuted,
        drawerStyle: {
          width: isWide ? 260 : 290,
          backgroundColor: Colors.white,
          borderRightWidth: isWide ? 1 : 0,
          borderRightColor: Colors.border,
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ drawerLabel: isAdmin ? 'Store Inventory' : 'Groceries Store' }}
      />
      {!isAdmin && (
        <>
          <Drawer.Screen
            name="FavoritesDrawer"
            component={FavoritesScreen}
            options={{ drawerLabel: 'Favorites' }}
          />
          <Drawer.Screen
            name="CartDrawer"
            component={CartScreen}
            options={{ drawerLabel: 'Shopping Cart' }}
          />
        </>
      )}
      <Drawer.Screen
        name="ProfileDrawer"
        component={ProfileScreen}
        options={{ drawerLabel: 'Profile' }}
      />
    </Drawer.Navigator>
  );
};
