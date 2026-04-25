import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Animated,
  Easing,
  Modal,
  Pressable,
  Alert,
  Clipboard,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useOrganizationList } from '@clerk/clerk-expo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchTasks } from '../api/tasks';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const TaskListScreen = ({ navigation }) => {
  const { user, isAdmin, activeOrganization, logout } = useAuth();
  const { theme, themeMode, toggleTheme, isDark } = useTheme();
  const { setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
      pageSize: 25,
    },
  });

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // FAB scale animation
  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [activeOrganization])
  );

  useEffect(() => {
    applyFilters();
  }, [tasks, activeFilter, searchQuery]);

  const loadTasks = async () => {
    if (!activeOrganization) return;
    try {
      setError('');
      const response = await fetchTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Failed to load tasks.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load tasks.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTasks();
  };

  const applyFilters = () => {
    let result = [...tasks];
    if (activeFilter !== 'all') {
      result = result.filter((task) => task.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }
    setFilteredTasks(result);
  };

  const shareInvite = async () => {
    if (!activeOrganization?.joinCode) return;
    try {
      const message = `Join my workspace "${activeOrganization.name}" on TaskManager!\n\nJoin Code: ${activeOrganization.joinCode}\n\nDownload the app and enter the code to join the team.`;
      const result = await Share.share({
        message,
        title: `Invite to ${activeOrganization.name}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite.');
    }
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.orgBadge} onPress={() => setShowOrgModal(true)}>
          <View style={[styles.orgIcon, { backgroundColor: theme.primary }]}>
            <Text style={styles.orgIconText}>{activeOrganization?.name?.[0].toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.orgName, { color: theme.text }]} numberOfLines={1}>
              {activeOrganization?.name || 'Loading...'}
            </Text>
            <Text style={[styles.orgRole, { color: theme.textSecondary }]}>
              {isAdmin ? 'Administrator' : 'Member'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={theme.textSecondary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                onPress={() => setShowInviteModal(true)}
            >
                <Ionicons name="person-add-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                onPress={() => setShowThemeModal(true)}
            >
                <Ionicons 
                    name={themeMode === 'dark' ? 'moon' : themeMode === 'light' ? 'sunny' : 'contrast'} 
                    size={20} 
                    color={theme.primary} 
                />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.welcomeSection}>
        <Text style={[styles.greeting, { color: theme.text }]}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>{tasks.length} tasks in this workspace</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                activeFilter === item.key && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setActiveFilter(item.key)}
            >
              <Text style={[styles.filterChipText, { color: theme.textSecondary }, activeFilter === item.key && { color: '#FFF' }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Org Switcher Modal */}
      <Modal visible={showOrgModal} transparent animationType="fade" onRequestClose={() => setShowOrgModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowOrgModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Workspaces</Text>
            {userMemberships.data?.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.orgOption, activeOrganization?.clerkOrgId === m.organization.id && { backgroundColor: theme.primary + '10' }]}
                onPress={async () => {
                  await setActive({ organization: m.organization.id });
                  setShowOrgModal(false);
                }}
              >
                <View style={[styles.miniOrgIcon, { backgroundColor: theme.primary }]}>
                   <Text style={styles.miniOrgIconText}>{m.organization.name[0]}</Text>
                </View>
                <Text style={[styles.orgOptionText, { color: theme.text }]}>{m.organization.name}</Text>
                {activeOrganization?.clerkOrgId === m.organization.id && <Ionicons name="checkmark" size={20} color={theme.primary} />}
              </TouchableOpacity>
            ))}

            <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 12, opacity: 0.5 }} />

            <TouchableOpacity 
              style={styles.orgOption} 
              onPress={() => {
                setShowOrgModal(false);
                shareInvite();
              }}
            >
              <Ionicons name="share-social-outline" size={20} color={theme.primary} />
              <Text style={[styles.orgOptionText, { color: theme.primary, marginLeft: 12 }]}>Share Workspace Invite</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.orgOption} 
              onPress={async () => {
                setShowOrgModal(false);
                try {
                  await setActive({ organization: null });
                } catch (err) {
                  console.error('Failed to unset organization:', err);
                }
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
              <Text style={[styles.orgOptionText, { color: theme.primary, marginLeft: 12 }]}>Add or Join Workspace</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutOption} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutOptionText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="fade" onRequestClose={() => setShowInviteModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowInviteModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
                <Ionicons name="people" size={32} color={theme.primary} />
                <Text style={[styles.modalTitle, { color: theme.text, marginTop: 12 }]}>Invite Team</Text>
            </View>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                Share this unique invite code with your teammates to have them join **{activeOrganization?.name}**.
            </Text>
            <View style={[styles.codeBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.codeText, { color: theme.text }]}>{activeOrganization?.joinCode}</Text>
                <TouchableOpacity style={[styles.copyButton, { backgroundColor: theme.primary }]} onPress={shareInvite}>
                    <Ionicons name="share-outline" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
            <Text style={[styles.codeHint, { color: theme.textSecondary }]}>Tell them to choose "Join Team" and enter this code.</Text>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.background }]} onPress={() => setShowInviteModal(false)}>
                <Text style={[styles.closeButtonText, { color: theme.text }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Theme Modal */}
      <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowThemeModal(false)}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Appearance</Text>
                {['light', 'dark', 'system'].map((id) => (
                    <TouchableOpacity key={id} style={styles.themeOption} onPress={() => { toggleTheme(id); setShowThemeModal(false); }}>
                        <Ionicons name={id === 'light' ? 'sunny' : id === 'dark' ? 'moon' : 'settings-outline'} size={20} color={themeMode === id ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.themeOptionText, { color: themeMode === id ? theme.text : theme.textSecondary, textTransform: 'capitalize' }]}>{id}</Text>
                        {themeMode === id && <Ionicons name="checkmark" size={20} color={theme.primary} />}
                    </TouchableOpacity>
                ))}
            </View>
        </Pressable>
      </Modal>
    </View>
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => <TaskCard task={item} index={index} onPress={() => navigation.navigate('TaskDetail', { task: item })} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={error ? <EmptyState icon="alert-circle-outline" title="Error" subtitle={error} /> : <EmptyState icon="clipboard-outline" title="No tasks" subtitle="Your team is all caught up!" />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
        contentContainerStyle={styles.listContent}
      />
      <Animated.View style={[styles.fabWrapper, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('CreateTask')}>
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: 100 },
  headerContainer: { paddingTop: 60, paddingBottom: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  orgBadge: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  orgIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  orgIconText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  orgName: { fontSize: 16, fontWeight: '800' },
  orgRole: { fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: '900' },
  statsText: { fontSize: 14, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 15 },
  filterContainer: { marginBottom: 8 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterChipText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  modalHeader: { alignItems: 'center' },
  modalSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  codeBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, borderWidth: 1, marginBottom: 16 },
  codeText: { flex: 1, fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 4 },
  copyButton: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  codeHint: { fontSize: 13, textAlign: 'center', fontStyle: 'italic', marginBottom: 24 },
  closeButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  closeButtonText: { fontSize: 15, fontWeight: '700' },
  orgOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8 },
  miniOrgIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  miniOrgIconText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  orgOptionText: { flex: 1, fontSize: 16, fontWeight: '700' },
  logoutOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  logoutOptionText: { marginLeft: 12, color: '#EF4444', fontSize: 16, fontWeight: '700' },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 4 },
  themeOptionText: { flex: 1, fontSize: 16, marginLeft: 12, fontWeight: '600' },
  fabWrapper: { position: 'absolute', bottom: 30, right: 24 },
  fab: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { height: 5 } }
});

export default TaskListScreen;
