import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthScreen } from '../screens/AuthScreen';
import { DrawerNavigator } from './DrawerNavigator';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { CartScreen } from '../screens/CartScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isReady, isAuthenticated, isAdmin } = useApp();

  // Wait until saved accounts / products are loaded from the device
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen
            name="ProductDetails"
            component={ProductDetailsScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          {/* Shopping screens exist only for Customers */}
          {!isAdmin && (
            <>
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};
