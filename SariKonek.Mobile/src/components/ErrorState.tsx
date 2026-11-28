import { Button, Text, View } from 'react-native';

export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text>{message}</Text>
      <Button title="Try again" onPress={onRetry} />
    </View>
  );
}