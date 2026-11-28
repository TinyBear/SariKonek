import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getStores } from '../../services/customer';
import type { Store } from '../../types';

export default function CustomerStoresScreen() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStores = useCallback(async () => {
    setError('');
    try {
      const data = await getStores();
      setStores(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load stores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const refresh = () => {
    setRefreshing(true);
    void loadStores();
  };

  if (loading) return <LoadingState message="Loading stores..." />;

  if (error) {
    return <ErrorState message={error} onRetry={() => {
      setLoading(true);
      void loadStores();
    }} />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 12 }}>
        Available stores
      </Text>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={<Text>No active stores found.</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(customer)/store/[id]",
                params: { id: item.id },
              })
            }
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.storeName}</Text>
            <Text>{item.address || "Address not provided"}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}