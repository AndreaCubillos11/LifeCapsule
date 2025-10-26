import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CapsuleCard({ imageUri }) {
    return (
        <TouchableOpacity style={styles.card}>
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.image}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons name="image-outline" size={36} color="#A9A9A9" />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 100,
        height: 100,
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        marginHorizontal: 8,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    placeholder: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E2E8F0",
    },
});
