import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/errors';
import type { Role } from '../../types';

export default function RegisterScreen() {
  // ---------- LOGIC (keep) ----------
  const { register } = useAuth();
  const [role, setRole] = useState<Role>('Customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = role === 'StoreOwner';

  const onSubmit = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError('Enter your name, email, and a password of at least 6 characters.');
      return;
    }
    if (isOwner && !storeName.trim()) {
      setError('Enter your store name.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        storeName: isOwner ? storeName.trim() : undefined,
        address: isOwner ? address.trim() : undefined,
      });
      // No navigation here: the root layout redirects by role once `user` is set.
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- PLACEHOLDER UI (partners: replace everything below) ----------
    return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>

        <View style={styles.field}>
          <Text style={styles.label}>I am a</Text>
          <View style={styles.toggleRow}>
            {(['Customer', 'StoreOwner'] as Role[]).map((r) => (
              <Pressable
                key={r}
                style={[styles.toggle, role === r && styles.toggleActive]}
                onPress={() => setRole(r)}
              >
                <Text style={role === r ? styles.toggleTextActive : undefined}>
                  {r === 'Customer' ? 'Customer' : 'Store Owner'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Juan Dela Cruz"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. juan@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Text style={styles.hint}>
            At least 6 characters, with an uppercase letter, a lowercase letter, a number, and a symbol (e.g. Test123!).
          </Text>
        </View>

        {isOwner && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Store name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Aling Nena's Sari-Sari Store"
                value={storeName}
                onChangeText={setStoreName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Store address (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 123 Rizal St, Mandaluyong City"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={onSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </Pressable>

        <View style={styles.row}>
          <Text>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>Log in</Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, gap: 14, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  field: { gap: 4 },
  label: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12, color: '#666' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggle: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, alignItems: 'center' },
  toggleActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  toggleTextActive: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#b91c1c' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  link: { color: '#2563eb', fontWeight: '600' },
});