import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WoodenFishApp from './screens/WoodenFishApp';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <WoodenFishApp />
    </SafeAreaProvider>
  );
};

export default App;
