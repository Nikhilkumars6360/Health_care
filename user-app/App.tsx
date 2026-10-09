import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './src/context/AuthContext';
import { AuthStack } from './src/navigation/AuthStack';
import { MainTabs } from './src/navigation/MainTabs';
import { ThemeProvider } from './src/context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const { user, loading } = useAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={ThemeProvider.theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {loading ? (
                <Stack.Screen name="Loading" component={LoadingScreen} />
              ) : user ? (
                <Stack.Screen name="Main" component={MainTabs} />
              ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

function LoadingScreen() {
  return (
    <PaperProvider theme={ThemeProvider.theme}>
      <SafeAreaProvider>
        <React.Fragment>
          <StatusBar style="auto" />
        </React.Fragment>
      </SafeAreaProvider>
    </PaperProvider>
  );
}