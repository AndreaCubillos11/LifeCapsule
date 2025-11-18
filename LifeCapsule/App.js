import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseconfig';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegisterScreen from './screens/RegisterScreen';
import SettingsScreen from './screens/SettingsScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import CapsuleViewScreen from './screens/CapsuleViewScreen';

import NuevaCapsulaScreen from './screens/NuevaCapsulaScreen';
import FavoritasScreen from './screens/FavoritesScreen';
import EventosScreen from './screens/EventosScreen';

const Stack = createStackNavigator();

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const listenerRef = useRef(null); // Guarda el unsubscribe

    const startAuthListener = () => {
        if (listenerRef.current) return; // Evita listeners múltiples

        listenerRef.current = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
    };

    const stopAuthListener = () => {
        if (listenerRef.current) {
            listenerRef.current(); // ejecuta el unsubscribe
            listenerRef.current = null;
        }
    };

    useEffect(() => {
        startAuthListener();
        return () => stopAuthListener();
    }, []);

    if (loading) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="HomeScreen" component={HomeScreen} />
                        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                        <Stack.Screen name="Nueva" component={NuevaCapsulaScreen} />
                        <Stack.Screen name="Favoritas" component={FavoritasScreen} />
                        <Stack.Screen name="Eventos" component={EventosScreen} />
                        <Stack.Screen name="RecommendationsScreen" component={RecommendationsScreen} />
                        <Stack.Screen name="CapsuleViewScreen" component={CapsuleViewScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                        <Stack.Screen name="LoginScreen" component={LoginScreen} />
                        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                        
                        {/* Pasamos funciones a RegisterScreen */}
                        <Stack.Screen name="RegisterScreen">
                            {(props) => (
                                <RegisterScreen
                                    {...props}
                                    stopAuthListener={stopAuthListener}
                                    startAuthListener={startAuthListener}
                                />
                            )}
                        </Stack.Screen>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
