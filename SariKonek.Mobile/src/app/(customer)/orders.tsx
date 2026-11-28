import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { getMyOrders } from '../../services/customer';
import type { Order } from '../../types';

export default function CustomerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setError('');
    try {
      setOrders(await getMyOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    const interval = setInterval(() => {
      void loadOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  if (loading) return <LoadingState message="Loading your orders..." />;

  if (error && orders.length === 0) {
    return <ErrorState message={error} onRetry={() => {
      setLoading(true);
      void loadOrders();
    }} />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
        My orders
      </Text>
      {error ? <Text>{error}</Text> : null}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadOrders();
            }}
          />
        }
        ListEmptyComponent={<Text>You have not placed any orders yet.</Text>}
        renderItem={({ item }) => (
          <View style={{
            padding: 16,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginBottom: 10,
            gap: 6,
          }}>
            <Text style={{ fontWeight: '600' }}>
              Order: {item.id}
            </Text>
            <Text>Status: {item.status}</Text>
            <Text>Total: ₱{Number(item.totalAmount).toFixed(2)}</Text>
            <Text>
              Placed: {item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : 'Date unavailable'}
            </Text>
            <Text>Items: {item.items?.length ?? 0}</Text>
          </View>
        )}
      />
    </View>
  );
}