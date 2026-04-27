/**
 * Subir imagen a Cloudinary usando el endpoint del servidor
 * @param {File} file - Archivo de imagen
 * @param {string} folder - Carpeta en Cloudinary (default: "vehicles")
 * @returns {Promise<string>} - URL de la imagen subida
 */
export const uploadImage = async (file, folder = "vehicles") => {
	try {
		const serverUrl = import.meta.env.VITE_API_URI || "http://localhost:4000";

		// Obtener firma del servidor
		const signatureResponse = await fetch(
			`${serverUrl}/api/cloudinary-signature`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fileType: file.type,
					fileSize: file.size,
					folder,
				}),
			},
		);

		if (!signatureResponse.ok) {
			const error = await signatureResponse.json();
			throw new Error(error.error || "Error al obtener firma");
		}

		const signatureData = await signatureResponse.json();

		// Subir a Cloudinary
		const formData = new FormData();
		formData.append("file", file);
		formData.append("api_key", signatureData.apiKey);
		formData.append("timestamp", signatureData.timestamp);
		formData.append("signature", signatureData.signature);
		formData.append("folder", signatureData.folder);
		formData.append("eager", signatureData.eager);
		formData.append("eager_async", "true");

		const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

		const uploadResponse = await fetch(cloudinaryUrl, {
			method: "POST",
			body: formData,
		});

		if (!uploadResponse.ok) {
			throw new Error("Error al subir imagen");
		}

		const uploadData = await uploadResponse.json();
		return uploadData.secure_url;
	} catch (error) {
		console.error("Error uploading image:", error);
		throw error;
	}
};

/**
 * Eliminar imagen de Cloudinary
 * @param {string} url - URL de la imagen a eliminar
 * @returns {Promise<boolean>} - True si se eliminó correctamente
 */
export const deleteImage = async (url) => {
	try {
		const serverUrl = import.meta.env.VITE_API_URI || "http://localhost:4000";

		const response = await fetch(`${serverUrl}/api/cloudinary-delete`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url }),
		});

		if (!response.ok) {
			throw new Error("Error al eliminar imagen");
		}

		return true;
	} catch (error) {
		console.error("Error deleting image:", error);
		throw error;
	}
};

/**
 * Validar archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateImage = (file) => {
	const ALLOWED_TYPES = [
		"image/webp",
		"image/png",
		"image/jpg",
		"image/jpeg",
		"image/avif",
	];
	const MAX_SIZE = 5 * 1024 * 1024; // 5MB

	if (!ALLOWED_TYPES.includes(file.type)) {
		return {
			valid: false,
			error: "Tipo de archivo no permitido. Use WebP, PNG, JPG o AVIF",
		};
	}

	if (file.size > MAX_SIZE) {
		return {
			valid: false,
			error: "El archivo supera el límite de 5MB",
		};
	}

	return { valid: true, error: null };
};
