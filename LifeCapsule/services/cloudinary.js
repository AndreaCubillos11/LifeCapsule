// 📄 services/cloudinary.js
import axios from "axios";

const CLOUDINARY_IMAGE_URL = "https://api.cloudinary.com/v1_1/dfaqsp0j1/image/upload";
const CLOUDINARY_VIDEO_URL = "https://api.cloudinary.com/v1_1/dfaqsp0j1/video/upload";
const UPLOAD_PRESET = "Tiendas Dione";

// 🔹 Subir imagen
export const uploadImageToCloudinary = async (imageUri) => {
    try {
        let formData = new FormData();
        formData.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "upload.jpg",
        });
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await axios.post(CLOUDINARY_IMAGE_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data.secure_url;
    } catch (error) {
        console.error("Error subiendo imagen:", error);
        throw error;
    }
};

// 🔹 Subir video
export const uploadVideoToCloudinary = async (videoUri) => {
    try {
        let formData = new FormData();
        formData.append("file", {
            uri: videoUri,
            type: "video/mp4", // o el formato correspondiente
            name: "video.mp4",
        });
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await axios.post(CLOUDINARY_VIDEO_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data.secure_url;
    } catch (error) {
        console.error("Error subiendo video:", error);
        throw error;
    }
};
