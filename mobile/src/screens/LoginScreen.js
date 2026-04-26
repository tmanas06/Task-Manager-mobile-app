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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const { theme, themeMode, isDark } = useTheme();
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

  const renderBackground = () => (
    <View style={StyleSheet.absoluteFill}>
       <View style={[styles.glowBlob, { top: -100, right: -100, backgroundColor: theme.primary + '30', width: 400, height: 400 }]} />
       <View style={[styles.glowBlob, { bottom: -50, left: -100, backgroundColor: theme.primary + '20', width: 350, height: 350 }]} />
    </View>
  );

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior="padding">
        {renderBackground()}
        <View style={styles.scrollContent}>
          <View style={[styles.glassCard, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
            <Text style={[styles.appName, { color: theme.text, textAlign: 'center' }]}>VERIFY EMAIL</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, textAlign: 'center', marginBottom: 40 }]}>
              Enter the code sent to your email
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.glassBorder, color: theme.text }]}
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

            <TouchableOpacity 
                style={{ marginTop: 24, alignItems: 'center' }} 
                onPress={async () => {
                try {
                    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                    Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
                } catch (err) {
                    Alert.alert('Error', err.errors?.[0]?.message || 'Failed to resend code');
                }
                }}
            >
                <Text style={{ color: theme.textSecondary, fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>DIN'T RECEIVE CODE? RESEND</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderBackground()}
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
            <View style={[styles.logoWrapper, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                <Image 
                    source={require('../../assets/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>
          <Text style={[styles.appName, { color: theme.text }]}>TaskFlow</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isSignUp ? 'Professional Onboarding' : 'Enterprise productivity platform'}
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.glassCard, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
          {isSignUp && (
            <TextInput
              style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.glassBorder, color: theme.text }]}
              placeholder="First Name"
              placeholderTextColor={theme.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          )}
          <TextInput
            style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.glassBorder, color: theme.text }]}
            placeholder="Email Address"
            placeholderTextColor={theme.textSecondary}
            value={emailAddress}
            onChangeText={setEmailAddress}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.glassBorder, color: theme.text }]}
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
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: theme.primary }}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: theme.textSecondary }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR CONTINUE WITH</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.textSecondary }]} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.glassBorder }]}
              onPress={() => onSelectAuth('google')}
              disabled={!!loadingProvider}
            >
              <Ionicons name="logo-google" size={20} color={theme.text} />
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: theme.glassBorder }]}
              onPress={() => onSelectAuth('apple')}
              disabled={!!loadingProvider}
            >
              <Ionicons name="logo-apple" size={20} color={theme.text} />
              <Text style={[styles.socialButtonText, { color: theme.text }]}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Powering Hybrid Teams Globally</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 60 },
  glowBlob: { position: 'absolute', borderRadius: 200, opacity: 1 },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 40 },
  logoWrapper: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoImage: { width: 80, height: 80 },
  appName: { fontSize: 36, fontWeight: '900', letterSpacing: -1.5, marginBottom: 4 },
  subtitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
  errorText: { fontSize: 13, fontWeight: '700', marginLeft: 10, flex: 1 },
  glassCard: { padding: 24, borderRadius: 32, borderWidth: 1, width: '100%', elevation: 2 },
  input: { borderRadius: 16, padding: 18, fontSize: 16, borderWidth: 1, marginBottom: 16, fontWeight: '600' },
  loginButton: { borderRadius: 16, height: 64, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  loginButtonDisabled: { opacity: 0.6 },
  toggleButton: { marginTop: 24, alignItems: 'center', padding: 8 },
  toggleText: { fontSize: 14, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  dividerLine: { flex: 1, height: 1, opacity: 0.1 },
  dividerText: { fontSize: 10, fontWeight: '900', marginHorizontal: 16, letterSpacing: 1.5, opacity: 0.5 },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  socialButton: { flex: 1, height: 56, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  socialButtonText: { marginLeft: 10, fontSize: 14, fontWeight: '800' },
  footer: { marginTop: 40, alignItems: 'center', paddingBottom: 20 },
  footerText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.3 },
});

export default LoginScreen;
