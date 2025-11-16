import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Alert,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { obtenerCapsulasFavoritasPorUsuario, actualizarEstadoFavorita } from "../services/capsuleService"; // tu servicio

// 📏 Dimensiones de la pantalla (para diseño responsivo)
const { width, height } = Dimensions.get("window");

export default function FavoritasScreen({ navigation }) {
    const [capsulas, setCapsulas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarCapsulas = async () => {
            try {
                const uid = await AsyncStorage.getItem("userUID");
                if (!uid) {
                    console.warn("No hay UID del usuario guardado");
                    setLoading(false);
                    return;
                }

                // 🔹 Llamada al servicio para obtener las cápsulas del usuario logueado
                const data = await obtenerCapsulasFavoritasPorUsuario(uid);
                setCapsulas(data);
            } catch (error) {
                console.error("Error al cargar cápsulas:", error);
            } finally {
                setLoading(false);
            }
        };

        cargarCapsulas();
    }, []);

    // 🔹 Eliminar de favoritos
    const handleEliminarFavorito = async (idCapsula) => {
        try {
            await actualizarEstadoFavorita(idCapsula, false); // cambia isFavorite a false
            // 🔹 Elimina del estado local
            setCapsulas((prev) => prev.filter((capsula) => capsula.id !== idCapsula));
            Alert.alert("Eliminada", "La cápsula se ha eliminado de tus favoritas.");
        } catch (error) {
            console.error("Error al eliminar de favoritos:", error);
            Alert.alert("Error", "No se pudo eliminar la cápsula de favoritos.");
        }
    };


    const renderCapsula = ({ item }) => (
        <View style={[styles.card, { padding: width * 0.04 }]}>
            <View style={[styles.iconContainer, { padding: width * 0.025 }]}>
                <Ionicons
                    name={item.icono || "document-text-outline"}
                    size={width * 0.06}
                    color="#fff"
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.titulo, { fontSize: width * 0.04 }]}>{item.titulo}</Text>
                <Text style={[styles.estado, { fontSize: width * 0.032 }]}>
                </Text>
            </View>


            <TouchableOpacity onPress={() => handleEliminarFavorito(item.id)}>
                <Ionicons name="heart" size={width * 0.06} color="#fdfdfdff" />
            </TouchableOpacity>
        </View>
    );

    return (
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View
                    style={[
                        styles.header,
                        { marginHorizontal: width * 0.04, marginTop: height * 0.015 },
                    ]}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={width * 0.05} color="#000" />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { fontSize: width * 0.05 }]}>Favoritas</Text>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.ordenar}>
                            <Text style={[styles.headerText, { fontSize: width * 0.035 }]}>
                                Ordenar por
                            </Text>
                            <Ionicons name="chevron-down" size={width * 0.045} color="#000" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.filterButton}>
                            <Ionicons name="filter" size={width * 0.05} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Lista o Cargando */}
                {loading ? (
                    <ActivityIndicator size="large" color="#1E40FF" style={{ marginTop: height * 0.05 }} />
                ) : (
                    <FlatList
                        data={capsulas}
                        renderItem={renderCapsula}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{
                            padding: width * 0.04,
                            paddingBottom: height * 0.12,
                        }}
                        ListEmptyComponent={
                            <Text style={[styles.emptyText, { fontSize: width * 0.035 }]}>
                                No tienes cápsulas favoritas aún.
                            </Text>
                        }

                    />

                )}

                <BottomNav />
            </SafeAreaView>
      
    );
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        backgroundColor: "#fff"
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: { fontWeight: "600" },
    headerActions: { flexDirection: "row", alignItems: "center" },
    ordenar: { flexDirection: "row", alignItems: "center", marginRight: 10 },
    headerText: { color: "#000" },
    filterButton: { padding: 6 },
    card: {
        backgroundColor: "#1E40FF",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    iconContainer: {
        backgroundColor: "#4F6CFF",
        borderRadius: 10,
        marginRight: 10,
    },
    textContainer: { flex: 1 },
    titulo: { color: "#fff", fontWeight: "600" },
    estado: { color: "#d9d9ff" },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#1E40FF",
        width: "100%",
    },
    navItem: { alignItems: "center" },
    navItemActive: {
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
    },
    navText: { color: "#fff", marginTop: 2 },
    emptyText: { textAlign: "center", color: "#777", marginTop: 30 },
});
