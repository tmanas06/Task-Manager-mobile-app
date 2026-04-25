import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Screens
import LoginScreen from '../screens/LoginScreen';
import TaskListScreen from '../screens/TaskListScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';

const Stack = createStackNavigator();

const AuthStack = ({ theme }) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: theme.background },
      animationEnabled: true,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const MainStack = ({ theme }) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: theme.background },
      animationEnabled: true,
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="TaskList" component={TaskListScreen} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <LoadingSpinner message="Waking up..." />;
  }

  return (
    <NavigationContainer theme={{
        dark: theme.isDark,
        colors: {
            primary: theme.primary,
            background: theme.background,
            card: theme.surface,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
        }
    }}>
      {isAuthenticated ? <MainStack theme={theme} /> : <AuthStack theme={theme} />}
    </NavigationContainer>
  );
};

export default AppNavigator;
