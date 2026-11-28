import { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { getStoreByQr } from '../../services/customer';

export default function CustomerScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState('Point the camera at a store QR code.');
  const [busy, setBusy] = useState(false);

  if (!permission) {
    return <View style={{ flex: 1, padding: 24 }}><Text>Checking camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 12 }}>
        <Text>Camera permission is required to scan store QR codes.</Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  async function handleScan(data: string) {
    if (scanned || busy) return;

    setScanned(true);
    setBusy(true);
    setMessage('QR code detected. Looking up store...');

    try {
      const store = await getStoreByQr(data);
      router.push(`/(customer)/store/${store.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Store QR code not found.'
      );
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text>{message}</Text>
      <CameraView
        style={{ flex: 1, minHeight: 300 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          scanned ? undefined : ({ data }) => void handleScan(data)
        }
      />
      {scanned && !busy ? (
        <Button
          title="Scan again"
          onPress={() => {
            setScanned(false);
            setMessage('Point the camera at a store QR code.');
          }}
        />
      ) : null}
    </View>
  );
}