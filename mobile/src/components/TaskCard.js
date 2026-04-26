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
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 110,
      useNativeDriver: true,
    }).start();
  };

  const assignedName = task.assignedTo?.name || 'Unassigned';
  const getStatusColor = (s) => {
    switch (s) {
        case 'pending': return theme.warning;
        case 'in-progress': return theme.primary;
        case 'completed': return theme.success;
        default: return theme.secondary;
    }
  };

  const statusColor = getStatusColor(task.status);

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
                outputRange: [30, 0],
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
                shadowColor: '#000',
            }
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {/* Inner Border for true premium glass feel */}
        <View style={[styles.innerBorder, { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]} />
        
        {/* Status indicator bar */}
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />

        <View style={styles.content}>
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
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} style={{ opacity: 0.3 }} />
            </View>

            <View style={styles.divider} />

            <View style={styles.bottomRow}>
                <View style={styles.metaLeft}>
                    <StatusBadge status={task.status} size="small" />
                    <View style={styles.tag}>
                        <Ionicons name="bookmark-outline" size={10} color={theme.textSecondary} />
                        <Text style={[styles.tagText, { color: theme.textSecondary }]}>High Priority</Text>
                    </View>
                </View>

                <View style={styles.metaSection}>
                    <View style={styles.assignee}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                            <Text style={styles.avatarText}>
                            {getInitials(assignedName)}
                            </Text>
                        </View>
                        <View>
                             <Text style={[styles.assigneeLabel, { color: theme.textSecondary }]}>Assigned to</Text>
                             <Text style={[styles.assigneeName, { color: theme.text }]} numberOfLines={1}>
                                {assignedName}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            
            <View style={styles.footerRow}>
                <View style={styles.dateRow}>
                    <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.date, { color: theme.textSecondary }]}>{formatDate(task.createdAt)}</Text>
                </View>
                <View style={styles.participants}>
                    <View style={[styles.miniAvatar, { backgroundColor: '#FFD700', right: 0 }]} />
                    <View style={[styles.miniAvatar, { backgroundColor: '#FF69B4', right: -8 }]} />
                    <View style={[styles.miniAvatar, { backgroundColor: '#00BFFF', right: -16 }]} />
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
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    margin: 1,
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  content: {
    padding: 20,
    paddingLeft: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  assigneeLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assigneeName: {
    fontSize: 13,
    fontWeight: '800',
    maxWidth: 100,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  miniAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#121212',
    position: 'absolute',
  },
});

export default TaskCard;
