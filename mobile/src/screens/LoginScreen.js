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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const { theme, isDark } = useTheme();
  const [error, setError] = useState('');
  const [loadingProvider, setLoadingProvider] = useState(null);

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
      setError(`${provider} login failed. Please try again.`);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="shield-checkmark" size={56} color={theme.primary} />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>TASKMANAGER</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enterprise productivity platform</Text>
        </View>

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={[styles.errorText, { color: '#B91C1C' }]}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }, loadingProvider === 'google' && styles.loginButtonDisabled]}
            onPress={() => onSelectAuth('google')}
            disabled={!!loadingProvider}
            activeOpacity={0.8}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
                styles.loginButton, 
                { backgroundColor: isDark ? '#FFFFFF' : '#000000' }, 
                loadingProvider === 'apple' && styles.loginButtonDisabled
            ]}
            onPress={() => onSelectAuth('apple')}
            disabled={!!loadingProvider}
            activeOpacity={0.8}
          >
            {loadingProvider === 'apple' ? (
              <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="logo-apple" size={20} color={isDark ? '#000000' : '#FFFFFF'} style={styles.buttonIcon} />
                <Text style={[styles.loginButtonText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Continue with Apple</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Authenticated by Clerk Identity Systems.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>© 2026 Enterprise Task Management Inc.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  form: {
    marginBottom: 32,
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 12,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoText: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default LoginScreen;
