import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function StoreHome() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Store owner home (placeholder)</Text>
      <Text>{user?.fullName}</Text>
      <Text>{user?.email}</Text>
      <Text>Role: {user?.role}</Text>
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  button: { backgroundColor: '#b91c1c', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600' },
});