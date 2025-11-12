import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAISuggestions } from "../services/openrouterService";

export default function RecommendationsScreen() {
  const navigation = useNavigation();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    const data = await getAISuggestions();
    setSuggestions(data);
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Recomendaciones para ti 🌱</Text>
      </View>

      <Text style={styles.subtitle}>
        Basadas en tus recuerdos, emociones y momentos importantes
      </Text>

      {/* Recomendaciones de IA */}
      {loading ? (
        <ActivityIndicator size="large" color="#3D5AFE" style={{ marginTop: 20 }} />
      ) : (
        suggestions.map((text, index) => (
          <View key={index} style={styles.recommendationsCard}>
            <Text style={styles.recommendationsText}>{text}</Text>
          </View>
        ))
      )}


      {/* Botón Crear capsula */}
      <TouchableOpacity
        style={styles.capsuleButton}
        onPress={() => navigation.navigate("CreateCapsule")}
      >
        <Text style={styles.capsuleText}>Crear cápsula ahora</Text>
      </TouchableOpacity>

      {/* Botón + recomendaciones */}
      <TouchableOpacity style={styles.recommendationsButton} onPress={fetchSuggestions}>
        <Text style={styles.moreRecommendationsText}>+ Ver más recomendaciones</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },
  recommendationsCard: {
    backgroundColor: "#F0F2F8",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  capsuleText: {
    fontSize: 15,
    color: "#3D5AFE",
    lineHeight: 21,
  },
  capsuleButton: {
    backgroundColor: "#ffffff",
    borderColor: "#3D5AFE",
    borderWidth: 1,
    borderColor: "#3D5AFE", 
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  recommendationsText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 21,
  },
  recommendationsButton: {
    backgroundColor: "#3D5AFE",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  moreRecommendationsText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
