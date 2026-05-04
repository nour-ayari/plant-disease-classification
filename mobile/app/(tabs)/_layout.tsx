import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2d7a4f',
        tabBarInactiveTintColor: '#9BA1A6',
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#e0e8e1' },
        headerStyle: { backgroundColor: '#f5f7f5' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: '#1a1a1a' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
