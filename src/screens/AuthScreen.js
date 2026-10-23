import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Colors } from '../theme/colors';

export const AuthScreen = () => {
  const { login, signup } = useApp();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Errors & Status
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (activeTab === 'signup' && (!name || name.trim().length < 2)) {
      errs.name = 'Full name is required (min 2 characters)';
    }

    if (!email || !emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = () => {
    setAuthError('');
    if (!validate()) return;

    const res = login(email, password);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  const handleSignUp = () => {
    setAuthError('');
    if (!validate()) return;

    const res = signup(name, email, password, phone, address);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.brandTitle}>Janify</Text>
          <Text style={styles.brandSubtitle}>Groceries, simplified.</Text>
        </View>

        {/* Top Tabs: Sign In vs Customer Registration */}
        <View style={styles.authModeToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'signin' && styles.toggleBtnActive]}
            onPress={() => {
              setActiveTab('signin');
              setErrors({});
              setAuthError('');
            }}
          >
            <Ionicons
              name="log-in-outline"
              size={18}
              color={activeTab === 'signin' ? Colors.primary : Colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'signin' && styles.toggleBtnTextActive,
              ]}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'signup' && styles.toggleBtnActive]}
            onPress={() => {
              setActiveTab('signup');
              setErrors({});
              setAuthError('');
            }}
          >
            <Ionicons
              name="person-add-outline"
              size={18}
              color={activeTab === 'signup' ? Colors.primary : Colors.textMuted}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'signup' && styles.toggleBtnTextActive,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Global Auth Alert Error */}
          {authError ? (
            <View style={styles.authAlert}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.authAlertText}>{authError}</Text>
            </View>
          ) : null}

          {/* Role Policy Banner */}
          {activeTab === 'signup' ? (
            <View style={styles.policyBanner}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.policyText}>
                Create your account and start shopping fresh groceries in minutes.
              </Text>
            </View>
          ) : (
            <View style={[styles.policyBanner, { backgroundColor: Colors.background, borderColor: Colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} />
              <Text style={[styles.policyText, { color: Colors.textMuted }]}>
                Welcome back! Sign in to continue.
              </Text>
            </View>
          )}

          {/* Full Name Field (Sign Up Only) */}
          {activeTab === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={[styles.inputBox, errors.name && styles.inputBoxError]}>
                <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={(val) => {
                    setName(val);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  style={styles.textInput}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          )}

          {/* Email Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={[styles.inputBox, errors.email && styles.inputBoxError]}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.textInput}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={[styles.inputBox, errors.password && styles.inputBoxError]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Minimum 6 characters"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Field (Sign Up Only) */}
          {activeTab === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password *</Text>
              <View style={[styles.inputBox, errors.confirmPassword && styles.inputBoxError]}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="Re-type your password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={(val) => {
                    setConfirmPassword(val);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          )}

          {/* Phone Number (Sign Up Only) */}
          {activeTab === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="+91 98765 43210"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.textInput}
                />
              </View>
            </View>
          )}

          {/* Delivery Address (Sign Up Only) */}
          {activeTab === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Address (Optional)</Text>
              <View style={[styles.inputBox, { height: 60, alignItems: 'flex-start', paddingTop: 8 }]}>
                <Ionicons name="location-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g. 123 Main St, Apartment 4B"
                  placeholderTextColor={Colors.textMuted}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                />
              </View>
            </View>
          )}

          {/* Main Action Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={activeTab === 'signin' ? handleSignIn : handleSignUp}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>
              {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} style={{ marginLeft: 8 }} />
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
  // flexGrow + center keeps the form in the middle of tall phone screens,
  // and it still scrolls when the keyboard is open
  scrollContent: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  authModeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  toggleBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  authAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  authAlertText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  policyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  policyText: {
    fontSize: 11,
    color: Colors.primaryDark,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
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
    marginTop: 3,
    marginLeft: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
