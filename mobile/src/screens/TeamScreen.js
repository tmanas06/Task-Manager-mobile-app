import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fetchUsers } from '../api/tasks';
import { updateMemberRole } from '../api/orgs';
import { getInitials } from '../utils/helpers';

const TeamScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { isAdmin, user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const response = await fetchUsers();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (err) {
      console.error('Load Members Error:', err);
      Alert.alert('Error', 'Failed to load team members.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMembers();
  };

  const handleChangeRole = (member) => {
    if (!isAdmin) return;
    if (member.clerkId === currentUser.clerkId) {
      Alert.alert('Action Restricted', 'You cannot change your own role.');
      return;
    }
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async (newRole) => {
    setIsUpdating(true);
    try {
      const clerkRole = newRole === 'admin' ? 'org:admin' : 'org:member';
      await updateMemberRole(selectedMember.clerkId, clerkRole);
      Alert.alert('Success', `${selectedMember.name} is now a ${newRole === 'admin' ? 'Owner' : 'Member'}.`);
      setShowRoleModal(false);
      loadMembers(); // Refresh list
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update user role.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderMember = ({ item }) => (
    <View style={[styles.memberCard, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{item.email}</Text>
      </View>
      
      <View style={styles.rightActions}>
        <View style={[styles.roleBadge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.roleText, { color: theme.primary }]}>
            {item.role === 'admin' ? 'Owner' : 'Member'}
            </Text>
        </View>

        {isAdmin && item.clerkId !== currentUser.clerkId && (
            <TouchableOpacity 
                style={[styles.settingsButton, { backgroundColor: theme.surface }]}
                onPress={() => handleChangeRole(item)}
            >
                <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background Decor */}
      <View style={[styles.glow, { top: -100, right: -100, backgroundColor: theme.primary + '20', width: 400, height: 400 }]} />
      <View style={[styles.glow, { bottom: 0, left: -100, backgroundColor: theme.primary + '15', width: 350, height: 350 }]} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Team Members</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.clerkId || item._id}
        renderItem={renderMember}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      />

      {isLoading && !isRefreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Role Selection Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade" onRequestClose={() => setShowRoleModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowRoleModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Change Role</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Select position for {selectedMember?.name}</Text>
            
            <TouchableOpacity 
                style={[styles.roleOption, selectedMember?.role === 'admin' && styles.roleOptionActive]} 
                onPress={() => confirmRoleChange('admin')}
                disabled={isUpdating}
            >
                <View style={[styles.roleIcon, { backgroundColor: '#3B82F620' }]}>
                    <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.roleOptionTitle, { color: theme.text }]}>Owner / Administrator</Text>
                    <Text style={[styles.roleOptionDesc, { color: theme.textSecondary }]}>Full access to workspace settings and team management.</Text>
                </View>
                {selectedMember?.role === 'admin' && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.roleOption, selectedMember?.role !== 'admin' && styles.roleOptionActive]} 
                onPress={() => confirmRoleChange('user')}
                disabled={isUpdating}
            >
                <View style={[styles.roleIcon, { backgroundColor: '#10B98120' }]}>
                    <Ionicons name="person" size={20} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.roleOptionTitle, { color: theme.text }]}>Team Member</Text>
                    <Text style={[styles.roleOptionDesc, { color: theme.textSecondary }]}>Can view and complete tasks assigned to them.</Text>
                </View>
                {selectedMember?.role !== 'admin' && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
            </TouchableOpacity>

            {isUpdating && (
                <View style={styles.modalLoading}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={{ color: theme.text, marginLeft: 10, fontWeight: '700' }}>Updating...</Text>
                </View>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  glow: { position: 'absolute', borderRadius: 200 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 20, paddingHorizontal: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  placeholder: { width: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  memberCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, borderWidth: 1 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '700' },
  memberEmail: { fontSize: 13, marginTop: 2, opacity: 0.6 },
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  settingsButton: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', borderRadius: 32, padding: 24, borderWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  roleOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1.5, borderColor: 'transparent' },
  roleOptionActive: { borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' },
  roleIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  roleOptionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  roleOptionDesc: { fontSize: 12, lineHeight: 16 },
  modalLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
});

export default TeamScreen;
