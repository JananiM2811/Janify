import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

export const ToastBanner = () => {
  const { toastMessage } = useApp();
  const insets = useSafeAreaInsets();

  if (!toastMessage) return null;

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      <View style={styles.toast}>
        <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
        <Text style={styles.text}>{toastMessage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    elevation: 20,
    pointerEvents: 'none',
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: '90%',
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
