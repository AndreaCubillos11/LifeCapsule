import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { obtenerCapsulasPorUsuario } from "../services/capsuleService";
import BottomNav from "../components/BottomNav";

const { width, height } = Dimensions.get("window");

export default function EventosScreen({ navigation }) {
    const [modoVista, setModoVista] = useState("calendario"); // "calendario" o "lista"
    const [capsulas, setCapsulas] = useState([]);
    const [capsulasMes, setCapsulasMes] = useState([]);
    const [mesActual, setMesActual] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        cargarCapsulas();
    }, []);

    const cargarCapsulas = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerCapsulasPorUsuario();

            // Convertir fechas antes de guardar
            const dataConFechas = data.map((c) => ({
                ...c,
                fecha: convertirFecha(c.Fecha_Apertura || c.fecha),
            }));

            setCapsulas(dataConFechas);

            const mes = new Date().toISOString().slice(0, 7);
            setMesActual(mes);

            filtrarCapsulasPorMes(dataConFechas, mes);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filtrarCapsulasPorMes = (todas, mes) => {
        const filtradas = todas.filter((c) => c.fecha?.startsWith(mes));
        setCapsulasMes(filtradas);
    };

    const marcarFechas = () => {
        const marks = {};
        capsulas.forEach((c) => {
            if (c.fecha) {
                marks[c.fecha] = { marked: true, dotColor: "#007AFF" };
            }
        });
        return marks;
    };

    const convertirFecha = (fechaInput) => {
        try {
            if (!fechaInput) return null;

            if (typeof fechaInput === "object" && fechaInput.seconds) {
                const fecha = new Date(fechaInput.seconds * 1000);
                return formatearFecha(fecha);
            }

            if (typeof fechaInput === "object" && fechaInput.toDate) {
                const fecha = fechaInput.toDate();
                return formatearFecha(fecha);
            }

            if (fechaInput instanceof Date) {
                return formatearFecha(fechaInput);
            }

            if (typeof fechaInput === "string") {
                const fecha = new Date(fechaInput);
                if (!isNaN(fecha)) return formatearFecha(fecha);
            }

            return null;
        } catch (err) {
            console.error("Error al convertir fecha:", err.message);
            return null;
        }
    };

    const formatearFecha = (fecha) => {
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        return `${año}-${mes}-${dia}`;
    };

    // 🔹 Renderiza la tarjeta de cápsula con estilo original y navegación
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.capsulaCard}
            onPress={() => navigation.navigate("CapsuleViewScreen", { id: item.id })}
        >
            <View style={styles.iconoContenedor}>
                <Ionicons
                    name={item.tipo === "texto" ? "document-text-outline" : "time-outline"}
                    size={24}
                    color="#fff"
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <Text style={styles.fecha}>{item.fecha}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={22} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ position: "absolute", left: 0 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.tituloHeader}>Eventos</Text>
            </View>

            {/* Selector de vista */}
            <View style={styles.selectorContainer}>
                <TouchableOpacity
                    style={[
                        styles.botonSelector,
                        modoVista === "calendario" && styles.botonActivo,
                    ]}
                    onPress={() => setModoVista("calendario")}
                >
                    <Text
                        style={[
                            styles.textoSelector,
                            modoVista === "calendario" && styles.textoActivo,
                        ]}
                    >
                        Calendario
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.botonSelector,
                        modoVista === "lista" && styles.botonActivo,
                    ]}
                    onPress={() => setModoVista("lista")}
                >
                    <Text
                        style={[
                            styles.textoSelector,
                            modoVista === "lista" && styles.textoActivo,
                        ]}
                    >
                        Lista
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Vista Calendario */}
            {modoVista === "calendario" ? (
                <View style={{ flex: 1 }}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <>
                            <Calendar
                                onMonthChange={(month) => {
                                    const mes = `${month.year}-${String(month.month).padStart(2, "0")}`;
                                    setMesActual(mes);
                                    filtrarCapsulasPorMes(capsulas, mes);
                                }}
                                markedDates={marcarFechas()}
                                theme={{
                                    todayTextColor: "#007AFF",
                                    selectedDayBackgroundColor: "#007AFF",
                                    arrowColor: "#007AFF",
                                    textMonthFontWeight: "bold",
                                }}
                                style={styles.calendario}
                            />

                            <Text style={styles.subtitulo}>Eventos en {mesActual}</Text>

                            {capsulasMes.length === 0 ? (
                                <Text style={styles.sinEventos}>No hay cápsulas este mes.</Text>
                            ) : (
                                <FlatList
                                    data={capsulasMes}
                                    keyExtractor={(item) => item.id}
                                    renderItem={renderItem}
                                />
                            )}
                        </>
                    )}
                    <BottomNav />
                </View>
            ) : (
                // Vista Lista
                <View style={{ flex: 1 }}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <FlatList
                            data={capsulas.sort(
                                (a, b) => new Date(a.fecha) - new Date(b.fecha)
                            )}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                        />
                    )}
                    <BottomNav />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: width * 0.05,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: height * 0.02,
        marginBottom: height * 0.015,
        position: "relative",
    },
    tituloHeader: {
        fontSize: width * 0.06,
        fontWeight: "bold",
        color: "#000",
        textAlign: "center",
    },
    selectorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: height * 0.02,
    },
    botonSelector: {
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: "#f0f0f0",
    },
    botonActivo: {
        backgroundColor: "#007AFF",
    },
    textoSelector: {
        color: "#333",
        fontWeight: "600",
    },
    textoActivo: {
        color: "#fff",
    },
    calendario: {
        borderRadius: 12,
        elevation: 2,
        backgroundColor: "#f9f9f9",
        marginBottom: height * 0.02,
    },
    subtitulo: {
        fontSize: width * 0.05,
        fontWeight: "600",
        color: "#007AFF",
        marginBottom: height * 0.01,
    },
    sinEventos: {
        textAlign: "center",
        color: "#999",
        marginTop: height * 0.03,
    },
    capsulaCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        borderRadius: 10,
        padding: width * 0.04,
        marginBottom: height * 0.015,
    },
    iconoContenedor: {
        width: 40,
        height: 40,
        backgroundColor: "#005BBB",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    titulo: {
        fontSize: width * 0.045,
        fontWeight: "bold",
        color: "#fff",
    },
    fecha: {
        fontSize: width * 0.035,
        color: "#E0E0E0",
        marginTop: 2,
    },
});
