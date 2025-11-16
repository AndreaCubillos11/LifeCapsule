import { db } from './firebaseconfig';
import { collection, doc, setDoc, serverTimestamp, GeoPoint,updateDoc,query, where,getDocs,addDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

/**
 * Guarda una cápsula en Firestore, tomando automáticamente
 * el ID del usuario desde AsyncStorage y la ubicación actual del dispositivo.
 * 
 * @param {Object} capsuleData - Datos adicionales de la cápsula.
 * @param {string} capsuleData.titulo - Título de la cápsula.
 * @param {string} capsuleData.tipo_capsula - Tipo de cápsula.
 * @param {string} capsuleData.id_tipoDesbloqueo - ID del tipo de desbloqueo.
 * @param {boolean} capsuleData.isFavorite - Si es favorita.
 * @param {string} capsuleData.descripcion - Descripción.
 * @param {Array<string>} capsuleData.Multimedia - Links de Cloudinary.
 * @param {Date} capsuleData.Fecha_Apertura - Fecha de apertura.
 */





export const crearCapsula = async (capsuleData) => {
    try {
        // 🔹 1. Obtener UID del usuario almacenado en AsyncStorage
        const uid = await AsyncStorage.getItem('userUID');
        if (!uid) throw new Error('No se encontró el UID del usuario en AsyncStorage.');

        // 🔹 2. Pedir permisos de ubicación
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permiso de ubicación denegado.');
        }

        // 🔹 3. Obtener ubicación actual del dispositivo
        const location = await Location.getCurrentPositionAsync({});
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        // 🔹 4. Crear documento en Firestore
        const newDocRef = doc(collection(db, 'Capsulas'));
        const idCapsula = newDocRef.id; // ID del documento

        const dataToSave = {
            IdCapsula: idCapsula,
            titulo: capsuleData.titulo || '',
            tipo_capsula: capsuleData.tipo_capsula || '',
            id_usuario: uid,
            id_tipoDesbloqueo: capsuleData.id_tipoDesbloqueo || '',
            isFavorite: capsuleData.isFavorite ?? false,
            ubicacion_creacion: new GeoPoint(latitude, longitude),
            descripcion: capsuleData.descripcion || '',
            Multimedia: capsuleData.Multimedia || [],
            Fecha_Apertura: capsuleData.Fecha_Apertura ? new Date(capsuleData.Fecha_Apertura) : null,
            Fecha_Creacion: serverTimestamp(),
        };

        await setDoc(newDocRef, dataToSave);

        console.log('✅ Cápsula creada con éxito:', idCapsula);
        return idCapsula;
    } catch (error) {
        console.error('❌ Error al crear la cápsula:', error.message);
        throw error;
    }
};

/**
 * 🔹 Obtiene todas las cápsulas creadas por el usuario logueado.
 * @returns {Promise<Array>} Lista de cápsulas del usuario.
 */
export const obtenerCapsulasPorUsuario = async () => {
    try {
        const uid = await AsyncStorage.getItem('userUID');
        if (!uid) throw new Error('No se encontró el UID del usuario.');

        const q = query(collection(db, 'Capsulas'), where('id_usuario', '==', uid));
        const querySnapshot = await getDocs(q);

        const capsulas = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        //console.log(`✅ Se encontraron ${capsulas.length} cápsulas del usuario.`);
        return capsulas;
    } catch (error) {
        console.error('❌ Error al obtener cápsulas del usuario:', error.message);
        throw error;
    }
};

/**
 * 🔹 Obtiene las cápsulas favoritas del usuario logueado.
 * @returns {Promise<Array>} Lista de cápsulas favoritas del usuario.
 */
export const obtenerCapsulasFavoritasPorUsuario = async () => {
    try {
        const uid = await AsyncStorage.getItem('userUID');
        if (!uid) throw new Error('No se encontró el UID del usuario.');

        const q = query(
            collection(db, 'Capsulas'),
            where('id_usuario', '==', uid),
            where('isFavorite', '==', true)
        );

        const querySnapshot = await getDocs(q);

        const capsulasFavoritas = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        console.log(`⭐ Se encontraron ${capsulasFavoritas.length} cápsulas favoritas.`);
        return capsulasFavoritas;
    } catch (error) {
        console.error('❌ Error al obtener cápsulas favoritas:', error.message);
        throw error;
    }
};

/**
 * 🔹 Actualiza el estado de "favorita" de una cápsula específica.
 * 
 * @param {string} idCapsula - ID del documento de la cápsula.
 * @param {boolean} nuevoEstado - Nuevo valor para isFavorite (true o false).
 * @returns {Promise<void>}
 */
export const actualizarEstadoFavorita = async (idCapsula, nuevoEstado) => {
    try {
        if (!idCapsula) throw new Error('El ID de la cápsula es obligatorio.');

        const capsulaRef = doc(db, 'Capsulas', idCapsula);
        await updateDoc(capsulaRef, { isFavorite: nuevoEstado });

        console.log(`⭐ Cápsula ${idCapsula} actualizada como favorita: ${nuevoEstado}`);
    } catch (error) {
        console.error('❌ Error al actualizar estado de favorita:', error.message);
        throw error;
    }
};
