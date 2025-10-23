import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from './screens/WelcomeScreen'; // Asegúrate de que la ruta sea correcta

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // oculta la barra superior
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        {/* Aquí luego puedes agregar más pantallas, por ejemplo:
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} /> 
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
