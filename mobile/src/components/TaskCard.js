import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { useTheme } from '../context/ThemeContext';
import { formatDate, getInitials, truncateText } from '../utils/helpers';

const TaskCard = ({ task, onPress, index = 0 }) => {
  const { theme, isDark } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  // Fade-in animation on mount
  React.useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const assignedName = task.assignedTo?.name || 'Unassigned';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeValue,
          transform: [
            { scale: scaleValue },
            {
              translateY: fadeValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
            styles.card, 
            { 
                backgroundColor: theme.glass, 
                borderColor: theme.glassBorder, 
                shadowColor: theme.shadow 
            }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.topRow}>
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            {task.description ? (
              <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                {truncateText(task.description, 100)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.bottomRow}>
          <StatusBadge status={task.status} size="small" />

          <View style={styles.metaSection}>
            <View style={styles.assignee}>
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.avatarText}>
                  {getInitials(assignedName)}
                </Text>
              </View>
              <Text style={[styles.assigneeName, { color: theme.textSecondary }]} numberOfLines={1}>
                {assignedName}
              </Text>
            </View>

            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={theme.textSecondary}
              />
              <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(task.createdAt)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  topRow: {
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  assigneeName: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 80,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
  },
});

export default TaskCard;
