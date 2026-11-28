import { ActivityIndicator, Text, View } from 'react-native';

export default function LoadingState({
  message = 'Loading...',
}: {
  message?: string;
}) {
  return (
    <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
      <ActivityIndicator />
      <Text>{message}</Text>
    </View>
  );
}