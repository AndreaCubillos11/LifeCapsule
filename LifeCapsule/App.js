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

const Stack = createStackNavigator();

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const listenerRef = useRef(null); //Referencia para controlar el listener

    const startAuthListener = () => {
        if (listenerRef.current) return; 
        listenerRef.current = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
    };

    const stopAuthListener = () => {
        if (listenerRef.current) {
            listenerRef.current(); // ejecuta unsubscribe
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
                        <Stack.Screen name='RecommendationsScreen' component={RecommendationsScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                        <Stack.Screen name="LoginScreen" component={LoginScreen} />
                        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
                        {/*Pasamos control de listener a RegisterScreen */}
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
