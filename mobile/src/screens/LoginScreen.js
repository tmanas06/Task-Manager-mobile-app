import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const { theme, isDark } = useTheme();
  const [error, setError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState(null);

  // Manual Auth State
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' });

  const onSelectAuth = async (provider) => {
    setError('');
    setLoadingProvider(provider);

    try {
      const flow = provider === 'google' ? startGoogleFlow : startAppleFlow;
      const { createdSessionId, setActive } = await flow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'taskmanager' }),
      });

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error(`${provider} Login Error:`, err);
      setError(`${provider} login failed.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleManualSignIn = async () => {
    if (!signInLoaded) return;
    setLoadingProvider('manual');
    setError('');

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setSignInActive({ session: completeSignIn.createdSessionId });
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleManualSignUp = async () => {
    if (!signUpLoaded) return;
    setLoadingProvider('manual');
    setError('');

    try {
      await signUp.create({
        firstName,
        emailAddress,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleVerify = async () => {
    if (!signUpLoaded) return;
    setLoadingProvider('verify');
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setSignUpActive({ session: completeSignUp.createdSessionId });
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoadingProvider(null);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior="padding">
        <View style={styles.scrollContent}>
          <Text style={[styles.appName, { color: theme.text, textAlign: 'center' }]}>VERIFY EMAIL</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'center', marginBottom: 40 }]}>
            Enter the code sent to your email
          </Text>

          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Verification Code"
            placeholderTextColor={theme.textSecondary}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleVerify}
            disabled={loadingProvider === 'verify'}
          >
            {loadingProvider === 'verify' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>VERIFY</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: theme.text }]}>TASKMANAGER</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isSignUp ? 'Create your professional account' : 'Enterprise productivity platform'}
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={[styles.errorText, { color: '#B91C1C' }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {isSignUp && (
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="First Name"
              placeholderTextColor={theme.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          )}
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Email Address"
            placeholderTextColor={theme.textSecondary}
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }, loadingProvider === 'manual' && styles.loginButtonDisabled]}
            onPress={isSignUp ? handleManualSignUp : handleManualSignIn}
            disabled={!!loadingProvider}
          >
            {loadingProvider === 'manual' ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>{isSignUp ? 'REGISTER' : 'LOGIN'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={() => { setIsSignUp(!isSignUp); setError(''); }}>
            <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR CONTINUE WITH</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onSelectAuth('google')}
              disabled={!!loadingProvider}
            >
              <Ionicons name="logo-google" size={20} color={theme.text} />
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onSelectAuth('apple')}
              disabled={!!loadingProvider}
            >
              <Ionicons name="logo-apple" size={20} color={theme.text} />
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}> </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 32 },
  header: { alignItems: 'center', marginBottom: 50, marginTop: 20 },
  appName: { fontSize: 28, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  subtitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1 },
  errorText: { fontSize: 13, fontWeight: '600', marginLeft: 10, flex: 1 },
  form: { width: '100%' },
  input: { borderRadius: 12, padding: 18, fontSize: 16, borderWidth: 1, marginBottom: 16, fontWeight: '500' },
  loginButton: { borderRadius: 12, height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
  loginButtonDisabled: { opacity: 0.6 },
  toggleButton: { marginTop: 24, alignItems: 'center', padding: 10 },
  toggleText: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 40 },
  dividerLine: { flex: 1, height: 1, opacity: 0.3 },
  dividerText: { fontSize: 10, fontWeight: '800', marginHorizontal: 16, letterSpacing: 1.5, opacity: 0.6 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  socialButton: { flex: 1, height: 56, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  socialButtonText: { marginLeft: 10, fontSize: 14, fontWeight: '700' },
  footer: { marginTop: 50, alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.4 },
});

export default LoginScreen;
