import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from '@navigation/AppNavigator';
import { useAuthStore } from '@store/authStore';
import { colors } from '@theme';

export default function App() {
  const { token } = useAuthStore();

  React.useEffect(() => {
    const init = async () => {
      try {
        const { apiService } = await import('@services/api');
        await apiService.initialize();
      } catch (e) {
        console.warn('apiService.initialize failed (non-fatal):', e);
      }
    };
    init();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});