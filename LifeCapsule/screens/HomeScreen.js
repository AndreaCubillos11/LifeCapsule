import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../services/firebaseconfig";
import BottomNav from "../components/BottomNav";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            setUserData({
                displayName: user.displayName || "Usuario",
                photoURL: user.photoURL || null,
            });
        }
    }, []);

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* ENCABEZADO */}
                <View style={styles.header}>
                    <TouchableOpacity>
                        {userData?.photoURL ? (
                            <Image
                                source={{ uri: userData.photoURL }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <Ionicons name="person-circle-outline" size={50} color="#1B1B1B" />
                        )}
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.greeting}>
                            ¡Hola, <Text style={styles.name}>{userData?.displayName}!</Text>
                        </Text>
                        <View style={styles.waveIcon}>
                            <Ionicons name="sunny-outline" size={20} color="#FDB813" />
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        <Ionicons
                            name="search-outline"
                            size={22}
                            color="#1B1B1B"
                            style={styles.icon}
                        />
                        <Ionicons name="notifications-outline" size={22} color="#1B1B1B" />
                    </View>
                </View>

                {/* SECCIÓN PENDIENTES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pendientes de abrir</Text>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.capsuleButton}>
                            <Text style={styles.buttonText}>Abrir en 2035</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.capsuleButton}>
                            <Text style={styles.buttonText}>Graduación</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.capsuleButton}>
                            <Text style={styles.buttonText}>Mi futuro</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate("CreateCapsule")}
                    >
                        <Ionicons name="add" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* SECCIÓN CÁPSULAS ABIERTAS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cápsulas abiertas</Text>
                    <View style={styles.capsulesContainer}>
                        {["Cápsula 1", "Cápsula 2", "Cápsula 3"].map((capsule, index) => (
                            <TouchableOpacity key={index} style={styles.capsuleCard}>
                                <Ionicons name="document-text-outline" size={28} color="#3B3B3B" />
                                <Text style={styles.capsuleText}>{capsule}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* SECCIÓN RECOMENDACIONES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recomendaciones de IA</Text>
                    <TouchableOpacity
                        style={styles.recommendationCard}
                        onPress={() => navigation.navigate("Recommendations")}
                    >
                        <Text style={styles.recommendationText}>
                            Tu semana fue intensa, ¿quieres crear una cápsula?
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* MENÚ INFERIOR */}
            <BottomNav />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#F7F9FC",
    },
    container: {
        flex: 1,
        backgroundColor: "#F7F9FC",
        paddingHorizontal: 20,
        marginBottom: 70, // espacio para el menú inferior
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 60, 
        marginBottom: 15,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    greeting: {
        fontSize: 20,
        fontWeight: "500",
        color: "#1B1B1B",
    },
    name: {
        fontWeight: "700",
        fontStyle: "italic",
    },
    waveIcon: {
        marginLeft: 8,
        marginTop: 2,
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 12,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 15,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 10,
        color: "#1B1B1B",
    },
    buttonsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 15,
    },
    capsuleButton: {
        backgroundColor: "#3D5AFE",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    addButton: {
        backgroundColor: "#1B1B1B",
        alignSelf: "center",
        padding: 10,
        borderRadius: 12,
    },
    capsulesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    capsuleCard: {
        width: (width - 80) / 3,
        backgroundColor: "#F0F2F8",
        borderRadius: 15,
        alignItems: "center",
        paddingVertical: 18,
        marginBottom: 10,
    },
    capsuleText: {
        marginTop: 5,
        color: "#3B3B3B",
        fontWeight: "500",
    },
    recommendationCard: {
        backgroundColor: "#3D5AFE",
        borderRadius: 12,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 5,
    },
    recommendationText: {
        color: "#fff",
        fontSize: 14,
        flex: 1,
        marginRight: 10,
    },
});
