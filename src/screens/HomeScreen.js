import React from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';

const stores = Array.from({ length: 15 }, (_, index) => {
  const storeNumber = index + 1;

  return {
    id: storeNumber.toString(),
    name: `Ремедиум ${storeNumber}`,
  };
});

export default function HomeScreen({ navigation, onLogout, targetScreen = 'StoreDashboard' }) {
  const { width } = useWindowDimensions();
  const columnCount = width >= 720 ? 3 : 2;
  const listWidth = Math.min(width, 1180);
  const horizontalPadding = 24;
  const columnGap = 12;
  const cardWidth = (listWidth - horizontalPadding - columnGap * (columnCount - 1)) / columnCount;

  const renderItem = ({ item }) => (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && styles.cardPressed]}
      onPress={() => navigation.navigate(targetScreen, { storeId: item.id, storeName: item.name })}
    >
      <View style={styles.cardAccent} />
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>{item.name}</Text>
      </View>
      <View style={styles.cardAction}>
        <Text style={styles.cardActionText}>{'>'}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.toolbarInner}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            onPress={onLogout}
          >
            <Text style={styles.logoutText}>Изход</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        key={columnCount}
        data={stores}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={columnCount}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  listContent: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  toolbar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dce4ec',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  toolbarInner: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    alignItems: 'flex-end',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#fecaca',
  },
  logoutText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '800',
  },
  row: {
    gap: 12,
  },
  card: {
    minHeight: 116,
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dce4ec',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#f8fbff',
    borderColor: '#8ab8e6',
  },
  cardAccent: {
    height: 4,
    backgroundColor: '#005eb8',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 14,
  },
  cardText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172033',
  },
  cardAction: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef6ff',
  },
  cardActionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#005eb8',
  },
});
