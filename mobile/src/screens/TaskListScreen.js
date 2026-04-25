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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
  const { user, isAdmin, logout } = useAuth();
  const { theme, themeMode, toggleTheme, isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);

  // FAB scale animation
  const fabScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAdmin) {
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
    }
  }, [isAdmin]);

  // Fetch tasks when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  useEffect(() => {
    applyFilters();
  }, [tasks, activeFilter, searchQuery]);

  const loadTasks = async () => {
    try {
      setError('');
      const response = await fetchTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Failed to load tasks.');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to load tasks. Check your connection.';
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

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>
            Hello, {user?.name?.split(' ')[0] || 'User'}
          </Text>
          <Text style={[styles.roleTag, { color: theme.textSecondary }]}>
            {isAdmin ? 'Admin' : 'Member'} · {tasks.length} total tasks
          </Text>
        </View>
        <View style={styles.headerActions}>
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
            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]} onPress={logout}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search tasks..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Bar */}
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
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: theme.textSecondary },
                  activeFilter === item.key && { color: '#FFFFFF' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable 
            style={styles.modalOverlay} 
            onPress={() => setShowThemeModal(false)}
        >
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Appearance</Text>
                {[
                    { id: 'light', label: 'Light', icon: 'sunny' },
                    { id: 'dark', label: 'Dark', icon: 'moon' },
                    { id: 'system', label: 'System', icon: 'settings-outline' },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.themeOption,
                            themeMode === item.id && { backgroundColor: isDark ? '#334155' : '#F1F5F9' }
                        ]}
                        onPress={() => {
                            toggleTheme(item.id);
                            setShowThemeModal(false);
                        }}
                    >
                        <Ionicons name={item.icon} size={20} color={themeMode === item.id ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.themeOptionText, { color: themeMode === item.id ? theme.text : theme.textSecondary }]}>
                            {item.label}
                        </Text>
                        {themeMode === item.id && (
                            <Ionicons name="checkmark" size={20} color={theme.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </Pressable>
      </Modal>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading your tasks..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            index={index}
            onPress={() => navigation.navigate('TaskDetail', { task: item })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          error ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Connection Error"
              subtitle={error}
            />
          ) : searchQuery || activeFilter !== 'all' ? (
            <EmptyState
              icon="filter-outline"
              title="No matching tasks"
              subtitle="Try adjusting your filters or search query."
            />
          ) : (
            <EmptyState
              icon="clipboard-outline"
              title="No tasks yet"
              subtitle={
                isAdmin
                  ? "Tap the + button to create your first task."
                  : "You don't have any tasks assigned yet."
              }
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isAdmin ? (
        <Animated.View
          style={[
            styles.fabWrapper,
            { transform: [{ scale: fabScale }] },
          ]}
        >
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
            onPress={() => navigation.navigate('CreateTask')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
  },
  roleTag: {
    fontSize: 13,
    marginTop: 2,
  },
  actionButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 4,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 24,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '80%',
      borderRadius: 20,
      padding: 24,
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 20,
  },
  themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 4,
  },
  themeOptionText: {
      flex: 1,
      fontSize: 16,
      marginLeft: 12,
      fontWeight: '500',
  }
});

export default TaskListScreen;
