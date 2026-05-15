import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput } from 'react-native';

export default function InventoryScreen({ route, products = [], dataError = '' }) {
  const { storeId, storeName } = route.params ?? {};
  const [searchQuery, setSearchQuery] = useState('');

  const storeProducts = useMemo(
    () => products.filter(product => product.storeId === storeId),
    [products, storeId]
  );

  const stockDate = useMemo(() => {
    const dates = storeProducts.map(product => product.date).filter(Boolean);
    return dates[0] ?? '';
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedText = searchQuery.trim().toLowerCase();
    if (!normalizedText) return storeProducts;

    return storeProducts.filter(item => item.name.toLowerCase().includes(normalizedText));
  }, [searchQuery, storeProducts]);

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
      </View>
      <View style={[styles.quantityBadge, item.quantity === 0 && styles.emptyQuantityBadge]}>
        <Text style={[styles.quantityText, item.quantity === 0 ? styles.outOfStock : null]}>
          {item.quantity} бр.
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {storeName ? (
        <View style={styles.storeContext}>
          <Text style={styles.storeContextTitle}>{storeName}</Text>
          {stockDate ? <Text style={styles.storeContextDate}>Дата: {stockDate}</Text> : null}
        </View>
      ) : null}
      {dataError ? <Text style={styles.errorText}>{dataError}</Text> : null}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Търсене по име"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Няма намерени продукти.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  storeContext: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  storeContextTitle: {
    color: '#005eb8',
    fontSize: 15,
    fontWeight: '700',
  },
  storeContextDate: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
  },
  errorText: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 12,
    color: '#b91c1c',
    fontWeight: '700',
  },
  searchContainer: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    backgroundColor: '#f0f4f8',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dce4ec',
  },
  listContent: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 15,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productInfo: {
    flex: 1,
    paddingRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#172033',
  },
  quantityBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 20,
  },
  emptyQuantityBadge: {
    backgroundColor: '#fee2e2',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2e7d32',
  },
  outOfStock: {
    color: '#d32f2f',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});
