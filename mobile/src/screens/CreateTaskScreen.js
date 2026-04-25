import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createTask, fetchUsers } from '../api/tasks';
import { useTheme } from '../context/ThemeContext';
import { getStatusLabel } from '../utils/helpers';

const STATUS_OPTIONS = ['pending', 'in-progress', 'completed'];

const CreateTaskScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetchUsers();
      if (response.success) {
        setUsers(response.data);
        if (response.data.length > 0) {
          setAssignedTo(response.data[0]._id);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load users for assignment.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
        case 'pending': return theme.warning;
        case 'in-progress': return theme.primary;
        case 'completed': return theme.success;
        default: return theme.secondary;
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (!assignedTo) {
      setError('Please select a user to assign the task.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        assignedTo,
      });

      if (response.success) {
        Alert.alert('Success', 'Task created successfully.');
        navigation.goBack();
      } else {
        setError(response.message || 'Failed to create task.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create task.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Task</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={[styles.errorText, { color: '#B91C1C' }]}>{error}</Text>
            </View>
          ) : null}

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>TITLE</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="Enter task title"
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setError('');
              }}
              maxLength={100}
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>{title.length}/100</Text>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="Task description (optional)"
              placeholderTextColor={theme.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>{description.length}/500</Text>
          </View>

          {/* Status Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>STATUS</Text>
            <View style={styles.statusContainer}>
              {STATUS_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    status === s && { backgroundColor: getStatusColor(s) + '15', borderColor: getStatusColor(s), borderWidth: 2 },
                  ]}
                  onPress={() => setStatus(s)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: theme.textSecondary },
                      status === s && { color: getStatusColor(s), fontWeight: '800' },
                    ]}
                  >
                    {getStatusLabel(s)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Assign To */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ASSIGN TO</Text>
            {isLoadingUsers ? (
              <View style={styles.loadingUsers}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingUsersText, { color: theme.textSecondary }]}>Loading users...</Text>
              </View>
            ) : (
              <View style={styles.userList}>
                {users.map((u) => (
                  <TouchableOpacity
                    key={u._id}
                    style={[
                      styles.userOption,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      assignedTo === u._id && { borderColor: theme.primary, backgroundColor: theme.primary + '10' },
                    ]}
                    onPress={() => setAssignedTo(u._id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.userRadio, { borderColor: theme.secondary }, assignedTo === u._id && { borderColor: theme.primary }]}>
                      {assignedTo === u._id ? <View style={[styles.userRadioDot, { backgroundColor: theme.primary }]} /> : null}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: theme.text }]}>{u.name}</Text>
                      <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{u.email} · {u.role}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary, shadowColor: theme.primary }, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>CREATE TASK</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
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
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
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
  inputGroup: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
  },
  loadingUsersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userList: {
    gap: 10,
  },
  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  userRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  submitButton: {
    borderRadius: 14,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default CreateTaskScreen;
