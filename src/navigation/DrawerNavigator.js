import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { BottomTabNavigator } from './BottomTabNavigator';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomDrawerContent } from './CustomDrawerContent';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => {
  const { isAdmin } = useApp();

  return (
    <Drawer.Navigator
      id="Drawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: Colors.primary,
        drawerInactiveTintColor: Colors.textMuted,
        drawerStyle: {
          width: 290,
          backgroundColor: Colors.white,
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
