import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    ActivityIndicator,
    Modal
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseconfig';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation, stopAuthListener, startAuthListener }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isStrongPassword = (password) => {
        const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
        return strongPasswordRegex.test(password);
    };

    const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
        Alert.alert('Campos incompletos', 'Por favor llena todos los campos.');
        return;
    }

    if (password !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
    }

    if (!isStrongPassword(password)) {
        Alert.alert(
            'Contraseña débil',
            'Tu contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, una minúscula, un número y un símbolo.'
        );
        return;
    }

    try {
        if (stopAuthListener) stopAuthListener();
        setIsLoading(true); //Muestra la animación inmediatamente

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            createdAt: new Date(),
        });

        //Pequeña pausa visual antes de mostrar el alert
        setTimeout(() => {
            setIsLoading(false); // Oculta la animación justo antes del alert

            Alert.alert(
                'Registro exitoso',
                '¡Tu cuenta ha sido creada correctamente!',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            try {
                                await signOut(auth);
                                if (startAuthListener) startAuthListener();
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'LoginScreen' }],
                                });
                            } catch (signOutError) {
                                console.log('Error cerrando sesión después del registro:', signOutError);
                                Alert.alert(
                                    'Error',
                                    'No se pudo cerrar la sesión automáticamente. Intenta iniciar sesión manualmente.'
                                );
                            }
                        },
                    },
                ],
                { cancelable: false }
            );
        }, 1000); // 1 segundo para que la animación se vea bien
    } catch (error) {
        console.log('Error en registro:', error.message);
        setIsLoading(false);
        if (startAuthListener) startAuthListener();

        let message = '';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'El correo electrónico ya está en uso.';
                break;
            case 'auth/invalid-email':
                message = 'El correo electrónico no es válido.';
                break;
            case 'auth/weak-password':
                message = 'La contraseña es demasiado débil.';
                break;
            default:
                message = 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
        Alert.alert('Error', message);
    }
};

    return (
        <SafeAreaView style={styles.container}>
            {/* Modal con animación Lottie mientras carga */}
            <Modal visible={isLoading} transparent animationType="fade">
                <View style={styles.loadingOverlay}>
                    <LottieView
                        source={require('../assets/register.json')}
                        autoPlay
                        loop
                        style={{ width: 150, height: 150 }}
                    />
                    <Text style={styles.loadingText}>Creando tu cuenta...</Text>
                </View>
            </Modal>

            {/* Video animado */}
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

            {/* Formulario de registro */}
            <View style={styles.form}>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Mateo"
                    placeholderTextColor="#A9A9A9"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Correo:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="mat24@gmail.com"
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

                <Text style={styles.label}>Confirmar Contraseña:</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="********"
                        placeholderTextColor="#A9A9A9"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={22}
                            color="#A9A9A9"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginRedirect}
                    onPress={() => navigation.navigate('LoginScreen')}
                >
                    <Text style={styles.loginText}>Ya tengo cuenta</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFF',
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
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
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    loginRedirect: {
        marginTop: 15,
        alignItems: 'center',
    },
    loginText: {
        color: '#2E7DFF',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    loadingOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        marginTop: 10,
        fontWeight: '600',
    },
});
