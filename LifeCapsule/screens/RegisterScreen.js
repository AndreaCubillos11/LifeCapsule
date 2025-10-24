import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            {/* Video animado */}
            <View style={styles.header}>
                <Video
                    source={require('../assets/inicioSesion1.mp4')} // cambia la ruta si tu video tiene otro nombre
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
                    placeholder="Mat24@gmail.com"
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

                {/* Botón de registro */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => console.log('Registrarse')}
                >
                    <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>

                {/* Link para ir al inicio de sesión */}
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
});
