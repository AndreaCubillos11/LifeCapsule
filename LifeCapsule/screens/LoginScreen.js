import React, { useState } from 'react';
import { Video } from 'expo-av';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
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
                    placeholder="Amb12@gmail.com"
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
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </TouchableOpacity>

                {/* Botón para redirigir a "Olvidé mi contraseña" */}
                <TouchableOpacity
                    style={styles.forgotButton}
                    onPress={() => navigation.navigate('ForgotPasswordScreen')}
                >
                    <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
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
        marginBottom: 40,
    },
    logo: {
        width: width * 0.65,
        height: width * 0.65,
        borderRadius: 20,     // opcional, para suavizar bordes
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
        backgroundColor: '#F9FAFF',
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
    forgotButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    forgotPassword: {
        color: '#2E7DFF',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});
