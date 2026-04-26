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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fetchUsers } from '../api/tasks';
import { getInitials } from '../utils/helpers';

const TeamScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const renderMember = ({ item }) => (
    <View style={[styles.memberCard, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{item.email}</Text>
      </View>
      <View style={[styles.roleBadge, { backgroundColor: theme.primary + '15' }]}>
        <Text style={[styles.roleText, { color: theme.primary }]}>
          {item.role === 'admin' ? 'Owner' : 'Member'}
        </Text>
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
        keyExtractor={(item) => item._id}
        renderItem={renderMember}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No team members found</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      />

      {isLoading && !isRefreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  glow: { position: 'absolute', borderRadius: 200 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  placeholder: { width: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '700' },
  memberEmail: { fontSize: 13, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 16, marginTop: 16, fontWeight: '600' },
  loadingContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
});

export default TeamScreen;
