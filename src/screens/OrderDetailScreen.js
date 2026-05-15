import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function OrderDetailScreen({ route }) {
  const { order, storeName } = route.params ?? {};
  const orderedProducts = order?.products ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Детайли за поръчката</Text>
        {storeName ? <Text style={styles.storeName}>{storeName}</Text> : null}
        <Text style={styles.date}>Дата: {order?.date ?? '-'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Продукти в поръчката</Text>

      <FlatList
        data={orderedProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{item.quantity} бр.</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Няма продукти в тази поръчка.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#333' },
  storeName: { fontSize: 16, color: '#005eb8', fontWeight: '700', marginTop: 8 },
  date: { fontSize: 16, color: '#666', marginTop: 4 },
  sectionTitle: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#888',
    textTransform: 'uppercase',
  },
  listContent: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  productRow: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productName: { flex: 1, fontSize: 16, color: '#172033', fontWeight: '700', paddingRight: 12 },
  quantityBadge: { backgroundColor: '#e8f5e9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18 },
  quantityText: { fontSize: 16, color: '#2e7d32', fontWeight: '800' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
});
