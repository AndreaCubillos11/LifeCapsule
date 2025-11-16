import { collection, addDoc } from "firebase/firestore";
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
