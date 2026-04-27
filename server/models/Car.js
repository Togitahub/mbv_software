import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
	// Identification and dates
	brand: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Brand",
		required: [true, "La marca es requerida"],
	},
	carModel: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "CarModel",
		required: [true, "El modelo es requerido"],
	},
	vin: {
		type: String,
		required: [true, "El VIN es requerido"],
		unique: true,
		trim: true,
		uppercase: true,
	},
	dua: {
		type: String,
		required: [true, "El DUA es requerido"],
		unique: true,
		trim: true,
	},
	year: {
		type: Number,
		required: [true, "El año es requerido"],
	},
	purchaseDate: {
		type: Date,
		required: [true, "La fecha de compra es requerida"],
	},
	saleDate: {
		type: Date,
	},
	duaRegistrationDate: {
		type: Date,
	},

	// Prices and values
	publishedPriceCRC: {
		type: Number,
		required: [true, "El precio publicado es requerido"],
		min: 0,
	},
	finalSalePriceCRC: {
		type: Number,
		min: 0,
	},
	purchaseValueUSD: {
		type: Number,
		required: [true, "El valor de compra en USD es requerido"],
		min: 0,
	},
	invoiceValueUSD: {
		type: Number,
		required: [true, "El valor de factura en USD es requerido"],
		min: 0,
	},

	// Ownership and statuses
	owner: {
		type: String,
		enum: ["MBV", "Dave", "Client"],
		default: "MBV",
	},
	assignedClient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	logisticStatus: {
		type: String,
		enum: [
			"In transit",
			"In warehouse",
			"Dekra pending",
			"Available for direct sale",
		],
		required: [true, "El estado logístico es requerido"],
	},
	availability: {
		type: String,
		enum: ["Available", "Reserved", "Under repair", "Sold"],
		required: [true, "La disponibilidad es requerida"],
	},

	// Mileage
	actualMileage: {
		type: Number,
		required: [true, "El millaje real es requerido"],
		min: 0,
	},
	adjustedMileage: {
		type: Number,
		min: 0,
	},

	// Images
	images: {
		type: [String],
		validate: {
			validator: function (arr) {
				return arr.length <= 8;
			},
			message: "Máximo 8 imágenes permitidas",
		},
	},

	// Technical specifications
	fuelType: {
		type: String,
		required: [true, "El tipo de combustible es requerido"],
		enum: ["Gasoline", "Diesel", "Electric", "Hybrid", "Other"],
	},
	engine: {
		type: String,
		required: [true, "El motor es requerido"],
		trim: true,
	},
	transmission: {
		type: String,
		required: [true, "La transmisión es requerida"],
		enum: ["Manual", "Automatic"],
	},
	drivetrain: {
		type: String,
		required: [true, "La tracción es requerida"],
		enum: ["Front", "Rear", "4x4"],
	},
	color: {
		type: String,
		required: [true, "El color es requerido"],
		trim: true,
	},
	description: {
		type: String,
		trim: true,
	},
	bodyType: {
		type: String,
		required: [true, "El tipo de carrocería es requerido"],
		enum: [
			"SUV",
			"Sedan",
			"Pick-up",
			"Hatchback",
			"Coupe",
			"Convertible",
			"Van",
			"Other",
		],
	},

	// Logistic dates
	departureFloridaDate: {
		type: Date,
	},
	warehouseArrivalDate: {
		type: Date,
	},
	dekraPendingDate: {
		type: Date,
	},
	availableForSaleDate: {
		type: Date,
	},
	repairDate: {
		type: Date,
	},

	// Buyer name (optional, when sold)
	buyerName: {
		type: String,
		trim: true,
	},

	// Relationships and audit
	expenses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Expense",
		},
	],
	creationDate: {
		type: Date,
		default: Date.now,
	},
	updateDate: {
		type: Date,
		default: Date.now,
	},
});

// Update the updateDate field before each save
carSchema.pre("save", function () {
	this.updateDate = new Date();
});

// Virtual for profit calculation
carSchema.virtual("profitCRC").get(function () {
	// This will be calculated in the resolver using the utility function
	return null;
});

const Car = mongoose.model("Car", carSchema);

export default Car;
