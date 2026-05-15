import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';

export default function StoreDashboardScreen({ route, navigation }) {
  const { storeId, storeName } = route.params ?? {};

  const menuItems = [
    {
      id: '1',
      title: 'Наличности',
      description: 'Продукти, количества и търсене',
      screen: 'Inventory',
      color: '#16a34a',
      badge: 'INV',
    },
    {
      id: '2',
      title: 'Поръчки',
      description: 'Последни заявки и детайли',
      screen: 'Orders',
      color: '#2563eb',
      badge: 'ORD',
    },
    {
      id: '3',
      title: 'Маркетингови активности',
      description: 'Кампании и промоционални зони',
      screen: 'Marketing',
      color: '#db2777',
      badge: 'MKT',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.storeTitle}>{storeName ?? 'Избран обект'}</Text>
          <Text style={styles.subtitle}>Изберете секция за преглед</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.menuButton,
                { borderLeftColor: item.color },
                pressed && styles.menuButtonPressed,
              ]}
              onPress={() => navigation.navigate(item.screen, { storeId, storeName })}
            >
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={styles.menuButtonText}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <View style={styles.actionCircle}>
                <Text style={[styles.actionText, { color: item.color }]}>{'>'}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6f9',
  },
  content: {
    paddingBottom: 20,
  },
  inner: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e6edf4',
  },
  storeTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#005eb8',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 5,
  },
  menuGrid: {
    padding: 15,
    gap: 12,
  },
  menuButton: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderLeftWidth: 6,
    borderWidth: 1,
    borderColor: '#dce4ec',
  },
  menuButtonPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: '#f8fbff',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  menuTextBlock: {
    flex: 1,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#172033',
  },
  menuDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  actionCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    marginLeft: 12,
  },
  actionText: {
    fontSize: 17,
    fontWeight: '900',
  },
});
