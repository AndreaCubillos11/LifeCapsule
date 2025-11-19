import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { obtenerCapsulasPorUsuario } from "../services/capsuleService";
import { Ionicons } from "@expo/vector-icons";

export default function UbicacionScreen({ navigation }) {
    const [capsulas, setCapsulas] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCapsula, setSelectedCapsula] = useState(null);

    useEffect(() => {
        cargarCapsulas();
    }, []);

    const cargarCapsulas = async () => {
        try {
            const data = await obtenerCapsulasPorUsuario();
            console.log(JSON.stringify(capsulas, null, 2));
            setCapsulas(data);
        } catch (err) {
            console.log("Error cargando cápsulas:", err);
        }
    };

    const obtenerCoordenadas = (ubic) => {
        if (!ubic) return null;

        // GeoPoint Firestore
        if (ubic.latitude !== undefined && ubic.longitude !== undefined) {
            return { latitude: ubic.latitude, longitude: ubic.longitude };
        }

        return null; // si no hay coordenadas
    };

    // 🔹 Filtrado seguro con título por defecto
    const capsulasFiltradas = capsulas.filter((c) =>
        (c?.titulo ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} />
                </TouchableOpacity>
                <Text style={styles.title}>Ubicación</Text>
            </View>

            {/* BUSCADOR */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#444" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar cápsula"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* MAPA */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 4.65,
                    longitude: -74.06,
                    latitudeDelta: 0.07,
                    longitudeDelta: 0.07,
                }}
            >
                {capsulasFiltradas.map((capsula) => {
                    const coords = obtenerCoordenadas(capsula.ubicación_creacion);
                    if (!coords) return null;

                    console.log("Marcador", capsula.id, coords.latitude, coords.longitude);

                    return (
                        <Marker
                            key={capsula.id}
                            coordinate={coords}
                            onPress={() => setSelectedCapsula(capsula)}
                        >
                            <View style={styles.pin}>
                                <Ionicons name="time" size={26} color="white" />
                            </View>
                        </Marker>
                    );
                })}
            </MapView>


            {/* CARD FLOTANTE */}
            {selectedCapsula && (
                <View style={styles.floatingCard}>
                    <Text style={styles.cardTitle}>{selectedCapsula.titulo ?? "Sin título"}</Text>

                    <Text style={styles.cardSubtitle}>
                        {(() => {
                            const fecha = selectedCapsula.Fecha_Apertura;

                            // 🔹 Caso 1: timestamp Firestore
                            if (fecha?.seconds) {
                                const year = new Date(fecha.seconds * 1000).getFullYear();
                                const diff = year - new Date().getFullYear();
                                return `Se abre en ${diff} año(s).`;
                            }

                            // 🔹 Caso 2: string de fecha
                            const parsed = new Date(fecha);
                            if (!isNaN(parsed)) {
                                const diff = parsed.getFullYear() - new Date().getFullYear();
                                return `Se abre en ${diff} año(s).`;
                            }

                            // 🔹 Caso 3: inválido
                            return "Fecha de apertura no disponible.";
                        })()}
                    </Text>

                    <TouchableOpacity
                        style={styles.cardBtn}
                         onPress={() => navigation.navigate("CapsuleViewScreen", { id: selectedCapsula.id })}
                    >
                        <Text style={styles.cardBtnText}>Ver</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        marginLeft: 10,
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        marginHorizontal: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
    },

    searchInput: {
        marginLeft: 10,
        flex: 1,
        fontSize: 16,
    },

    map: {
        flex: 1,
    },

    pin: {
        backgroundColor: "#5A42F5",
        padding: 6,
        borderRadius: 30,
    },

    floatingCard: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
    },

    cardSubtitle: {
        fontSize: 14,
        color: "#444",
        marginVertical: 4,
    },

    cardBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#5A42F5",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 8,
    },

    cardBtnText: {
        color: "white",
        fontWeight: "600",
        marginRight: 5,
    },
});
