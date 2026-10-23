import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { ToastBanner } from './src/components/ToastBanner';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/theme/colors';

// Web only: stop Chrome painting its pale-blue autofill highlight behind inputs
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px ${Colors.background} inset !important;
      -webkit-text-fill-color: ${Colors.text} !important;
      caret-color: ${Colors.text};
      transition: background-color 9999s ease-in-out 0s;
    }
  `;
  document.head.appendChild(style);
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <View style={styles.container}>
              <RootNavigator />
              <ToastBanner />
              <StatusBar style="dark" />
            </View>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
  },
  // On wide screens (laptop browser) keep a phone-sized column in the centre
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
});
