import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';


const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const videoRef = useRef(null);

    useEffect(() => {
        videoRef.current?.playAsync();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Video
                ref={videoRef}
                source={require('../assets/animacionWelcome.mp4')} 
                style={styles.video}
                resizeMode="cover"
                isLooping
                isMuted 
            />

            <Text style={styles.text}>
                Los recuerdos{'\n'}
                que guardas hoy,{'\n'}
                serán el regalo de{'\n'}
                mañana
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RegisterScreen')}>
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
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
        backgroundColor: '#F9FAFF',
    },
    video: {
        width: width * 0.7,
        height: width * 0.7,
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
