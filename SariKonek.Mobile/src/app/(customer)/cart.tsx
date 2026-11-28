import { useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../services/customer';

export default function CustomerCartScreen() {
  const router = useRouter();
  const { storeId, items, total, setQty, remove, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);

  async function checkout() {
    if (!storeId || items.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      await createOrder({
        storeId,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      clear();
      Alert.alert('Order placed', 'Your order was submitted successfully.', [
        {
          text: 'View orders',
          onPress: () => router.replace('/(customer)/orders'),
        },
      ]);
    } catch (error: unknown) {
      const response = (
        error as {
          response?: { status?: number; data?: unknown };
        }
      )?.response;

      if (response?.status === 409) {
        Alert.alert(
          'Insufficient stock',
          typeof response.data === 'string'
            ? response.data
            : 'One or more products no longer have enough stock. Review your cart and try again.'
        );
      } else {
        Alert.alert(
          'Checkout failed',
          error instanceof Error
            ? error.message
            : 'Unable to submit your order. Please try again.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Your cart</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={<Text>Your cart is empty.</Text>}
        renderItem={({ item }) => (
          <View style={{
            padding: 12,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginBottom: 10,
            gap: 6,
          }}>
            <Text style={{ fontWeight: '600' }}>{item.product.name}</Text>
            <Text>₱{Number(item.product.price).toFixed(2)} each</Text>
            <Text>Quantity: {item.quantity}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="-"
                onPress={() => setQty(item.product.id, item.quantity - 1)}
              />
              <Button
                title="+"
                disabled={item.quantity >= item.product.stockQuantity}
                onPress={() => setQty(item.product.id, item.quantity + 1)}
              />
              <Button
                title="Remove"
                onPress={() => remove(item.product.id)}
              />
            </View>
          </View>
        )}
      />

      <Text>Estimated total: ₱{total.toFixed(2)}</Text>
      <Text>
        Payment and pickup are completed in-store. No online payment is collected.
      </Text>
      <Button
        title={submitting ? 'Submitting...' : 'Place order'}
        disabled={submitting || items.length === 0 || !storeId}
        onPress={() => void checkout()}
      />
    </View>
  );
}