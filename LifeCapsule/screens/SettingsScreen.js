import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { auth } from "../services/firebaseconfig";
import { updateProfile, signOut } from "firebase/auth";

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [profileImage, setProfileImage] = useState(null);
    const [userName, setUserName] = useState("Usuario");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const animationRef = useRef(null);

    // 🔹 Obtener datos del usuario actual
    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserName(user.displayName || "Usuario");
            setProfileImage(user.photoURL || null);
        }
    }, []);

    // 🔹 Cambiar foto de perfil
    const handleChangePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Debes permitir acceso a la galería.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                const image = result.assets[0];
                const data = new FormData();
                data.append("file", {
                    uri: image.uri,
                    type: "image/jpeg",
                    name: "profile.jpg",
                });
                data.append("upload_preset", "AlmacenamientoSeguro");

                const cloudName = "dm4qsfx4v";
                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: "POST",
                    body: data,
                });

                const file = await res.json();

                if (file.secure_url) {
                    setProfileImage(file.secure_url);
                    const user = auth.currentUser;
                    if (user) {
                        await updateProfile(user, { photoURL: file.secure_url });
                    }
                    Alert.alert("Éxito", "Tu foto de perfil se actualizó correctamente.");
                } else {
                    Alert.alert("Error", "No se pudo obtener la URL de la imagen.");
                }
            }
        } catch (error) {
            console.error("Error al subir imagen:", error);
            Alert.alert("Error", "No se pudo subir la imagen.");
        }
    };

    // 🔹 Eliminar foto de perfil
    const handleRemovePhoto = async () => {
        try {
            setProfileImage(null);
            const user = auth.currentUser;
            if (user) {
                await updateProfile(user, { photoURL: null });
            }
            Alert.alert("Listo", "Se eliminó tu foto de perfil.");
        } catch (error) {
            Alert.alert("Error", "No se pudo eliminar la foto.");
        }
    };

    // 🔹 Cerrar sesión
    const handleLogout = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que quieres salir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, salir",
                    onPress: async () => {
                        try {
                            setIsLoggingOut(true);
                            animationRef.current?.play();

                            // Esperamos que se reproduzca la animación
                            await new Promise((resolve) => setTimeout(resolve, 2500));
                            setIsLoggingOut(false);

                            await signOut(auth); // 🔹 Esto hace que App.js cambie automáticamente al stack público
                        } catch (error) {
                            console.error("Error al cerrar sesión:", error);
                            Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Animación de logout */}
            {isLoggingOut && (
                <View style={styles.animationOverlay}>
                    <LottieView
                        ref={animationRef}
                        source={require("../assets/Log out.json")}
                        autoPlay
                        loop={false}
                        style={{ width: 200, height: 200 }}
                    />
                </View>
            )}

            {/* ===== Encabezado ===== */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajustes</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ===== Perfil ===== */}
                <View style={styles.profileContainer}>
                    <TouchableOpacity onPress={handleChangePhoto}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <Ionicons name="person-circle-outline" size={130} color="#3D5AFE" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.profileName}>{userName}</Text>

                    {profileImage && (
                        <TouchableOpacity onPress={handleRemovePhoto} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>Eliminar foto</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ===== Opciones principales ===== */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="key-outline" size={22} color="#F4B400" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Cuenta</Text>
                            <Text style={styles.optionSubtitle}>
                                Información personal y seguridad.
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="notifications-outline" size={22} color="#3D5AFE" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Notificaciones</Text>
                            <Text style={styles.optionSubtitle}>Administra tus alertas.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="color-palette-outline" size={22} color="#7E57C2" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Personalización</Text>
                            <Text style={styles.optionSubtitle}>Tema, idioma y accesibilidad.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.option}>
                        <Ionicons name="lock-closed-outline" size={22} color="#000" />
                        <View style={styles.optionText}>
                            <Text style={styles.optionTitle}>Privacidad y seguridad</Text>
                            <Text style={styles.optionSubtitle}>Verificación y permisos.</Text>
                        </View>
                    </TouchableOpacity>

                    {/* ===== Cerrar sesión ===== */}
                    <TouchableOpacity
                        style={[styles.option, styles.logoutOption]}
                        onPress={handleLogout}
                    >
                        <Ionicons name="exit-outline" size={22} color="#E53935" />
                        <View style={styles.optionText}>
                            <Text style={[styles.optionTitle, { color: "#E53935" }]}>
                                Cerrar sesión
                            </Text>
                            <Text style={styles.optionSubtitle}>
                                Salir de tu cuenta de manera segura.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ===== Ayuda y soporte ===== */}
                <View style={styles.helpSection}>
                    <Text style={styles.helpTitle}>Ayuda y soporte</Text>

                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="help-circle-outline" size={20} color="#3D5AFE" />
                        <Text style={styles.helpText}>Preguntas frecuentes (FAQ)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="document-text-outline" size={20} color="#3D5AFE" />
                        <Text style={styles.helpText}>Política de privacidad</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="mail-outline" size={20} color="#3D5AFE" />
                        <Text style={styles.helpText}>Contáctanos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.helpItem}>
                        <Ionicons name="information-circle-outline" size={20} color="#3D5AFE" />
                        <Text style={styles.helpText}>Acerca de LifeCapsule</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

// ===== Estilos =====
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },
    animationOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 60,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        fontStyle: "italic",
        marginLeft: 10,
    },
    profileContainer: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 20,
    },
    profileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: "#3D5AFE",
    },
    profileName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        fontStyle: "italic",
    },
    removeButton: {
        marginTop: 8,
        backgroundColor: "#EEE",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    removeButtonText: {
        color: "#3D5AFE",
        fontWeight: "600",
    },
    optionsContainer: {
        marginTop: 10,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12,
        backgroundColor: "#F8F8FF",
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    optionText: {
        marginLeft: 10,
        flex: 1,
    },
    optionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#3D5AFE",
    },
    optionSubtitle: {
        color: "#555",
        fontSize: 13,
    },
    logoutOption: {
        backgroundColor: "#FFF0F0",
    },
    helpSection: {
        marginTop: 30,
        paddingBottom: 60,
    },
    helpTitle: {
        color: "#3D5AFE",
        fontSize: 18,
        fontWeight: "700",
        fontStyle: "italic",
        marginBottom: 10,
    },
    helpItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    helpText: {
        color: "#333",
        fontSize: 14,
        marginLeft: 8,
    },
});
