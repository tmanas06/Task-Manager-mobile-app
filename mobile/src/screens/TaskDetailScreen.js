import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateStatus, updateTask, deleteTask } from '../api/tasks';
import StatusBadge from '../components/StatusBadge';
import { formatDateTime, getInitials, getStatusLabel } from '../utils/helpers';

const STATUS_OPTIONS = ['pending', 'in-progress', 'completed'];

const TaskDetailScreen = ({ route, navigation }) => {
  const { task: initialTask } = route.params;
  const { isAdmin } = useAuth();
  const { theme, isDark } = useTheme();

  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return;
    setIsUpdating(true);
    try {
      const response = await updateStatus(task._id, newStatus);
      if (response.success) {
        setTask(response.data);
        Alert.alert('Success', 'Task status updated.');
      } else {
        Alert.alert('Error', response.message || 'Failed to update status.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update status.';
      Alert.alert('Error', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      Alert.alert('Validation', 'Title cannot be empty.');
      return;
    }
    if (editTitle.trim().length < 3) {
      Alert.alert('Validation', 'Title must be at least 3 characters.');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateTask(task._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      if (response.success) {
        setTask(response.data);
        setIsEditing(false);
        Alert.alert('Success', 'Task updated successfully.');
      } else {
        Alert.alert('Error', response.message || 'Failed to update task.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update task.';
      Alert.alert('Error', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Confirm deletion of "${task.title}". This action is irreversible.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await deleteTask(task._id);
              if (response.success) {
                Alert.alert('Deleted', 'Task has been removed.');
                navigation.goBack();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete task.');
              }
            } catch (err) {
              const message = err.response?.data?.message || 'Failed to delete task.';
              Alert.alert('Error', message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const cancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const assignedName = task.assignedTo?.name || 'Unassigned';
  const assignedEmail = task.assignedTo?.email || '';
  const createdByName = task.createdBy?.name || 'Unknown';

  const getStatusColor = (status) => {
    switch (status) {
        case 'pending': return theme.warning;
        case 'in-progress': return theme.primary;
        case 'completed': return theme.success;
        default: return theme.secondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Task Details</Text>
        <View style={styles.headerActions}>
          {!isEditing ? (
            <>
              <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: theme.background }]} onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={22} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.headerIconButton, { backgroundColor: '#FEE2E2' }]} onPress={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                )}
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentInner}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {isEditing ? (
            <>
              <Text style={[styles.editLabel, { color: theme.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.editInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Task title"
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.editLabel, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Task description"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
              <View style={styles.editActions}>
                <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border }]} onPress={cancelEdit}>
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }, isUpdating && styles.buttonDisabled]} onPress={handleSaveEdit} disabled={isUpdating}>
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
              {task.description ? (
                <Text style={[styles.taskDescription, { color: theme.textSecondary }]}>{task.description}</Text>
              ) : (
                <Text style={[styles.noDescription, { color: theme.textSecondary }]}>No description provided.</Text>
              )}
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Status</Text>
          <View style={styles.currentStatus}>
            <StatusBadge status={task.status} />
          </View>

          <Text style={[styles.statusHint, { color: theme.textSecondary }]}>Change status:</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  task.status === status && { backgroundColor: getStatusColor(status) + '15', borderColor: getStatusColor(status) },
                ]}
                onPress={() => handleStatusChange(status)}
                disabled={isUpdating}
                activeOpacity={0.7}
              >
                <Text style={[styles.statusOptionText, { color: theme.textSecondary }, task.status === status && { color: getStatusColor(status), fontWeight: '700' }]}>
                  {getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Assignment</Text>
          <View style={styles.infoRow}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarText}>{getInitials(assignedName)}</Text>
            </View>
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Assigned To</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{assignedName}</Text>
              {assignedEmail ? <Text style={[styles.infoSubValue, { color: theme.textSecondary }]}>{assignedEmail}</Text> : null}
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.infoRow}>
            <View style={[styles.avatar, { backgroundColor: theme.success }]}>
              <Ionicons name="person-outline" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Created By</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{createdByName}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Timestamps</Text>
          <View style={styles.timestampRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.timestampLabel, { color: theme.textSecondary }]}>Created:</Text>
            <Text style={[styles.timestampValue, { color: theme.text }]}>{formatDateTime(task.createdAt)}</Text>
          </View>
          <View style={styles.timestampRow}>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.timestampLabel, { color: theme.textSecondary }]}>Updated:</Text>
            <Text style={[styles.timestampValue, { color: theme.text }]}>{formatDateTime(task.updatedAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  taskDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  noDescription: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  currentStatus: {
    marginBottom: 20,
  },
  statusHint: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoSubValue: {
    fontSize: 13,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  timestampLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },
  editInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  editTextArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default TaskDetailScreen;
