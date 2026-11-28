import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCart } from '../../../context/CartContext';
import LoadingState from '../../../components/LoadingState';
import ErrorState from '../../../components/ErrorState';
import { getProducts } from '../../../services/customer';
import type { Product } from '../../../types';

export default function StoreCatalogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { add, itemCount, storeId } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      setProducts(await getProducts(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  if (loading) return <LoadingState message="Loading products..." />;

  if (error) {
    return <ErrorState message={error} onRetry={() => {
      setLoading(true);
      void loadProducts();
    }} />;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <Text style={{ fontSize: 20, fontWeight: '600' }}>Store catalog</Text>
        <Button
          title={`Cart (${itemCount})`}
          onPress={() => router.push('/(customer)/cart')}
        />
      </View>

      {storeId && storeId !== id ? (
        <Text>Adding an item here will replace the cart from another store.</Text>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No products available.</Text>}
        renderItem={({ item }) => (
          <View style={{
            padding: 16,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginBottom: 10,
            gap: 6,
          }}>
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
            <Text>Price: ₱{Number(item.price).toFixed(2)}</Text>
            <Text>Stock: {item.stockQuantity}</Text>
            <Button
              title="Add to cart"
              disabled={item.stockQuantity <= 0}
              onPress={() => add(item)}
            />
          </View>
        )}
      />
    </View>
  );
}