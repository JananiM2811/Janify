import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

// Shows the user's own photo (or a plain person icon if none is set).
// When `editable`, tapping it opens the gallery to choose a new photo.
export const ProfileAvatar = ({ size = 72, editable = false, dark = false }) => {
  const { user, updateProfile, showToast } = useApp();

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast('Allow photo access to set a profile picture');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      updateProfile({ photo: result.assets[0].uri });
    }
  };

  const circle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const avatar = user.photo ? (
    <Image source={{ uri: user.photo }} style={[styles.image, circle]} />
  ) : (
    <View style={[styles.placeholder, circle, dark && styles.placeholderDark]}>
      <Ionicons name="person" size={size * 0.5} color={dark ? Colors.white : Colors.textMuted} />
    </View>
  );

  if (!editable) return avatar;

  return (
    <TouchableOpacity
      onPress={handlePickPhoto}
      activeOpacity={0.8}
      accessibilityLabel="Change profile photo"
    >
      {avatar}
      <View style={styles.cameraBadge}>
        <Ionicons name="camera" size={14} color={Colors.white} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.surfaceMuted,
  },
  placeholder: {
    backgroundColor: Colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderDark: {
    backgroundColor: Colors.secondary,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
