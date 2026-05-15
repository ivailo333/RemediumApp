import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminPanelScreen from './src/screens/AdminPanelScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import StoreDashboardScreen from './src/screens/StoreDashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import MarketingScreen from './src/screens/MarketingScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import {
  loadMarketingActivities,
  loadOrders,
  loadProducts,
} from './src/services/remediumData';

const Stack = createNativeStackNavigator();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [marketingActivities, setMarketingActivities] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    let isMounted = true;

    const loadData = async () => {
      setIsLoadingData(true);
      setDataError('');

      try {
        const [loadedProducts, loadedOrders, loadedMarketingActivities] = await Promise.all([
          loadProducts(),
          loadOrders(),
          loadMarketingActivities(),
        ]);

        if (!isMounted) return;

        setProducts(loadedProducts);
        setOrders(loadedOrders);
        setMarketingActivities(loadedMarketingActivities);
      } catch (error) {
        if (isMounted) {
          setDataError(error.message ?? 'Неуспешно зареждане на данни от Supabase.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    setDataError('');
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  if (isLoadingData) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f6f9' }}>
        <Text style={{ color: '#005eb8', fontWeight: '800', fontSize: 16 }}>Зареждане на данни...</Text>
      </View>
    );
  }

  const isAdmin = currentUser.role === 'administrator';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#005eb8' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" options={{ title: 'Обекти Ремедиум' }}>
          {props => (
            <HomeScreen
              {...props}
              targetScreen={isAdmin ? 'AdminPanel' : 'StoreDashboard'}
              onLogout={logout}
            />
          )}
        </Stack.Screen>

        {isAdmin ? (
          <Stack.Screen
            name="AdminPanel"
            options={({ route }) => ({ title: route.params?.storeName ?? 'Админ панел' })}
          >
            {props => (
              <AdminPanelScreen
                {...props}
                currentUser={currentUser}
                products={products}
                orders={orders}
                marketingActivities={marketingActivities}
                dataError={dataError}
                onProductsChange={setProducts}
                onOrdersChange={setOrders}
                onMarketingActivitiesChange={setMarketingActivities}
                onLogout={logout}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="StoreDashboard"
              component={StoreDashboardScreen}
              options={({ route }) => ({ title: route.params?.storeName ?? 'Обект' })}
            />
            <Stack.Screen
              name="Inventory"
              options={{ title: 'Наличности' }}
            >
              {props => <InventoryScreen {...props} products={products} dataError={dataError} />}
            </Stack.Screen>
            <Stack.Screen
              name="Orders"
              options={{ title: 'Поръчки' }}
            >
              {props => <OrdersScreen {...props} orders={orders} dataError={dataError} />}
            </Stack.Screen>
            <Stack.Screen
              name="Marketing"
              options={{ title: 'Маркетинг' }}
            >
              {props => (
                <MarketingScreen
                  {...props}
                  customCampaigns={marketingActivities}
                  dataError={dataError}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: 'Детайли за поръчка' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
