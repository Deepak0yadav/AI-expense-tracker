import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { AuthNavbar } from '@/components/auth/AuthNavbar';

export default function RegisterScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  async function onSubmit() {
    if (!emailOrPhone || !password) {
      Alert.alert('Missing fields', 'Please enter email/phone and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      // For now, treat input as email. Phone auth requires additional setup.
      await signUp(emailOrPhone.trim(), password);
      // Navigation will happen automatically via layout
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message || 'Please try again');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      // Navigation will happen automatically
    } catch (e: any) {
      if (e?.message !== 'Redirecting to Google...') {
        Alert.alert('Google Sign-In failed', e?.message || 'Please try again');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <AuthNavbar scrollY={scrollY} />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Join FinGenius</Text>
              <Text style={styles.welcomeSubtitle}>
                Create your account and start managing your finances intelligently
              </Text>
            </View>

            <View style={styles.form}>
              {/* Google Sign-In Button (web only for now) */}
              {Platform.OS === 'web' && (
                <TouchableOpacity 
                  style={[styles.button, styles.googleButton]} 
                  disabled={submitting} 
                  onPress={handleGoogleSignIn}
                >
                  <View style={styles.buttonContent}>
                    <View style={styles.googleIconContainer}>
                      <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email or Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com or +1234567890"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  editable={!submitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!submitting}
                />
                <Text style={styles.hint}>Must be at least 6 characters long</Text>
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.primary, submitting && styles.buttonDisabled]} 
                disabled={submitting} 
                onPress={onSubmit}
              >
                <Text style={styles.buttonText}>
                  {submitting ? 'Creating account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signupPrompt}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <Link href="/(auth)/signin">
                  <Text style={styles.signupLink}>Sign In</Text>
                </Link>
              </View>
            </View>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb' 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  button: { 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primary: { 
    backgroundColor: '#2563eb',
  },
  secondary: { 
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285f4',
  },
  googleButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonText: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#6b7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
