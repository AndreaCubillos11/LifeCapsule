import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // 🔹 Solo usamos esto para mostrar el indicador inicial (sin redirección automática)
    useEffect(() => {
        setInitializing(false);
    }, []);

    // 🔹 Validar formato de email
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // 🔹 Función de inicio de sesión con Firebase
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Campos incompletos', 'Por favor ingresa tu correo y contraseña.');
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert('Correo inválido', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        setIsLoading(true);
        try {
            // Iniciar sesión con Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Obtener el UID del usuario autenticado
            const uid = userCredential.user.uid;

            // Guardar UID en AsyncStorage
            await AsyncStorage.setItem('userUID', uid);
            // 👇 NO redirigimos aquí manualmente
            // El App.js se encarga de redirigir cuando el usuario está autenticado
        } catch (error) {
            let message = '';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'No existe ninguna cuenta con este correo electrónico.';
                    break;
                case 'auth/wrong-password':
                    message = 'Contraseña incorrecta.';
                    break;
                case 'auth/invalid-email':
                    message = 'Correo electrónico inválido.';
                    break;
                default:
                    message = 'Error al iniciar sesión. Intenta de nuevo.';
            }
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    if (initializing) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#2E7DFF" />
                <Text style={{ marginTop: 10, color: '#2E7DFF' }}>Verificando sesión...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <SafeAreaView style={styles.inner}>
                {/* Logo animado */}
                <View style={styles.header}>
                    <Video
                        source={require('../assets/inicioSesion1.mp4')}
                        style={styles.logo}
                        resizeMode="cover"
                        shouldPlay
                        isLooping
                        isMuted
                    />
                    <Text style={styles.title}>LifeCapsule</Text>
                </View>

                {/* Formulario de inicio de sesión */}
                <View style={styles.form}>
                    <Text style={styles.label}>Correo:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ejemplo@gmail.com"
                        placeholderTextColor="#A9A9A9"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Contraseña:</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            placeholder="********"
                            placeholderTextColor="#A9A9A9"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off' : 'eye'}
                                size={22}
                                color="#A9A9A9"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Botón de inicio de sesión */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>

                    {/* Botón para redirigir a "Olvidé mi contraseña" */}
                    <TouchableOpacity
                        style={styles.forgotButton}
                        onPress={() => navigation.navigate('ForgotPasswordScreen')}
                    >
                        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    {/* Registro */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                            <Text style={styles.signupLink}>Regístrate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inner: {
        alignItems: 'center',
        width: '90%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: width * 0.65,
        height: width * 0.65,
        borderRadius: 20,
        overflow: 'hidden',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginTop: 10,
    },
    form: {
        width: '100%',
    },
    label: {
        color: '#2E7DFF',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#FFF',
    },
    eyeIcon: {
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#2E7DFF',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    forgotButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    forgotPassword: {
        color: '#2E7DFF',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    signupText: {
        color: '#000',
    },
    signupLink: {
        color: '#2E7DFF',
        fontWeight: '600',
    },
});
