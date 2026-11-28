import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

const HOME = {
  '(auth)': '/(auth)/login',
  '(customer)': '/(customer)',
  '(store)': '/(store)',
} as const;

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const group = (segments as string[])[0]; // '(auth)' | '(customer)' | '(store)' | undefined
  const target: keyof typeof HOME = !user
    ? '(auth)'
    : user.role === 'StoreOwner'
      ? '(store)'
      : '(customer)';

  useEffect(() => {
    if (loading || group === target) return;
    router.replace(HOME[target]);
  }, [loading, group, target, router]);

  const showOverlay = loading || group !== target;

  return (
    <>
      <Slot />
      {showOverlay && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
    overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});