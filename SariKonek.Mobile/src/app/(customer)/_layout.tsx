import { Tabs } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: 'Stores', headerTitle: 'Stores' }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: 'Scan', headerTitle: 'Scan Store QR' }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: 'Orders', headerTitle: 'My Orders' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', headerTitle: 'Profile' }}
      />
      <Tabs.Screen
        name="store/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="cart"
        options={{ href: null, title: 'Cart' }}
      />
    </Tabs>
  );
}