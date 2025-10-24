import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');

    return (
        <View style={styles.container}>
            <Video
                source={require('../assets/inicioSesion1.mp4')}
                style={styles.logo}
                resizeMode="cover"
                shouldPlay
                isLooping
                isMuted
            />

            <Text style={styles.appTitle}>LifeCapsule</Text>


            <Text style={styles.title}>Olvidé mi Contraseña</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Correo:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Amb12@gmail.com"
                    placeholderTextColor="#A9A9A9"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.goBack()}>
                        <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.sendButton]}>
                        <Text style={styles.buttonText}>Enviar código</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFF',
        justifyContent: 'flex-start', 
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: height * 0.12, 
    },
    logo: {
        width: width * 0.45,
        height: width * 0.45,
        marginBottom: 10,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2E7DFF',
        marginBottom: 25,
    },
    form: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    label: {
        color: '#2E7DFF',
        fontWeight: '600',
        fontSize: 16,
        alignSelf: 'flex-start',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
        width: '100%',
        marginBottom: 25,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#D3D3D3',
    },
    sendButton: {
        backgroundColor: '#2E7DFF',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cancelText: {
        color: '#000000',
    },
});
