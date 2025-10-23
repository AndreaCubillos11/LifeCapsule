import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <Image source={require('../assets/ImagenWelcome.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.text}>
                Los recuerdos{'\n'}
                que guardas hoy,{'\n'}
                serán el regalo de{'\n'}
                mañana
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.buttonText}>Iniciar sesión</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        marginBottom: 30,
    },
    text: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
    },
    button: {
        backgroundColor: '#2E7DFF',
        paddingVertical: 14,
        borderRadius: 10,
        marginVertical: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
});
