import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { addScan } from '@/utils/history';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL = 'http://192.168.1.132:8000';

type Result = {
  disease: string;
  confidence: number;
};

function formatName(raw: string): string {
  return raw.replace(/_+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ScannerScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function classify(uri: string) {
    setLoading(true);
    setResult(null);
    try {
      const body = new FormData();
      body.append('file', { uri, name: 'leaf.jpg', type: 'image/jpeg' } as never);

      const res = await fetch(`${API_URL}/predict`, { method: 'POST', body });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setResult(data);
      await addScan({ imageUri: uri, disease: data.disease, confidence: data.confidence });
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  async function pickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow gallery access to pick a photo.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.85 });
    if (!picked.canceled) {
      const uri = picked.assets[0].uri;
      setImageUri(uri);
      setResult(null);
      classify(uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow camera access to take a photo.');
      return;
    }
    const photo = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!photo.canceled) {
      const uri = photo.assets[0].uri;
      setImageUri(uri);
      setResult(null);
      classify(uri);
    }
  }

  const isHealthy = result?.disease.toLowerCase().includes('healthy');

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.imageBox}>
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <Pressable
              style={styles.removeBtn}
              onPress={() => { setImageUri(null); setResult(null); }}
              hitSlop={10}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.placeholder}>No image selected{'\n'}Pick one below</Text>
        )}
      </View>

      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={takePhoto}>
          <Text style={styles.btnText}>Camera</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnOutline]} onPress={pickFromGallery}>
          <Text style={[styles.btnText, styles.btnTextOutline]}>Gallery</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.resultBox}>
          <ActivityIndicator size="large" color="#2d7a4f" />
          <Text style={styles.analyzing}>Analyzing leaf…</Text>
        </View>
      )}

      {result && !loading && (
        <View style={[styles.resultBox, isHealthy ? styles.boxHealthy : styles.boxDiseased]}>
          <Text style={styles.resultLabel}>{isHealthy ? 'Healthy' : 'Disease Detected'}</Text>
          <Text style={styles.diseaseName}>{formatName(result.disease)}</Text>
          <Text style={styles.confidence}>{(result.confidence * 100).toFixed(1)}% confidence</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f7f5' },
  content: { padding: 20, gap: 16, paddingBottom: 40 },

  imageBox: {
    height: 300,
    borderRadius: 16,
    backgroundColor: '#e0e8e1',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  placeholder: { color: '#7a9e7e', textAlign: 'center', fontSize: 15, lineHeight: 24 },

  row: { flexDirection: 'row', gap: 12 },
  btn: {
    flex: 1,
    backgroundColor: '#2d7a4f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#2d7a4f' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnTextOutline: { color: '#2d7a4f' },

  resultBox: { borderRadius: 16, padding: 24, alignItems: 'center', gap: 8, backgroundColor: '#fff' },
  boxHealthy: { backgroundColor: '#e8f5e9' },
  boxDiseased: { backgroundColor: '#fff3e0' },

  resultLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', color: '#666', letterSpacing: 1 },
  diseaseName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  confidence: { fontSize: 14, color: '#666' },
  analyzing: { marginTop: 10, color: '#2d7a4f', fontSize: 15 },
});
