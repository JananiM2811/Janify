import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { Colors } from '../theme/colors';
import { readableWidth } from '../utils/layout';

export const EditProfileScreen = ({ navigation }) => {
  const { user, isAdmin, updateProfile } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!name || name.trim().length < 2) {
      errs.name = 'Full name is required (at least 2 characters)';
    }

    if (!email || !emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!phone || cleanPhone.length < 10) {
      errs.phone = 'Valid 10-digit phone number is required';
    }

    if (!address || address.trim().length < 5) {
      errs.address = 'Please provide a complete delivery address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const res = updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    if (!res.success) {
      setErrors({ email: res.message });
      return;
    }

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <AppHeader
        title="Edit Profile"
        subtitle={isAdmin ? 'Update Admin Details' : 'Update Customer Details'}
        showBack={true}
        showCart={false}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo (tap to pick from gallery) */}
        <View style={styles.avatarSection}>
          <ProfileAvatar size={90} editable />
          <Text style={styles.avatarHint}>Tap to choose a profile photo</Text>
        </View>
        {/* Input Fields Card */}
        <View style={styles.card}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={[styles.inputBox, errors.name && styles.inputBoxError]}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="Sarah Jenkins"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={[styles.inputBox, errors.email && styles.inputBoxError]}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="customer@grocery.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <View style={[styles.inputBox, errors.phone && styles.inputBoxError]}>
              <Ionicons name="call-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                }}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Delivery Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isAdmin ? 'Store Address *' : 'Delivery Address *'}</Text>
            <View
              style={[
                styles.inputBox,
                { height: 80, alignItems: 'flex-start', paddingTop: 8 },
                errors.address && styles.inputBoxError,
              ]}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={Colors.textMuted}
                style={[styles.inputIcon, { marginTop: 2 }]}
              />
              <TextInput
                style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                value={address}
                onChangeText={(val) => {
                  setAddress(val);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: null }));
                }}
                placeholder="12 Gandhi Street, T. Nagar, Chennai"
                multiline
              />
            </View>
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save Profile Changes</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  avatarHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    outlineStyle: 'none', // hide browser focus box on web
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  errorText: {
    fontSize: 11,
    color: Colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
