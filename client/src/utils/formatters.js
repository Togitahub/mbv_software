/**
 * Formatear moneda en colones (CRC)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado
 */
export const formatCRC = (amount) => {
	if (amount === null || amount === undefined) return "₡0";

	return new Intl.NumberFormat("es-CR", {
		style: "currency",
		currency: "CRC",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

/**
 * Formatear moneda en dólares (USD)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado
 */
export const formatUSD = (amount) => {
	if (amount === null || amount === undefined) return "$0";

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

/**
 * Formatear fecha
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
	if (!date) return "—";

	try {
		const dateObj = new Date(date);
		if (isNaN(dateObj.getTime())) return "—";

		return new Intl.DateTimeFormat("es-CR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(dateObj);
	} catch {
		return "—";
	}
};

/**
 * Formatear fecha corta
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatShortDate = (date) => {
	if (!date) return "—";

	return new Intl.DateTimeFormat("es-CR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date(date));
};

/**
 * Formatear millaje
 * @param {number} mileage - Millaje
 * @returns {string} - Millaje formateado
 */
export const formatMileage = (mileage) => {
	if (mileage === null || mileage === undefined) return "—";

	return `${mileage.toLocaleString("en-US")} mi`;
};

/**
 * Formatear millaje a kilómetros
 * @param {number} mileage - Millaje en millas
 * @returns {string} - Millaje formateado en km
 */
export const formatKilometers = (mileage) => {
	if (mileage === null || mileage === undefined) return "—";

	const km = Math.round(mileage * 1.60934);
	return `${km.toLocaleString("en-US")} km`;
};

/**
 * Obtener color para estado logístico
 * @param {string} status - Estado logístico
 * @returns {string} - Clase de color
 */
export const getLogisticStatusColor = (status) => {
	const colors = {
		"In transit": "bg-blue-500/10 text-blue-500 border-blue-500/20",
		"In warehouse": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
		"Dekra pending": "bg-orange-500/10 text-orange-500 border-orange-500/20",
		"Available for direct sale":
			"bg-green-500/10 text-green-500 border-green-500/20",
	};
	return colors[status] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

/**
 * Obtener color para disponibilidad
 * @param {string} availability - Disponibilidad
 * @returns {string} - Clase de color
 */
export const getAvailabilityColor = (availability) => {
	const colors = {
		Available: "bg-success/10 text-success border-success/20",
		Reserved: "bg-warning/10 text-warning border-warning/20",
		"Under repair": "bg-info/10 text-info border-info/20",
		Sold: "bg-error/10 text-error border-error/20",
	};
	return (
		colors[availability] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
	);
};

/**
 * Obtener texto traducido del estado logístico
 * @param {string} status - Estado logístico
 * @returns {string} - Texto traducido
 */
export const getLogisticStatusText = (status) => {
	const texts = {
		"In transit": "En camino",
		"In warehouse": "En almacén",
		"Dekra pending": "Dekra pendiente",
		"Available for direct sale": "Disponible para venta directa",
	};
	return texts[status] || status;
};

/**
 * Obtener texto traducido de disponibilidad
 * @param {string} availability - Disponibilidad
 * @returns {string} - Texto traducido
 */
export const getAvailabilityText = (availability) => {
	const texts = {
		Available: "Disponible",
		Reserved: "Reservado",
		"Under repair": "En reparación",
		Sold: "Vendido",
	};
	return texts[availability] || availability;
};
