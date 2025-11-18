import { collection, addDoc, getDoc, getDocs, doc } from "firebase/firestore";
import { db } from "./firebaseconfig";

/**
 * Crea un nuevo tipo de desbloqueo en Firestore.
 * @param {string} nombreTipo - Tipo de desbloqueo ("Pin", "Huella", "Rostro", "Ubicacion")
 * @param {Object} requisitoDesbloqueo - Mapa con la información esperada por el tipo
 */
export const crearTipoDesbloqueo = async (nombreTipo, requisitoDesbloqueo) => {
    try {
        const docRef = await addDoc(collection(db, "Tipo_Desbloqueo"), {
            nombre_tipo: nombreTipo,
            requisito_desbloqueo: requisitoDesbloqueo
        });
        console.log("Tipo de desbloqueo creado con ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error al crear el tipo de desbloqueo:", error);
        throw error;
    }
};

/**
* Obtiene un tipo de desbloqueo específico por su ID.
* @param {string} tipoId - ID del documento en la colección Tipo_Desbloqueo.
* @returns {Promise<Object|null>} Datos del tipo de desbloqueo o null si no existe.
*/
export const obtenerTipoDesbloqueoPorId = async (tipoId) => {
    try {
        if (!tipoId) {
            console.warn("⚠ No se proporcionó un ID de tipo de desbloqueo");
            return null;
        }

        const docRef = doc(db, "Tipo_Desbloqueo", tipoId);
        const docSnap = await getDoc(docRef);   // ← AQUÍ está el fix

        if (!docSnap.exists()) {
            console.warn("No existe el tipo de desbloqueo con ID:", tipoId);
            return null;
        }

        return { id: tipoId, ...docSnap.data() };

    } catch (error) {
        console.error("Error obteniendo tipo de desbloqueo:", error);
        throw error;
    }
};
