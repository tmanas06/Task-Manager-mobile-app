import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrganizationList } from '@clerk/clerk-expo';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { joinByCode } from '../api/orgs';

const OrganizationScreen = () => {
  const { theme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const { createOrganization, setActive, userMemberships, isLoaded: listLoaded } = useOrganizationList({
    userMemberships: true,
  });

  const [mode, setMode] = useState('join'); // 'join' or 'create'
  const [orgName, setOrgName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!orgName.trim()) {
      Alert.alert('Required', 'Please enter a name for your organization.');
      return;
    }
    setIsLoading(true);
    try {
      const org = await createOrganization({ name: orgName.trim() });
      await setActive({ organization: org.id });
    } catch (err) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to create organization.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Required', 'Please enter a join code.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await joinByCode(joinCode.trim());
      if (response.success) {
        await setActive({ organization: response.data.clerkOrgId });
        Alert.alert('Joined', `You have successfully joined ${response.data.name}!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid join code or failed to join.';
      Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExisting = async (orgId) => {
    setIsLoading(true);
    try {
      await setActive({ organization: orgId });
    } catch (err) {
      Alert.alert('Error', 'Failed to switch workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!listLoaded) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.topNav, { borderBottomColor: theme.border }]}>
          <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>{user?.name?.[0].toUpperCase() || 'U'}</Text>
              </View>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: '#FEE2E2' }]} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="business" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Choose a Workspace</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Join your team to start managing tasks together
          </Text>
        </View>

        {userMemberships.data?.length > 0 && (
          <View style={styles.existingOrgs}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>YOUR WORKSPACES</Text>
            {userMemberships.data.map((membership) => (
              <TouchableOpacity
                key={membership.id}
                style={[styles.orgItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleSelectExisting(membership.organization.id)}
              >
                <View style={[styles.orgIcon, { backgroundColor: theme.primary }]}>
                   <Text style={styles.orgIconText}>{membership.organization.name[0].toUpperCase()}</Text>
                </View>
                <View style={styles.orgInfo}>
                  <Text style={[styles.orgName, { color: theme.text }]}>{membership.organization.name}</Text>
                  <Text style={[styles.orgRole, { color: theme.textSecondary }]}>{membership.role === 'org:admin' ? 'Administrator' : 'Member'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, mode === 'join' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]} 
            onPress={() => setMode('join')}
          >
            <Text style={[styles.tabText, { color: mode === 'join' ? theme.primary : theme.textSecondary }]}>JOIN TEAM</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, mode === 'create' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]} 
            onPress={() => setMode('create')}
          >
            <Text style={[styles.tabText, { color: mode === 'create' ? theme.primary : theme.textSecondary }]}>CREATE NEW</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {mode === 'join' ? (
            <>
              <Text style={[styles.label, { color: theme.textSecondary }]}>INVITE CODE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                placeholder="Enter 8-digit code"
                placeholderTextColor={theme.textSecondary}
                value={joinCode}
                onChangeText={setJoinCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.primary }]} 
                onPress={handleJoin}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Join Workspace</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ORGANIZATION NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                placeholder="e.g. Acme Corp"
                placeholderTextColor={theme.textSecondary}
                value={orgName}
                onChangeText={setOrgName}
              />
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.primary }]} 
                onPress={handleCreate}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Create Workspace</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  existingOrgs: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  orgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
  },
  orgIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  orgIconText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '700',
  },
  orgRole: {
    fontSize: 12,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  form: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default OrganizationScreen;
