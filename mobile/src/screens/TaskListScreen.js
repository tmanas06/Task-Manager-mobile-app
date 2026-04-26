import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
  Animated,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useOrganizationList } from '@clerk/clerk-expo';
import { fetchTasks } from '../api/tasks';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const FILTERS = [
  { key: 'all', label: 'All Tasks' },
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTasks();
    Animated.spring(fabScale, {
      toValue: 1,
      useNativeDriver: true,
      delay: 500,
    }).start();
  }, [activeOrganization]);

  useEffect(() => {
    applyFilters();
  }, [tasks, activeFilter, searchQuery]);

  const loadTasks = async () => {
    setError(null);
    try {
      const response = await fetchTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.orgBadge} onPress={() => setShowOrgModal(true)}>
          <View style={[styles.orgIcon, { backgroundColor: theme.primary }]}>
            <Text style={styles.orgIconText}>{activeOrganization?.name?.[0].toUpperCase()}</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.orgName, { color: theme.text }]} numberOfLines={1}>
                {activeOrganization?.name || 'Loading...'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={theme.textSecondary} style={{ marginLeft: 6 }} />
            </View>
            <Text style={[styles.orgRole, { color: theme.textSecondary }]}>
              {isAdmin ? 'Administrator' : 'Member'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                onPress={() => navigation.navigate('Workspace')}
            >
                <Ionicons name="settings-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                onPress={() => navigation.navigate('Team')}
            >
                <Ionicons name="people-outline" size={20} color={theme.primary} />
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
        <Text style={[styles.statsText, { color: theme.textSecondary }]}>{tasks.length} tasks in this workspace · {tasks.filter(t => t.status === 'in-progress').length} active</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.glass, borderColor: theme.glassBorder }]}>
        <Ionicons name="search" size={18} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search projects & tasks..."
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
                { backgroundColor: theme.glass, borderColor: theme.glassBorder },
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
    </View>
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Background Decor */}
      <View style={[styles.glow, { top: -100, left: -100, backgroundColor: theme.primary + '20' }]} />
      <View style={[styles.glow, { bottom: 0, right: -150, backgroundColor: theme.primary + '15', width: 400, height: 400 }]} />

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
        <TouchableOpacity 
            style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]} 
            onPress={() => navigation.navigate('CreateTask')}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Org Switcher Modal */}
      <Modal visible={showOrgModal} transparent animationType="fade" onRequestClose={() => setShowOrgModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowOrgModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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

            <TouchableOpacity style={styles.logoutOption} onPress={logout}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutOptionText}>Sign Out From Workspace</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Theme Modal */}
      <Modal visible={showThemeModal} transparent animationType="fade" onRequestClose={() => setShowThemeModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowThemeModal(false)}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: 100 },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  headerContainer: { paddingTop: 40, paddingBottom: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  orgBadge: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  orgIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  orgIconText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  orgName: { fontSize: 16, fontWeight: '800' },
  orgRole: { fontSize: 12, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  welcomeSection: { paddingHorizontal: 20, marginBottom: 16 },
  greeting: { fontSize: 28, fontWeight: '900' },
  statsText: { fontSize: 14, marginTop: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, marginBottom: 16, height: 50 },
  searchIcon: { marginRight: 10, opacity: 0.5 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '600' },
  filterContainer: { marginBottom: 8 },
  filterList: { paddingHorizontal: 20, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterChipText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 28, padding: 24, borderWidth: 1 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  orgOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 8 },
  miniOrgIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  miniOrgIconText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  orgOptionText: { flex: 1, fontSize: 16, fontWeight: '700' },
  logoutOption: { flexDirection: 'row', alignItems: 'center', padding: 16, marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  logoutOptionText: { marginLeft: 12, color: '#EF4444', fontSize: 16, fontWeight: '700' },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 4 },
  themeOptionText: { flex: 1, fontSize: 16, marginLeft: 12, fontWeight: '600' },
  fabWrapper: { position: 'absolute', bottom: 30, right: 24 },
  fab: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { height: 5 } }
});

export default TaskListScreen;
