import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

export default function MarketingScreen({ route, customCampaigns = [], dataError = '' }) {
  const { storeId, storeName } = route.params ?? {};
  const userCampaigns = customCampaigns
    .filter(activity => activity.storeId === storeId)
    .map(activity => ({
      ...activity,
      images: activity.images?.length ? activity.images : activity.image ? [activity.image] : [],
      period: activity.period ?? 'Въведена активност',
    }));

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{storeName ?? 'Избран обект'}</Text>
      {dataError ? <Text style={styles.errorText}>{dataError}</Text> : null}
      <FlatList
        data={userCampaigns}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Няма въведени маркетингови активности.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.images.length ? (
              <View style={styles.imageGrid}>
                {item.images.map((image, index) => (
                  <Image
                    key={`${image}-${index}`}
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : null}
            <View style={styles.cardBody}>
              <Text style={styles.campaignTitle}>{item.title}</Text>
              <Text style={styles.period}>Период: {item.period}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
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
    color: '#e91e63',
    backgroundColor: '#fff',
  },
  errorText: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 12,
    color: '#b91c1c',
    fontWeight: '700',
  },
  listContent: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  image: {
    flexGrow: 1,
    width: 150,
    minWidth: 130,
    height: 140,
    borderRadius: 9,
    backgroundColor: '#e2e8f0',
  },
  cardBody: {
    padding: 16,
  },
  campaignTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  period: { fontSize: 15, color: '#e91e63', fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 15, color: '#555', lineHeight: 21 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' },
});
