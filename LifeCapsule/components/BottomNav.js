import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function BottomNav() {
    const navigation = useNavigation();
    const route = useRoute(); // obtiene la ruta actual
    const currentRoute = route.name; // nombre de la pantalla actual

    const navItems = [
        { name: "Mapa", label: "Ubicación", icon: "map-outline" },
        { name: "Eventos", label: "Eventos", icon: "calendar-outline" },
        { name: "HomeScreen", label: "Inicio", icon: "home" },
        { name: "Favoritas", label: "Favoritas", icon: "heart-outline" },
        { name: "SettingsScreen", label: "Ajustes", icon: "settings-outline" },
    ];

    return (
        <View style={styles.navbar}>
            {navItems.map((item) => {
                const isActive = currentRoute === item.name;
                const color = isActive ? "#60A5FA" : "white";

                return (
                    <TouchableOpacity
                        key={item.name}
                        style={styles.navItem}
                        onPress={() => navigation.navigate(item.name)}
                    >
                        <Ionicons name={item.icon} size={24} color={color} />
                        <Text style={[styles.label, { color }]}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
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
        fontSize: 11,
        marginTop: 2,
        textAlign: "center",
    },
});
