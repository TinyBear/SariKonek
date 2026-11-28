import { Button, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function CustomerProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 24, gap: 12 }}>
      <Text>Customer Profile</Text>
      <Text>Name: {user?.fullName ?? '—'}</Text>
      <Text>Email: {user?.email ?? '—'}</Text>
      <Text>Role: {user?.role ?? '—'}</Text>
      <Button title="Log out" onPress={logout} />
    </View>
  );
}