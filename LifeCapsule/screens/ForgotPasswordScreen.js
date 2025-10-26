import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Dimensions, 
    ActivityIndicator, 
    Alert 
} from 'react-native';
import { Video } from 'expo-av';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebaseconfig'; // usar el auth ya inicializado

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ===== Validar formato de correo =====
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setEmailError('El correo electrónico es obligatorio');
            return false;
        } else if (!emailRegex.test(email)) {
            setEmailError('Introduce un correo electrónico válido');
            return false;
        }
        setEmailError('');
        return true;
    };

    // ===== Enviar correo de restablecimiento =====
    const handleResetPassword = async () => {
        if (!validateEmail(email)) return;

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);

            // Mostrar alerta y volver al LoginScreen correctamente nombrado
            Alert.alert(
                'Correo enviado',
                'Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('LoginScreen'), // <-- CORRECCIÓN
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.log('Error sendPasswordResetEmail:', error);

            // Mensajes más amigables según el código de error
            let message = 'Ocurrió un error al enviar el correo. Intenta nuevamente.';
            if (error.code) {
                switch (error.code) {
                    case 'auth/user-not-found':
                        message = 'No existe ninguna cuenta con este correo electrónico.';
                        break;
                    case 'auth/invalid-email':
                        message = 'El correo electrónico es inválido.';
                        break;
                    case 'auth/missing-email':
                        message = 'Por favor ingresa un correo electrónico.';
                        break;
                    case 'auth/too-many-requests':
                        message = 'Demasiados intentos. Intenta nuevamente más tarde.';
                        break;
                    default:
                        // si el mensaje original es descriptivo, úsalo
                        if (error.message) message = error.message;
                }
            }
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

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
                    style={[styles.input, emailError ? styles.inputError : null]}
                    placeholder="Amb12@gmail.com"
                    placeholderTextColor="#A9A9A9"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (emailError) validateEmail(text);
                    }}
                />
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.sendButton, isLoading && styles.buttonDisabled]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.buttonText}>Enviar código</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ====== Estilos ======
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
        marginBottom: 10,
    },
    inputError: {
        borderColor: '#E53935',
    },
    errorText: {
        color: '#E53935',
        fontSize: 13,
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
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
    buttonDisabled: {
        opacity: 0.7,
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
