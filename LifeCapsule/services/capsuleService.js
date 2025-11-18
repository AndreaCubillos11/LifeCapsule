import { db } from './firebaseconfig';
import { collection, doc, setDoc, serverTimestamp, GeoPoint, updateDoc, query, where, getDocs, addDoc, getDoc } from 'firebase/firestore';
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
* @param {string|null} [capsuleData.texto=null] - Texto opcional de la cápsula, puede ser nulo.
*/
export const crearCapsula = async (capsuleData) => {
    try {
        const uid = await AsyncStorage.getItem('userUID');
        if (!uid) throw new Error('No se encontró el UID del usuario en AsyncStorage.');

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Permiso de ubicación denegado.');

        const location = await Location.getCurrentPositionAsync({});
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        const newDocRef = doc(collection(db, 'Capsulas'));
        const idCapsula = newDocRef.id;

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
            texto: capsuleData.texto ?? null, // <-- nuevo campo
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

        const capsulas = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                texto: data.texto ?? null, // <-- asegura que siempre exista la propiedad
            };
        });

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

        const capsulasFavoritas = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                texto: data.texto ?? null, // <-- asegura que siempre exista la propiedad
            };
        });

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

export const consultarCapsulaPorId = async (idCapsula) => {
    try {
        if (!idCapsula) throw new Error("No se proporcionó un ID de cápsula.");

        // 1. Referencia al documento en Firestore
        const docRef = doc(db, "Capsulas", idCapsula);

        // 2. Obtener el documento
        const docSnap = await getDoc(docRef);

        // 3. Verificar si existe
        if (!docSnap.exists()) {
            throw new Error("La cápsula no existe.");
        }

        // 4. Retornar los datos
        const data = docSnap.data();

        console.log("📄 Cápsula encontrada:", data);
        return { id: docSnap.id, ...data };

    } catch (error) {
        console.error("❌ Error al consultar la cápsula:", error.message);
        throw error;
    }
};
