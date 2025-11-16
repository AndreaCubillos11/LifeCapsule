import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    Dimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { db } from "../services/firebaseconfig";
import { collection, doc, setDoc, serverTimestamp, GeoPoint } from "firebase/firestore";
import * as LocalAuthentication from "expo-local-authentication";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { crearTipoDesbloqueo } from "../services/Tipo_Desbloqueo";

const { width, height } = Dimensions.get('window');


export default function NuevaCapsulaScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fecha, setFecha] = useState(new Date());
    const [mostrarFecha, setMostrarFecha] = useState(false);
    const [tipoCapsula, setTipoCapsula] = useState("Para mí");
    const [multimedia, setMultimedia] = useState([]);
    const [texto, setTexto] = useState("");
    const [tipoDesbloqueo, setTipoDesbloqueo] = useState("");
    const [pin, setPin] = useState("");
    const [hashHuella, setHashHuella] = useState(null);
    const [faceEmbedding, setFaceEmbedding] = useState(null);
    const [audio, setAudio] = useState(null);
    const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
    const [latitud, setLatitud] = useState("");
    const [longitud, setLongitud] = useState("");


    // Guardar texto localmente
    const handleGuardarTexto = async () => {
        if (!texto.trim()) {
            Alert.alert("Error", "El texto está vacío.");
            return;
        }
        await AsyncStorage.setItem("textoCapsula", texto);
        Alert.alert("Guardado", "Texto almacenado localmente.");
    };

    const onChangeFecha = (event, selectedDate) => {
        const currentDate = selectedDate || fecha;
        setMostrarFecha(Platform.OS === "ios");
        setFecha(currentDate);
    };

    // Subir multimedia
    const handleUploadMedia = async (tipo) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Debes permitir acceso a la galería.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes:
                    tipo === "foto"
                        ? ImagePicker.MediaTypeOptions.Images
                        : ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const file = result.assets[0];
                const data = new FormData();
                data.append("file", {
                    uri: file.uri,
                    type: tipo === "foto" ? "image/jpeg" : "video/mp4",
                    name: tipo === "foto" ? "foto.jpg" : "video.mp4",
                });
                data.append("upload_preset", "AlmacenamientoSeguro");

                const cloudName = "dm4qsfx4v";
                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                    { method: "POST", body: data }
                );

                const uploaded = await res.json();
                if (uploaded.secure_url) {
                    setMultimedia((prev) => [...prev, uploaded.secure_url]);
                    Alert.alert("Éxito", "Archivo subido correctamente.");
                }
            }
        } catch (error) {
            console.error("Error al subir:", error);
            Alert.alert("Error", "No se pudo subir el archivo.");
        }
    };

    // Seleccionar audio
    const handleSeleccionarAudio = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });
        if (result.assets && result.assets.length > 0) {
            const selected = result.assets[0];
            setAudio(selected.uri);
            await AsyncStorage.setItem("audioCapsula", selected.uri);
            Alert.alert("Guardado", "Audio almacenado localmente.");
        }
    };

    const obtenerHashHuella = async (capsulaId, guardar = true) => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            if (!compatible) {
                Alert.alert("Error", "Tu dispositivo no soporta autenticación biométrica.");
                return null;
            }

            const tieneBiometria = await LocalAuthentication.isEnrolledAsync();
            if (!tieneBiometria) {
                Alert.alert("Error", "No tienes huellas registradas en el dispositivo.");
                return null;
            }

            // Solicita la validación de huella
            const resultado = await LocalAuthentication.authenticateAsync({
                promptMessage: "Valida tu huella",
                fallbackLabel: "Usar PIN",
            });

            if (resultado.success) {
                const userUID = await AsyncStorage.getItem("userUID");
                const data = `${capsulaId}-${userUID}`;
                const hash = await Crypto.digestStringAsync(
                    Crypto.CryptoDigestAlgorithm.SHA256,
                    data
                );

                const key = `capsula_${capsulaId}_hash`;

                if (guardar) {
                    // Guardar el hash en almacenamiento seguro (solo accesible con huella)
                    await SecureStore.setItemAsync(key, hash, {
                        requireAuthentication: true,
                    });
                    Alert.alert("Éxito", "Huella registrada para desbloquear la cápsula.");
                }

                return hash;
            } else {
                Alert.alert("Error", "Autenticación fallida.");
                return null;
            }
        } catch (error) {
            console.error("Error al obtener huella:", error);
            Alert.alert("Error", "No se pudo autenticar la huella.");
            return null;
        }
    };

    // Guardar cápsula
    const handleGuardarCapsula = async () => {
        try {
            const uid = await AsyncStorage.getItem("userUID");
            if (!uid) return Alert.alert("Error", "No se encontró el usuario.");
            if (!tipoDesbloqueo) return Alert.alert("Error", "Debes seleccionar un tipo de desbloqueo.");
            if (tipoDesbloqueo === "Pin" && !pin) return Alert.alert("Error", "Debes ingresar un PIN.");
            if (tipoDesbloqueo === "Ubicación" && !ubicacionSeleccionada)
                return Alert.alert("Error", "Debes seleccionar tu ubicación.");

            setIsLoading(true);

            // 🔹 Preparar la información del requisito según el tipo de desbloqueo
            let requisitoDesbloqueo = {};
            if (tipoDesbloqueo === "Pin") {
                requisitoDesbloqueo = { pin };
            } else if (tipoDesbloqueo === "Huella") {
                requisitoDesbloqueo = { hashHuella };
            } else if (tipoDesbloqueo === "Rostro") {
                requisitoDesbloqueo = { faceEmbedding };
            } else if (tipoDesbloqueo === "Ubicación") {
                requisitoDesbloqueo = { coords: ubicacionSeleccionada };
            }
            const idTipoDesbloqueo = await crearTipoDesbloqueo(
                tipoDesbloqueo, // Ej: "Huella"
                {
                    requisitoDesbloqueo,
                    fecha_creacion: serverTimestamp(),
                }
            );

            // 🔹 Guardar ubicación como GeoPoint (para registrar dónde se creó la cápsula)
            let geoPoint = null;
            if (ubicacionSeleccionada) {
                geoPoint = new GeoPoint(
                    ubicacionSeleccionada.latitude,
                    ubicacionSeleccionada.longitude
                );
            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    Alert.alert("Permiso de ubicación denegado", "No se pudo acceder a la ubicación actual.");
                    setIsLoading(false);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                geoPoint = new GeoPoint(location.coords.latitude, location.coords.longitude);
            }
            const nuevaCapsula = {
                titulo,
                tipo_capsula: tipoCapsula,
                id_usuario: uid,
                id_tipoDesbloqueo: idTipoDesbloqueo, // ✅ ahora tiene un valor válido
                isFavorite: false,
                ubicación_creacion: geoPoint,
                descripción: descripcion,
                Multimedia: multimedia,
                Fecha_Apertura: fecha,
                Fecha_Creacion: serverTimestamp(),
            };

            const docRef = doc(collection(db, "Capsulas"));
            await setDoc(docRef, nuevaCapsula);

            // 🔹 Reset estado
            setTitulo("");
            setDescripcion("");
            setMultimedia([]);
            setTexto("");
            setPin("");
            setTipoDesbloqueo("");
            setUbicacionSeleccionada(null);
            setIsLoading(false);

            Alert.alert("Éxito", "Cápsula guardada correctamente.");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo guardar la cápsula.");
            setIsLoading(false);
        }
    };

    // Pedir ubicación actual
    const seleccionarUbicacion = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return Alert.alert("Permiso de ubicación denegado.");

        const location = await Location.getCurrentPositionAsync({});
        setUbicacionSeleccionada(location.coords);
        Alert.alert(
            "Ubicación seleccionada",
            `Lat: ${location.coords.latitude}, Lon: ${location.coords.longitude}`
        );
    };

    const guardarUbicacion = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "No se pudo acceder a la ubicación.");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUbicacionSeleccionada(location.coords);
            Alert.alert(
                "Ubicación guardada",
                `Latitud: ${location.coords.latitude}, Longitud: ${location.coords.longitude}`
            );
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo obtener la ubicación.");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Nueva Cápsula</Text>

                <Text style={styles.label}>Contenido:</Text>
                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleGuardarTexto}>
                        <MaterialIcons name="text-fields" size={28} color="#4169E1" />
                        <Text style={styles.iconText}>Texto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleUploadMedia("foto")}>
                        <Ionicons name="image" size={28} color="#4169E1" />
                        <Text style={styles.iconText}>Foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleUploadMedia("video")}>
                        <Ionicons name="videocam" size={28} color="#4169E1" />
                        <Text style={styles.iconText}>Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleSeleccionarAudio}>
                        <FontAwesome5 name="microphone" size={26} color="#4169E1" />
                        <Text style={styles.iconText}>Sonido</Text>
                    </TouchableOpacity>
                </View>

                {multimedia.map((item, index) =>
                    item.includes("video") ? (
                        <Video key={index} source={{ uri: item }} style={{ width: "100%", height: 200, marginBottom: 10 }} useNativeControls resizeMode="contain" />
                    ) : (
                        <Image key={index} source={{ uri: item }} style={{ width: "100%", height: 200, marginBottom: 10 }} resizeMode="cover" />
                    )
                )}

                <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
                <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción (Opcional)" value={descripcion} onChangeText={setDescripcion} multiline />
                <TextInput style={[styles.input, styles.textArea]} placeholder="Escribe tu texto aquí..." value={texto} onChangeText={setTexto} multiline />

                <Text style={styles.label}>Fecha de Apertura</Text>
                <TouchableOpacity onPress={() => setMostrarFecha(true)} style={styles.dateButton}>
                    <Text style={styles.dateText}>{fecha.toLocaleDateString("es-ES")}</Text>
                    <Ionicons name="calendar" size={22} color="#000" />
                </TouchableOpacity>
                {mostrarFecha && <DateTimePicker value={fecha} mode="date" display="default" onChange={onChangeFecha} />}

                <Text style={styles.label}>Tipo de Cápsula</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={tipoCapsula} onValueChange={setTipoCapsula}>
                        <Picker.Item label="Para mí" value="Para mí" />
                        <Picker.Item label="Para alguien" value="Para alguien" />
                    </Picker>
                </View>

                <Text style={styles.label}>Tipo de Desbloqueo:</Text>
                <View style={styles.unlockRow}>
                    {["Pin", "Huella", "Rostro", "Ubicación"].map((t, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.unlockButton, tipoDesbloqueo === t && { backgroundColor: "#1E90FF" }]}
                            onPress={async () => {
                                setTipoDesbloqueo(t);
                                if (t === "Huella") {
                                    const hash = await obtenerHashHuella();
                                    if (hash) setHashHuella(hash);
                                    else setTipoDesbloqueo("");
                                }
                                if (t === "Rostro") {

                                    console.log("Rostro no implementado aún");
                                    Alert.alert("No implementado reconocimiento facial")

                                }

                                if (t === "Ubicación");
                            }}
                        >
                            <Text style={styles.unlockText}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {tipoDesbloqueo === "Pin" && (
                    <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Ingresa tu PIN" value={pin} onChangeText={setPin} keyboardType="numeric" secureTextEntry maxLength={6} />
                )}

                {tipoDesbloqueo === "Ubicación" && (
                    <View style={styles.container}>
                        <Text style={styles.label}>Latitud:</Text>
                        <TextInput
                            style={styles.input}
                            value={latitud}
                            onChangeText={setLatitud}
                            placeholder="Ejemplo: 4.6097"
                            keyboardType="numeric"
                        />

                        <Text style={styles.label}>Longitud:</Text>
                        <TextInput
                            style={styles.input}
                            value={longitud}
                            onChangeText={setLongitud}
                            placeholder="Ejemplo: -74.0817"
                            keyboardType="numeric"
                        />

                        <TouchableOpacity style={styles.button} onPress={seleccionarUbicacion}>
                            <Text style={styles.buttonText}>Usar mi ubicación actual</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonGuardar} onPress={guardarUbicacion}>
                            <Text style={styles.buttonText}>Guardar ubicación</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleGuardarCapsula}>
                    <Text style={styles.saveText}>Guardar Cápsula</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// Estilos
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" },
    container: {
        paddingHorizontal: width * 0.05,
        paddingTop: height * 0.02,
        paddingBottom: height * 0.05,
    },
    title: {
        fontSize: width * 0.07,
        fontWeight: "bold",
        color: "#000",
        marginBottom: height * 0.02,
    },
    label: {
        fontSize: width * 0.045,
        fontWeight: "500",
        color: "#000",
        marginBottom: 8,
        marginTop: height * 0.02,
    },
    iconRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: height * 0.03,
    },
    iconButton: { alignItems: "center", flex: 1 },
    iconText: { marginTop: 5, fontSize: width * 0.035, color: "#000" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        padding: width * 0.035,
        fontSize: width * 0.04,
        marginBottom: height * 0.015,
    },
    textArea: { height: height * 0.15, textAlignVertical: "top" },
    dateButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        padding: width * 0.035,
    },
    dateText: { fontSize: width * 0.04, color: "#000" },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        overflow: "hidden",
    },
    unlockRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: height * 0.02,
    },
    unlockButton: {
        backgroundColor: "#4169E1",
        borderRadius: 10,
        paddingVertical: height * 0.012,
        paddingHorizontal: width * 0.05,
    },
    unlockText: { color: "#fff", fontSize: width * 0.04 },
    saveButton: {
        backgroundColor: "#000",
        borderRadius: 10,
        paddingVertical: height * 0.018,
        alignItems: "center",
        marginTop: height * 0.02,
    },
    saveText: { color: "#fff", fontSize: width * 0.045, fontWeight: "bold" },
    saveButton: { backgroundColor: "#4169E1", padding: 15, borderRadius: 8, alignItems: "center", marginVertical: 20 },
});

