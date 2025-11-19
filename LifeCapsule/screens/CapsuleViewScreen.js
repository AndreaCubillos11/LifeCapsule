import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebaseconfig";
import { Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur"; // requiere expo-blur (expo install expo-blur)
import { obtenerTipoDesbloqueoPorId } from "../services/Tipo_Desbloqueo";
import * as LocalAuthentication from "expo-local-authentication";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { TextInput } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { Audio } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import { actualizarEstadoFavorita } from "../services/capsuleService";



export default function CapsuleViewScreen({ route, navigation }) {
  const { id } = route.params ?? {};
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const ITEM_WIDTH = screenWidth - 32;

  // datos cargados desde Firestore
  const [capsula, setCapsula] = useState(null);
  const [tipoDesbloqueo, setTipoDesbloqueo] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI / carrusel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);

  // animación flecha
  const arrowScale = useRef(new Animated.Value(1)).current;
  const pulseAnimRef = useRef(null);

  //Animación para mostrar contenido de la cápsula
  const [isOpening, setIsOpening] = useState(false); // proceso de validación en curso
  const [isOpened, setIsOpened] = useState(false);   // ya está abierta la cápsula
  const [validationMessage, setValidationMessage] = useState("");

  // Modal / video reveal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(true); // loader while video prepares
  const openingVideoRef = useRef(null);

  //Muestra el campo para poner el PIN
  const [pinVisible, setPinVisible] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const resolverPinRef = useRef(null);
  const [tipoDesbloqueoActual, setTipoDesbloqueoActual] = useState(null);

  //Mostrar audio
  const [audioLocal, setAudioLocal] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // iniciar/parar animación dependiendo del índice y cantidad de imágenes
  useEffect(() => {
    const multimediaLength = (capsula?.Multimedia && capsula.Multimedia.length) || 0;
    if (currentIndex < multimediaLength - 1 && multimediaLength > 0) {
      pulseAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowScale, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(arrowScale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimRef.current.start();
    } else {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
        arrowScale.setValue(1);
      }
    }
    return () => {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
    };
  }, [currentIndex, capsula]);

  // Cargar cápsula y tipo de desbloqueo desde Firestore al montar
  useEffect(() => {
    cargarCapsula();
  }, [id]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      // 🔍 Ver llaves actuales
      const keys = await AsyncStorage.getAllKeys();
      console.log("🔍 LLAVES EN ASYNC:", keys);

      // Intento con nueva convención
      let uri = await AsyncStorage.getItem(`audioCapsula_${id}`);

      // Si no existe, fallback al viejo formato
      if (!uri) {
        uri = await AsyncStorage.getItem("audioCapsula");
      }

      if (uri) {
        console.log("🎵 Audio cargado:", uri);
        setAudioLocal(uri);

        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        setSound(newSound);

        await newSound.setPositionAsync(0);
        setDuration(status.durationMillis || 0);
        setPosition(0);
        setIsPlaying(false);
      } else {
        console.log("❌ No hay audio guardado");
      }
    };

    load();

    return () => {
      if (sound) {
        sound.stopAsync();
        sound.unloadAsync();
      }
    };
  }, [id]);


  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (sound) {
          sound.stopAsync();
          sound.unloadAsync();
        }
      };
    }, [sound])
  );


  const convertirFecha = (timestamp) => {
    if (!timestamp) return "Sin fecha";
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000).toLocaleString();
    if (timestamp instanceof Date) return timestamp.toLocaleString();
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Fecha inválida";
    }
  };

  const cargarCapsula = async () => {

    if (!id) {
      console.error("No se proporcionó ID de cápsula en route.params");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ref = doc(db, "Capsulas", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.error("La cápsula no existe");
        setCapsula(null);
        return;
      }

      const data = snap.data() || {};

      // asegurar Multimedia
      if (!Array.isArray(data.Multimedia)) {
        data.Multimedia = data.Multimedia ? Object.values(data.Multimedia) : [];
      }

      // intentar traer datos locales guardados (texto/audio) y mezclarlos si hacen falta
      try {
        const localTexto = await AsyncStorage.getItem('textoCapsula');
        const localAudio = await AsyncStorage.getItem('audioCapsula');
        // solo asignar si no vienen desde Firestore
        if (!data.texto && localTexto) data.texto = localTexto;
        if (!data.audio && localAudio) data.audio = localAudio;
      } catch (e) {
        console.warn('No se pudo leer AsyncStorage:', e.message);
      }

      // set completo de la cápsula
      setCapsula(data);

      // si hay referencia de tipo de desbloqueo
      const tipoId = data.id_tipoDesbloqueo || data.tipo_id || data.tipoDesbloqueoId;

      if (tipoId) {
        try {
          const tipo = await obtenerTipoDesbloqueoPorId(tipoId);
          if (tipo) {
            setTipoDesbloqueo(tipo);
          }
        } catch (err) {
          console.warn("❌ Error cargando tipo de desbloqueo:", err.message);
        }
      }

    } catch (error) {
      console.log("Error obteniendo datos:", error);
    } finally {
      setLoading(false);
    }

    // Cargar audio local guardado
    const localAudio = await AsyncStorage.getItem(`audioCapsula_${id}`);
    if (localAudio) {
      setAudioLocal(localAudio);

      // cargar objeto de audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: localAudio },
        { shouldPlay: false },
        (status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 1);
            setPosition(status.positionMillis || 0);
          }
        }
      );
      setSound(sound);
    }

  };

  // helper: convierte distintos formatos de Fecha_Apertura a Date
  const parseFechaApertura = (raw) => {
    if (!raw) return null;
    if (raw.toDate) return raw.toDate();
    if (raw.seconds) return new Date(raw.seconds * 1000);
    if (raw instanceof Date) return raw;
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  };

  //Validacíon para mostrar contenido de la cápsula
  const handleOpenCapsule = async () => {

    // seguridad: si no hay capsula aún
    if (!capsula) return;

    setIsOpening(true); // Oculta UI normal y muestra (silencioso) proceso
    setValidationMessage("");
    console.log("Validando cápsula...");

    try {
      // obtenemos la fecha en formato Date (maneja Timestamp)
      const aperturaDate = parseFechaApertura(capsula.Fecha_Apertura);

      if (!aperturaDate) {
        setValidationMessage("⏳ Fecha de apertura inválida.");
        setIsOpening(false);
        return;
      }

      const today = new Date();
      // Normalizamos para comparar solo YYYY-MM-DD
      const soloFechaHoy = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const soloFechaApertura = new Date(
        aperturaDate.getFullYear(),
        aperturaDate.getMonth(),
        aperturaDate.getDate()
      );

      // si la fecha de apertura es mayor al día actual => no abrir
      if (soloFechaHoy < soloFechaApertura) {
        setValidationMessage(
          `⏳ Esta cápsula solo se puede abrir el ${soloFechaApertura.toLocaleDateString()}.`
        );
        setIsOpening(false);
        return;
      }
      //Validación tipo de desbloqueo
      const tipo = await obtenerTipoDesbloqueoPorId(capsula.id_tipoDesbloqueo);

      if (tipo) {
        console.log("Tipo de desbloqueo encontrado:", tipo);
      } else {
        console.log("No se encontró el tipo de desbloqueo.");
      }

      if (tipo.nombre_tipo == "Huella") {

        const puedeDesbloquear = await desbloquearCapsulaPorHuella(capsula.capsulaId);

        if (puedeDesbloquear) {

          // (Aquí irán luego las validaciones de ubicación, huella, etc.)
          // Si todo OK → Abrimos modal con animación (reveal)
          setModalLoading(true);
          setModalVisible(true);

        }

        return;

      }

      if (tipo.nombre_tipo === "Pin") {
        console.log("Mostrando PIN...");

        setTipoDesbloqueoActual(tipo);
        setIsOpening(false);
        setPinVisible(true);

        // Esperar a que el usuario ingrese el PIN
        const ok = await new Promise(resolve => {
          resolverPinRef.current = resolve;
        });

        console.log("Resultado del PIN:", ok);

        if (!ok) {
          setValidationMessage("PIN incorrecto.");
          return;
        }

        // PIN correcto → abrir cápsula
        setModalLoading(true);
        setModalVisible(true);
        return;
      }



      if (tipo.nombre_tipo === "Ubicación") {
        const puedeDesbloquear = await desbloquearCapsulaPorUbicacion(capsula);

        if (puedeDesbloquear) {
          setModalLoading(true);
          setModalVisible(true);
        }

        return;
      }


      // Play se dispara en effect (cuando modalVisible cambia y videoRef está listo)
    } catch (error) {
      console.error("Error en validación:", error);
      setValidationMessage("❌ Hubo un error inesperado.");
      setIsOpening(false);
    }
  };

  const desbloquearCapsulaPorHuella = async (capsulaId) => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        Alert.alert("Error", "Tu dispositivo no soporta autenticación biométrica.");
        return false;
      }

      const tieneBiometria = await LocalAuthentication.isEnrolledAsync();
      if (!tieneBiometria) {
        Alert.alert("Error", "No tienes huellas registradas.");
        return false;
      }

      const key = `capsula_${capsulaId}_hash`;
      const hashGuardado = await SecureStore.getItemAsync(key);

      if (!hashGuardado) {
        Alert.alert("Error", "Esta cápsula no tiene huella registrada.");
        return false;
      }

      // Pedir validación de huella
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Valida tu huella para desbloquear",
        fallbackLabel: "Usar PIN"
      });

      if (!resultado.success) {
        Alert.alert("Error", "Autenticación fallida.");
        return false;
      }

      // Autenticación OK → generar hash para comparar
      const userUID = await AsyncStorage.getItem("userUID");
      const data = `${capsulaId}-${userUID}`;
      const hashActual = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data
      );

      // Comparar hashes
      if (hashActual === hashGuardado) {
        // 🔓 DESBLOQUEO EXITOSO
        return true;
      } else {
        Alert.alert("Error", "La huella no coincide.");
        return false;
      }
    } catch (error) {
      console.error("Error al desbloquear por huella:", error);
      Alert.alert("Error", "No se pudo completar la autenticación.");
      return false;
    }
  };

  const desbloquearCapsulaPorPIN = async (tipo, pinInput) => {
    try {
      // Obtenemos el PIN correcto desde la estructura REAL
      const pinCorrecto = String(
        tipo?.requisito_desbloqueo?.requisitoDesbloqueo?.pin
      );

      console.log("PIN correcto desde BD:", pinCorrecto);
      console.log("PIN ingresado:", pinInput);

      if (!pinCorrecto) {
        Alert.alert("Error", "No hay PIN registrado para esta cápsula.");
        return false;
      }

      // Comparación real
      if (pinInput.trim() === pinCorrecto.trim()) {
        console.log("✔ PIN correcto");
        return true;
      } else {
        console.log("❌ PIN incorrecto");
        Alert.alert("Error", "El PIN es incorrecto.");
        return false;
      }

    } catch (error) {
      console.error("Error en desbloqueo por PIN:", error);
      Alert.alert("Error", "No se pudo validar el PIN.");
      return false;
    }
  };

  const validarPIN = async () => {
    console.log("Validando PIN...");
    console.log("Tipo actual:", tipoDesbloqueoActual);

    const ok = await desbloquearCapsulaPorPIN(tipoDesbloqueoActual, pinInput);

    if (ok) {
      console.log("PIN correcto → mostrando animación...");
      setModalLoading(true);
      setModalVisible(true);
      setPinVisible(false);
    }
  };

  const desbloquearCapsulaPorUbicacion = async (capsula) => {
    try {
      // 1. Permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se requiere ubicación para abrir esta cápsula.");
        return false;
      }

      // 2. Obtener ubicación actual
      const ubicacionActual = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = ubicacionActual.coords;

      // 3. Ubicación de la cápsula
      const latCapsula = capsula.latitud;
      const lonCapsula = capsula.longitud;

      if (!latCapsula || !lonCapsula) {
        Alert.alert("Error", "Esta cápsula no tiene coordenadas registradas.");
        return false;
      }

      // 4. Distancia (metros)
      const distancia = haversine(
        { lat: latitude, lng: longitude },
        { lat: latCapsula, lng: lonCapsula }
      );

      console.log("Distancia:", distancia, "metros");

      // 5. Límite en metros para desbloquear
      const LIMITE = 50; // ajustable si quieres más estricto

      if (distancia <= LIMITE) {
        return true;
      } else {
        Alert.alert(
          "Muy lejos",
          `Debes estar a menos de ${LIMITE} metros del punto para abrir esta cápsula.`
        );
        return false;
      }
    } catch (error) {
      console.log("Error ubicación:", error);
      Alert.alert("Error", "No se pudo validar la ubicación.");
      return false;
    }
  };

  // cuando el modal (reveal) se abre intentamos reproducir el video
  useEffect(() => {
    let mounted = true;
    const tryPlay = async () => {
      if (modalVisible && openingVideoRef.current) {
        try {
          await openingVideoRef.current.setPositionAsync(0);
          await openingVideoRef.current.playAsync();
          if (mounted) setModalLoading(false);
        } catch (err) {
          console.warn("No se pudo reproducir el video automáticamente:", err);
          if (mounted) setModalLoading(false);
        }
      }
    };
    tryPlay();
    return () => { mounted = false; };
  }, [modalVisible]);

  // handler cuando video finaliza
  const onVideoStatusUpdate = (status) => {
    if (!status) return;
    if (status.didJustFinish) {
      setIsOpened(true);
      setTimeout(() => {
        setModalVisible(false);
        setIsOpening(false);
        setModalLoading(true);
      }, 180);
    }
  };

  //Cápsulas favoritas
  const toggleFavorite = async () => {
    try {
      const nuevoEstado = !isFavorite;

      await actualizarEstadoFavorita(id, nuevoEstado);

      setIsFavorite(nuevoEstado);
    } catch (error) {
      console.log("Error al actualizar favorito:", error);
    }
  };


  //Eliminar cápsula
  const eliminarCapsula = () => {
    Alert.alert(
      "Eliminar cápsula",
      "¿Estás seguro de que deseas eliminar esta cápsula? Esta acción es permanente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Capsulas", id));
              Alert.alert("Cápsula eliminada", "La cápsula fue eliminada.");
              navigation.goBack();
            } catch (error) {
              console.log("Error eliminando cápsula:", error);
              Alert.alert("Error", "No se pudo eliminar la cápsula.");
            }
          },
        },
      ]
    );
  };

  //Cápsulas favoritas
  const [isFavorite, setIsFavorite] = useState(isFavoriteFromDB);

  // UI: si está cargando datos desde Firestore
  if (loading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5AFE" />
      </View>
    );
  }

  if (!capsula) {
    return (
      <View style={localStyles.loadingContainer}>
        <Text>No se encontró la cápsula.</Text>
      </View>
    );
  }

  // destructuramos valores para UI (aseguramos valores por defecto)
  const {
    id_capsula = capsula.id ?? null,
    titulo = "Sin título",
    descripcion = capsula.descripción ?? "",
    tipo_capsula = capsula.tipo_capsula || "",
    Fecha_Creacion = capsula.Fecha_Creacion,
    Fecha_Apertura = capsula.Fecha_Apertura,
    Multimedia = [],
    isFavorite: isFavoriteFromDB = false,
    texto = capsula.texto ?? "",
    pin = capsula.pin ?? "",
    hashHuella = capsula.hashHuella ?? capsula.requisitoDesbloqueo?.hashHuella ?? null,
    faceEmbedding = capsula.faceEmbedding ?? null,
    audio = capsula.audio ?? null,
    ubicacion_creacion = capsula.ubicacion_creacion ?? capsula.ubicacionSeleccionada ?? null,
    latitud = capsula.latitud ?? null,
    longitud = capsula.longitud ?? null,
    id_tipoDesbloqueo = capsula.id_tipoDesbloqueo ?? capsula.tipo_id ?? null,
  } = capsula;

  const hasMedia = Array.isArray(Multimedia) && Multimedia.length > 0;

  const loadAudio = async (uri) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);

      // Asegurar reinicio
      await newSound.setPositionAsync(0);

      setDuration(status.durationMillis || 0);
      setPosition(0);
      setIsPlaying(false);

    } catch (e) {
      console.log("Error cargando audio:", e);
    }
  };


  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;

    // Actualiza tiempo y duración
    if (status.positionMillis != null) setPosition(status.positionMillis);
    if (status.durationMillis != null) setDuration(status.durationMillis);

    // Mantén sincronizado con el estado real del sonido
    setIsPlaying(status.isPlaying);

    // Cuando termina
    if (status.didJustFinish) {
      setIsPlaying(false);
      if (sound) {
        sound.stopAsync();
        sound.setPositionAsync(0);
      }
    }
  };


  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const formatMillis = (millis) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };



  // ---------------------------
  // HEADER que se mantiene en opened pero sin menu
  // ---------------------------
  const RenderHeader = ({ opened = false }) => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (opened) { setIsOpened(false); return; }
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{titulo}</Text>

        {!opened ? (
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={({ pressed }) => [styles.headerMoreButton, pressed && styles.actionButtonPressed]}
          >
            <Feather name="more-vertical" size={24} color="#3D5AFE" />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>
    );
  };

  // ---------------------------
  // VISTA cuando la cápsula YA está ABIERTA (contenido completo)
  // ---------------------------
  if (isOpened) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <RenderHeader opened />

        <ScrollView style={styles.container}>
          <View style={[styles.cardTop, { margin: 16 }]}>
            <Text style={styles.title}>{titulo}</Text>
            {Fecha_Apertura ? (
              <Text style={{ marginTop: 6, color: "#666" }}>Abierta: {convertirFecha(Fecha_Apertura)}</Text>
            ) : null}
          </View>

          {/* label de texto (icon + texto) encima del carrusel y debajo del título */}
          {texto ? (
            <View style={styles.textLabel}>
              <Ionicons name="document-text" size={18} color="#3D5AFE" />
              <Text style={styles.textLabelText}>Texto</Text>
            </View>
          ) : null}

          {/* Texto real */}
          {texto ? (
            <View style={styles.card}>
              <Text style={styles.contentText}>{texto}</Text>
            </View>
          ) : null}

          {/* Carrusel / Galería dentro del contenido */}
          {hasMedia && (
            <View style={{ position: "relative", marginTop: 12 }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const index = Math.round(x / ITEM_WIDTH);
                  setCurrentIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {Multimedia.map((item, idx) => {
                  const uri = item.url || item; // soporta tu formato actual
                  const isVideo = uri.match(/\.(mp4|mov|avi|mkv|webm)$/i);

                  return (
                    <View
                      key={idx}
                      style={{
                        width: ITEM_WIDTH,
                        marginRight: idx === Multimedia.length - 1 ? 0 : 32,
                      }}
                    >
                      {isVideo ? (
                        <Video
                          source={{ uri }}
                          style={{
                            width: "100%",
                            height: 220,
                            borderRadius: 12,
                            backgroundColor: "black",
                          }}
                          useNativeControls
                          resizeMode="contain"
                        />
                      ) : (
                        <Image
                          source={{ uri }}
                          style={[
                            styles.image,
                            {
                              width: ITEM_WIDTH,
                              height: 220,
                              borderRadius: 12,
                              resizeMode: "cover",
                            },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              {/* Flecha de avance */}
              {currentIndex < Multimedia.length - 1 && (
                <Animated.View
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "42%",
                    backgroundColor: "#3D5AFE",
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 30,
                    transform: [{ scale: arrowScale }],
                  }}
                >
                  <Text style={{ color: "white", fontSize: 22 }}>›</Text>
                </Animated.View>
              )}
            </View>
          )}



          {/* PANEL DE AUDIO – SOLO SI EXISTE AUDIO LOCAL */}
          {audioLocal && (
            <View
              style={{
                width: "90%",
                alignSelf: "center",
                backgroundColor: "#fff",
                borderRadius: 14,
                paddingVertical: 18,
                paddingHorizontal: 16,
                marginTop: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={togglePlayPause}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={36}
                    color="#3D5AFE"
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Slider
                    value={position}
                    minimumValue={0}
                    maximumValue={duration}
                    onSlidingComplete={async (value) => {
                      if (sound) {
                        await sound.setPositionAsync(value[0]);
                      }
                    }}
                    minimumTrackTintColor="#3D5AFE"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#3D5AFE"
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {formatMillis(position)}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      {formatMillis(duration)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}


          {/* Ubicación: pequeño mapa + texto (mapa siempre visible) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={{ height: 140, borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: ubicacion_creacion?.latitude ?? (latitud ? Number(latitud) : 0),
                  longitude: ubicacion_creacion?.longitude ?? (longitud ? Number(longitud) : 0),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                pointerEvents={"none"}
              >
                <Marker
                  coordinate={{
                    latitude: ubicacion_creacion?.latitude ?? (latitud ? Number(latitud) : 0),
                    longitude: ubicacion_creacion?.longitude ?? (longitud ? Number(longitud) : 0),
                  }}
                />
              </MapView>
            </View>

            <Text style={[styles.contentText, { marginTop: 10 }]}>
              {typeof ubicacion_creacion?.latitude !== "undefined"
                ? `${ubicacion_creacion.latitude.toFixed(4)} , ${ubicacion_creacion.longitude.toFixed(4)}`
                : latitud && longitud
                  ? `${latitud}, ${longitud}`
                  : "Ubicación no disponible"}
            </Text>
          </View>

          {/* Método / requisitos de desbloqueo */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Método de desbloqueo</Text>
            <Text style={styles.contentText}>
              {tipoDesbloqueo
                ? tipoDesbloqueo.nombre_tipo
                : "Cargando tipo de desbloqueo..."}
            </Text>



            {pin ? <Text style={styles.meta}>PIN: {pin}</Text> : null}
            {hashHuella ? <Text style={styles.meta}>Hash huella: {String(hashHuella)}</Text> : null}
            {faceEmbedding ? <Text style={styles.meta}>Face embedding guardado</Text> : null}
          </View>

          {/* Fechas (creación / apertura) */}
          <View style={styles.datesBox}>
            <Text style={styles.sectionTitle}>Fechas</Text>

            <Text style={styles.dateLabel}>Creación:</Text>
            <Text style={styles.dateValue}>{convertirFecha(Fecha_Creacion)}</Text>

            <Text style={styles.dateLabel}>Apertura:</Text>
            <Text style={styles.dateValue}>{convertirFecha(Fecha_Apertura)}</Text>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* menu modal */}
        <Modal transparent={true} visible={menuVisible} animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuContainer}>
              <Pressable style={styles.menuItem}>
                <Feather name="share-2" size={20} color="#3D5AFE" />
                <Text style={styles.menuText}>Compartir</Text>
              </Pressable>

              <Pressable style={styles.menuItem}>
                <Feather name="map-pin" size={20} color="#3D5AFE" />
                <Text style={styles.menuText}>Ver ubicación en mapa</Text>
              </Pressable>

              <Pressable style={styles.menuItem}>
                <Feather name="lock" size={20} color="#3D5AFE" />
                <Text style={styles.menuText}>Ver método de desbloqueo</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  // ---------------------------
  // VISTA PREVIEW (antes de abrir)
  // ---------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <RenderHeader />

        {/* DESCRIPCIÓN */}
        <View style={styles.titleRow}>
          <Text style={styles.description}>{descripcion}</Text>
        </View>

        {tipo_capsula ? <Text style={styles.type}>{tipo_capsula}</Text> : null}

        {/* FECHAS */}
        <View style={styles.datesBox}>
          <Text style={styles.sectionTitle}>Fechas</Text>

          <Text style={styles.dateLabel}>Creación:</Text>
          <Text style={styles.dateValue}>{convertirFecha(Fecha_Creacion)}</Text>

          <Text style={styles.dateLabel}>Apertura:</Text>
          <Text style={styles.dateValue}>{convertirFecha(Fecha_Apertura)}</Text>
        </View>

        {/* ACCIONES */}
        <View style={styles.titleRow}>
          <Text style={styles.actionsTitle}>Acciones</Text>
        </View>
        <View style={styles.actionsRow}>
          {/* FAVORITO */}
          <Pressable
            onPress={toggleFavorite}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isFavorite ? "#3D5AFE" : "#3D5AFE"}
            />
          </Pressable>

          {/* EDITAR (aún sin acción) */}
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Feather name="edit" size={22} color="#3D5AFE" />
          </Pressable>

          {/* ELIMINAR */}
          <Pressable
            onPress={eliminarCapsula}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Feather name="trash-2" size={22} color="#3D5AFE" />
          </Pressable>
        </View>


        {/* BOTÓN ABRIR */}
        <TouchableOpacity style={styles.openButton} onPress={handleOpenCapsule} disabled={isOpening || modalVisible}>
          <Text style={styles.openButtonText}>Abrir cápsula</Text>
        </TouchableOpacity>

        {/* show validation message under button */}
        {validationMessage ? (
          <Text style={styles.validationMessage}>{validationMessage}</Text>
        ) : null}
      </ScrollView>

      {/* REVEAL MODAL con BLUR */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => { }}>
        <View style={styles.modalWrapper}>
          <BlurView intensity={80} tint="light" style={styles.blurOverlay} />

          <View style={styles.modalContent}>
            {modalLoading && (
              <View style={styles.modalLoader}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: "#fff", marginTop: 12 }}>Abriendo cápsula...</Text>
              </View>
            )}

            <Video
              ref={openingVideoRef}
              source={require("../assets/LoadingCapsule.mp4")}
              style={[styles.video, { width: screenWidth * 0.9, height: screenWidth * 0.7 }]}
              resizeMode="cover"
              shouldPlay={false}
              isLooping={false}
              isMuted={false}
              onPlaybackStatusUpdate={(status) => onVideoStatusUpdate(status)}
            />

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => {
                setModalVisible(false);
                setModalLoading(false);
                setIsOpening(false);
                setValidationMessage("");
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL PARA PIN */}
      <Modal
        visible={pinVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Ingresa el PIN
            </Text>

            <TextInput
              style={{
                width: "80%",
                height: 50,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
                paddingHorizontal: 12,
                fontSize: 20,
                textAlign: "center",
                marginBottom: 20,
              }}
              keyboardType="numeric"
              secureTextEntry
              value={pinInput}
              onChangeText={setPinInput}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#d9534f",
                  borderRadius: 10,
                }}
                onPress={() => {
                  setPinInput("");       // limpia input
                  setPinVisible(false);
                  resolverPinRef.current?.(false);
                }}

              >
                <Text style={{ color: "white", fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#3D5AFE",
                  borderRadius: 10,
                }}
                onPress={() => {
                  const pinCorrecto =
                    tipoDesbloqueoActual?.requisito_desbloqueo?.requisitoDesbloqueo?.pin;

                  //console.log("PIN CORRECTO EN MODAL:", pinCorrecto);
                  //console.log("PIN INGRESADO:", pinInput);

                  const ok = pinInput === String(pinCorrecto);

                  if (!ok) {
                    Alert.alert("PIN incorrecto");
                    setPinInput("");
                  }

                  setPinVisible(false);
                  resolverPinRef.current?.(ok);
                  setPinInput("");
                }}


              >
                <Text style={{ color: "white", fontSize: 16 }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL del menú (opciones: compartir, mapa, desbloqueo) */}
      <Modal transparent={true} visible={menuVisible} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <Pressable style={styles.menuItem}>
              <Feather name="share" size={20} color="#3D5AFE" />
              <Text style={styles.menuText}>Compartir</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Feather name="map-pin" size={20} color="#3D5AFE" />
              <Text style={styles.menuText}>Ver ubicación en mapa</Text>
            </Pressable>

            <Pressable style={styles.menuItem}>
              <Feather name="lock" size={20} color="#3D5AFE" />
              <Text style={styles.menuText}>Ver método de desbloqueo</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 16,
  },
  containerOpened: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerMoreButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  image: {
    height: 220,
    borderRadius: 14,
    resizeMode: "cover",
    backgroundColor: '#ddd'
  },
  titleRow: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardTop: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
  },
  textLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    width: 110,
    elevation: 1,
  },
  textLabelText: {
    marginLeft: 8,
    fontWeight: '600'
  },
  type: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  description: {
    marginTop: 12,
    fontSize: 20,
    color: "#333",
    lineHeight: 22,
    fontWeight: "semi-bold",

  },
  datesBox: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
  },
  dateValue: {
    fontSize: 14,
    color: "#444",
  },
  contentText: {
    fontSize: 15,
    color: "#333",
  },
  meta: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 0,
    marginTop: 20,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    paddingHorizontal: 30,
    paddingBottom: 10,
  },
  actionButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },
  openButton: {
    backgroundColor: "#3D5AFE",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  openButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  validationMessage: {
    marginTop: 10,
    color: "#d64545",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },
  menuContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    width: 210,
    borderRadius: 12,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuText: {
    fontSize: 15,
    marginLeft: 10,
    color: "#222",
  },

  /* --- REVEAL MODAL --- */
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: "92%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalLoader: {
    position: "absolute",
    zIndex: 10,
    alignItems: "center",
  },
  video: {
    borderRadius: 20,
  },
  modalClose: {
    marginTop: 12,
    backgroundColor: "#3D5AFE",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  pinInput: {
    width: "80%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    color: "#000",
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#ddd",
    alignItems: "center",
  },

  modalBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },
});
