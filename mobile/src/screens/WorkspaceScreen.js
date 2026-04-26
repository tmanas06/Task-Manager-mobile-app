import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const WorkspaceScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { activeOrganization, isAdmin, logout } = useAuth();

  const shareInvite = async () => {
    if (!activeOrganization?.joinCode) return;
    try {
      const message = `Join my workspace "${activeOrganization.name}" on TaskManager!\n\nJoin Code: ${activeOrganization.joinCode}`;
      await Share.share({
        message,
        title: `Invite to ${activeOrganization.name}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Decor */}
      <View style={[styles.glow, { top: -50, right: -100, backgroundColor: theme.primary + '25', width: 400, height: 400 }]} />
      <View style={[styles.glow, { bottom: 0, left: -50, backgroundColor: theme.primary + '15', width: 350, height: 350 }]} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Workspace Info</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Org Profile */}
        <View style={[styles.profileCard, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
          <View style={[styles.orgIconLarge, { backgroundColor: theme.primary }]}>
            <Text style={styles.orgIconTextLarge}>{activeOrganization?.name?.[0].toUpperCase()}</Text>
          </View>
          <Text style={[styles.orgNameLarge, { color: theme.text }]}>{activeOrganization?.name}</Text>
          <Text style={[styles.roleText, { color: theme.textSecondary }]}>
            {isAdmin ? 'Administrator Access' : 'Team Member'}
          </Text>
        </View>

        {/* Join Code Section */}
        <View style={[styles.glassSection, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>INVITATION CODE</Text>
          <View style={[styles.codeBox, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
            <Text style={[styles.codeText, { color: theme.text }]}>{activeOrganization?.joinCode}</Text>
            <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.primary }]} onPress={shareInvite}>
              <Ionicons name="share-social-outline" size={20} color="#FFF" />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionRow, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}
            onPress={() => navigation.navigate('Team')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#3B82F615' }]}>
              <Ionicons name="people-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>Manage Team</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionRow, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}
            onPress={() => Alert.alert('Coming Soon', 'Individual project management is under development.')}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FFEE0015' }]}>
              <Ionicons name="folder-open-outline" size={22} color="#F59E0B" />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>Project Settings</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionRow, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}
            onPress={logout}
          >
            <View style={[styles.iconBox, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </View>
            <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Leave Workspace</Text>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>TaskManager v1.0.0</Text>
          <Text style={[styles.versionText, { color: theme.textSecondary, marginTop: 4 }]}>Created with ⚡ by webyalaya</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  glow: { position: 'absolute', borderRadius: 200 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  placeholder: { width: 40 },
  scrollContent: { padding: 16 },
  profileCard: { alignItems: 'center', padding: 32, borderRadius: 28, borderWidth: 1, marginBottom: 20 },
  orgIconLarge: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
  orgIconTextLarge: { color: '#FFF', fontSize: 36, fontWeight: '900' },
  orgNameLarge: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  roleText: { fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  glassSection: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  codeBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  codeText: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  shareButton: { paddingHorizontal: 16, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  shareText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  actionsContainer: { gap: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  actionLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  footer: { marginTop: 40, alignItems: 'center', marginBottom: 40 },
  versionText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 },
});

export default WorkspaceScreen;
