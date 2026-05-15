import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';

import DateInput from '../components/DateInput';

export default function OrdersScreen({ route, navigation, orders = [], dataError = '' }) {
  const { storeId, storeName } = route.params ?? {};
  const [dateFilter, setDateFilter] = useState('');

  const storeOrders = useMemo(
    () => orders.filter(order => order.storeId === storeId),
    [orders, storeId]
  );

  const filteredOrders = useMemo(() => {
    const normalizedFilter = dateFilter.trim().toLowerCase();
    if (!normalizedFilter) return storeOrders;

    return storeOrders.filter(order => order.date.toLowerCase().includes(normalizedFilter));
  }, [dateFilter, storeOrders]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{storeName ?? 'Избран обект'}</Text>
      {dataError ? <Text style={styles.errorText}>{dataError}</Text> : null}

      <View style={styles.filterBox}>
        <DateInput
          style={styles.filterInput}
          placeholder="Филтър по дата"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
        {dateFilter ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
            onPress={() => setDateFilter('')}
          >
            <Text style={styles.clearButtonText}>Изчисти</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {dateFilter ? 'Няма поръчки за тази дата.' : 'Няма създадени поръчки.'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('OrderDetail', { order: item, storeName })}
          >
            <Text style={styles.text}>Дата: {item.date}</Text>
            <Text style={styles.hint}>Виж детайли</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  subtitle: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#2196f3',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  errorText: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 12,
    color: '#b91c1c',
    fontWeight: '700',
  },
  filterBox: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dce4ec',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: '#172033',
  },
  clearButton: {
    backgroundColor: '#eef6ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  clearButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#dbeafe',
  },
  clearButtonText: {
    color: '#005eb8',
    fontWeight: '800',
    fontSize: 14,
  },
  listContent: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: '#f8fbff',
  },
  text: { fontSize: 16, color: '#333', fontWeight: '600' },
  hint: { fontSize: 13, color: '#2196f3', fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
});
