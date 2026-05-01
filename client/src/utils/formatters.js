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
		// Extraer año, mes, día directamente del string para evitar problemas de zona horaria
		const match = date.toString().match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (match) {
			const [, year, month, day] = match;
			return new Intl.DateTimeFormat("es-CR", {
				year: "numeric",
				month: "long",
				day: "numeric",
				timeZone: "UTC",
			}).format(new Date(`${year}-${month}-${day}T00:00:00Z`));
		}

		// Fallback para otros formatos
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

	try {
		const match = date.toString().match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (match) {
			const [, year, month, day] = match;
			return `${day}/${month}/${year}`;
		}

		return new Intl.DateTimeFormat("es-CR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date(date));
	} catch {
		return "—";
	}
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

	const text = texts[status] || status;

	return status === "Available for direct sale"
		? text.slice(-14).replace("v", (str) => str.toUpperCase())
		: text;
};

/**
 * Obtener texto traducido de disponibilidad
 * @param {string} availability - Disponibilidad
 * @returns {string} - Texto traducido
 */
export const getDetailsTranslation = (detailType, detail) => {
	if (!detail) return "-";

	const translation = {
		expenseType: {
			"Car purchase": "Compra del auto",
			Inspection: "Inspección",
			"Tow truck": "Grúa",
			"Mileage adjustment in USA": "Ajuste de millaje en USA",
			"Mileage adjustment in CR": "Ajuste de millaje en CR",
			Taxes: "Impuestos",
			Warehouse: "Almacén",
			VAT: "IVA",
			"Seller commission": "Comisión de venta",
			"Car registration": "Inscripción",
			Fuel: "Combustible",
			Repairs: "Reparaciones",
			"Spare parts": "Repuestos",
			"Shipping line": "Naviera",
			"Other Juan Carlos expenses": "Otros gastos Juan Carlos",
			"Other expenses": "Otros gastos",
		},
		availability: {
			Available: "Disponible",
			Reserved: "Reservado",
			"Under repair": "En reparación",
			Sold: "Vendido",
		},
		fuelType: {
			Gasoline: "Gasolina",
			Diesel: "Diésel",
			Electric: "Eléctrico",
			Hybrid: "Híbrido",
			Other: "Otro",
		},
		transmission: { Automatic: "Automática", Manual: "Manual" },
		drivetrain: {
			Front: "Delantera",
			Rear: "Trasera",
			"4x4": "4x4",
		},
		bodyType: {
			SUV: "SUV",
			Sedan: "Sedán",
			"Pick-up": "Pick-up",
			Hatchback: "Hatchback",
			Coupe: "Coupé",
			Convertible: "Convertible",
			Van: "Van",
			Other: "Otro",
		},
	};
	return translation[detailType]?.[detail] || detail;
};
