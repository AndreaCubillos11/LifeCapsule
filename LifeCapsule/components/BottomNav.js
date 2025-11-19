import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BottomNav() {
    const navigation = useNavigation();

    return (
        <View style={styles.navbar}>
            <TouchableOpacity style={styles.navItem}
             onPress={() => navigation.navigate("Mapa")}
            >
                <Ionicons name="map-outline" size={24} color="white" />
                <Text style={styles.label}>Ubicación</Text>
                
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}
            onPress={() => navigation.navigate("Eventos")}>
            
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Text style={styles.label}>Eventos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}
            onPress={() => navigation.navigate("HomeScreen")}>
                <Ionicons name="home" size={24} color="#60A5FA" />
                <Text style={[styles.label, { color: "#60A5FA" }]}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}
               onPress={() => navigation.navigate("Favoritas")}>
                <Ionicons name="heart-outline" size={24} color="white" />
                <Text style={styles.label}>Favoritas</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => navigation.navigate("SettingsScreen")}
            >
                <Ionicons name="settings-outline" size={24} color="white" />
                <Text style={styles.label}>Ajustes</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#1E293B",
        height: 70,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingTop: 5,
        elevation: 8,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        color: "white",
        fontSize: 11,
        marginTop: 2,
        textAlign: "center",
    },
});
