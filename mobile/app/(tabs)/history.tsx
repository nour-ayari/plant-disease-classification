import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { getHistory, ScanRecord } from '@/utils/history';

function formatName(raw: string): string {
  return raw.replace(/_+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
}

export default function HistoryScreen() {
  const [records, setRecords] = useState<ScanRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setRecords);
    }, [])
  );

  if (records.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🌿</Text>
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptySub}>Scan a plant leaf to see results here</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.page}
      contentContainerStyle={styles.list}
      data={records}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ScanCard item={item} />}
    />
  );
}

function ScanCard({ item }: { item: ScanRecord }) {
  const isHealthy = item.disease.toLowerCase().includes('healthy');
  const [imgError, setImgError] = useState(false);
  return (
    <View style={[styles.card, isHealthy ? styles.cardHealthy : styles.cardDiseased]}>
      {imgError || !item.imageUri ? (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Text style={styles.thumbEmoji}>🌿</Text>
        </View>
      ) : (
        <Image source={{ uri: item.imageUri }} style={styles.thumb} onError={() => setImgError(true)} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.diseaseName} numberOfLines={2}>
          {formatName(item.disease)}
        </Text>
        <Text style={styles.confidence}>{(item.confidence * 100).toFixed(1)}% confidence</Text>
        <Text style={styles.date}>{formatDate(item.scannedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f7f5' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40, backgroundColor: '#f5f7f5' },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  emptySub: { fontSize: 14, color: '#7a9e7e', textAlign: 'center' },

  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cardHealthy: { borderLeftWidth: 4, borderLeftColor: '#2d7a4f' },
  cardDiseased: { borderLeftWidth: 4, borderLeftColor: '#e67e22' },

  thumb: { width: 72, height: 72 },
  thumbPlaceholder: { backgroundColor: '#e0e8e1', alignItems: 'center', justifyContent: 'center' },
  thumbEmoji: { fontSize: 28 },
  cardBody: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 2 },
  diseaseName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  confidence: { fontSize: 13, color: '#555' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
});
