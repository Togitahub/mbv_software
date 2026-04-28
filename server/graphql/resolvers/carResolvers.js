import Car from "../../models/Car.js";
import User from "../../models/User.js";
import Expense from "../../models/Expense.js";
import CompanyBalance from "../../models/CompanyBalance.js";

import {
	deleteImages,
	deleteImage,
	extractPublicId,
} from "../../config/cloudinary.js";

import { calculateCarProfit } from "../../utils/profitCalculator.js";

const carResolvers = {
	Query: {
		cars: async (
			_,
			{
				page = 1,
				limit = 12,
				filters = {},
				sortBy = "creationDate",
				sortOrder = "desc",
			},
			{ user },
		) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const query = buildCarQuery(filters);

			const sortOptions = {};
			sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

			const totalCount = await Car.countDocuments(query);
			const totalPages = Math.ceil(totalCount / limit);

			const cars = await Car.find(query)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses")
				.sort(sortOptions)
				.skip((page - 1) * limit)
				.limit(limit);

			return {
				cars,
				totalCount,
				totalPages,
				currentPage: page,
			};
		},

		car: async (_, { id }, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");

			const car = await Car.findById(id)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses");

			if (!car) throw new Error("Car not found");

			// Check permissions for client users
			if (user.role === "client") {
				if (
					car.assignedClient &&
					car.assignedClient._id.toString() !== user._id.toString()
				) {
					throw new Error("Not authorized");
				}
				if (!car.assignedClient && car.availability !== "Available") {
					throw new Error("Not authorized");
				}
			}

			return car;
		},

		publicCars: async (
			_,
			{
				page = 1,
				limit = 12,
				filters = {},
				sortBy = "creationDate",
				sortOrder = "desc",
			},
		) => {
			const query = {
				...buildCarQuery(filters),
				availability: "Available",
				owner: { $ne: "Dave" },
			};

			const sortOptions = {};
			sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

			const totalCount = await Car.countDocuments(query);
			const totalPages = Math.ceil(totalCount / limit);

			const cars = await Car.find(query)
				.populate("brand")
				.populate("carModel")
				.sort(sortOptions)
				.skip((page - 1) * limit)
				.limit(limit);

			return {
				cars,
				totalCount,
				totalPages,
				currentPage: page,
			};
		},

		myCars: async (_, __, { user }) => {
			if (!user) throw new Error("UNAUTHENTICATED");

			return Car.find({ assignedClient: user._id })
				.populate("brand")
				.populate("carModel")
				.populate("expenses")
				.sort({ creationDate: -1 });
		},
	},

	Mutation: {
		createCar: async (_, { input, expenseInputs = [] }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			// Set default values
			const carData = {
				...input,
				logisticStatus: input.logisticStatus || "In transit",
				availability: input.availability || "Available",
				owner: input.owner || "MBV",
			};

			// If owner is Client, set assignedClient and availability
			if (carData.owner === "Client" && input.assignedClient) {
				carData.assignedClient = input.assignedClient;
				carData.availability = "Reserved";
			}

			const car = await Car.create(carData);

			// Create mandatory expenses (Shipping line, Inspection, Tow truck)
			const mandatoryExpenses = expenseInputs.filter((exp) =>
				["Shipping line", "Inspection", "Tow truck"].includes(exp.type),
			);

			// If mandatory expenses weren't provided in expenseInputs, create them with basic data
			const requiredTypes = ["Shipping line", "Inspection", "Tow truck"];
			const providedTypes = mandatoryExpenses.map((exp) => exp.type);

			for (const type of requiredTypes) {
				if (!providedTypes.includes(type)) {
					mandatoryExpenses.push({
						car: car._id,
						type,
						amount: 0,
						currency: type === "Shipping line" ? "CRC" : "USD",
						expenseDate: new Date().toISOString(),
						isFromJuanCarlos: type !== "Shipping line",
					});
				}
			}

			// Create all mandatory expenses
			for (const expenseData of mandatoryExpenses) {
				await Expense.create({
					...expenseData,
					car: car._id,
				});
			}

			// Create optional expenses if provided
			const optionalExpenses = expenseInputs.filter(
				(exp) =>
					!["Shipping line", "Inspection", "Tow truck"].includes(exp.type),
			);

			for (const expenseData of optionalExpenses) {
				await Expense.create({
					...expenseData,
					car: car._id,
				});
			}

			// Update car with expense references
			const allExpenses = await Expense.find({ car: car._id });
			car.expenses = allExpenses.map((exp) => exp._id);
			await car.save();

			// If owner is Client, add car to client's commissionedCars
			if (carData.owner === "Client" && input.assignedClient) {
				await User.findByIdAndUpdate(input.assignedClient, {
					$addToSet: { commissionedCars: car._id },
				});
			}

			return Car.findById(car._id)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses");
		},

		updateCar: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(id);
			if (!car) throw new Error("Car not found");

			// Block updates if car is sold
			if (car.availability === "Sold") {
				throw new Error("Cannot update a sold car");
			}

			// Handle logistic status changes and set corresponding dates
			if (input.logisticStatus && input.logisticStatus !== car.logisticStatus) {
				switch (input.logisticStatus) {
					case "In transit":
						input.departureFloridaDate = new Date().toISOString();
						break;
					case "In warehouse":
						input.warehouseArrivalDate = new Date().toISOString();
						break;
					case "Dekra pending":
						input.dekraPendingDate = new Date().toISOString();
						break;
					case "Available for direct sale":
						input.availableForSaleDate = new Date().toISOString();
						break;
				}
			}

			// Handle availability changes
			if (input.availability && input.availability !== car.availability) {
				if (input.availability === "Under repair" && !input.repairDate) {
					input.repairDate = new Date().toISOString();
				}
				if (input.availability === "Reserved" && !car.assignedClient) {
					throw new Error("Cannot reserve a car without an assigned client");
				}
			}

			const updatedCar = await Car.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses");

			if (!updatedCar) throw new Error("Car not found");
			return updatedCar;
		},

		deleteCar: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(id);
			if (!car) throw new Error("Car not found");

			// Delete associated images from Cloudinary
			if (car.images && car.images.length > 0) {
				await deleteImages(car.images);
			}

			// Delete associated expenses
			await Expense.deleteMany({ car: id });

			// Remove car from client's commissionedCars if assigned
			if (car.assignedClient) {
				await User.findByIdAndUpdate(car.assignedClient, {
					$pull: { commissionedCars: id },
				});
			}

			await Car.findByIdAndDelete(id);
			return true;
		},

		bulkUpdateCars: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const updateData = {};
			if (input.logisticStatus)
				updateData.logisticStatus = input.logisticStatus;
			if (input.availability) updateData.availability = input.availability;
			if (input.duaRegistrationDate)
				updateData.duaRegistrationDate = input.duaRegistrationDate;

			await Car.updateMany(
				{ _id: { $in: input.carIds } },
				{ $set: updateData },
			);

			return true;
		},

		markCarAsSold: async (
			_,
			{ id, finalSalePriceCRC, saleDate, buyerName },
			{ user },
		) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(id);
			if (!car) throw new Error("Car not found");

			if (car.availability === "Sold") {
				throw new Error("Car is already sold");
			}

			// Delete images from Cloudinary
			if (car.images && car.images.length > 0) {
				await deleteImages(car.images);
			}

			// Update car as sold
			const updatedCar = await Car.findByIdAndUpdate(
				id,
				{
					$set: {
						availability: "Sold",
						finalSalePriceCRC,
						saleDate: saleDate || new Date().toISOString(),
						buyerName: buyerName || undefined,
						images: [],
					},
				},
				{ new: true },
			)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses");

			const balance = await CompanyBalance.findOne();
			if (balance) {
				balance.currentBalance += finalSalePriceCRC;
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return updatedCar;
		},

		uploadCarImages: async (_, { id, images }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(id);
			if (!car) throw new Error("Car not found");

			if (car.availability === "Sold") {
				throw new Error("Cannot add images to a sold car");
			}

			const currentImages = car.images || [];
			const newTotal = currentImages.length + images.length;

			if (newTotal > 8) {
				throw new Error("Maximum 8 images allowed");
			}

			const updatedCar = await Car.findByIdAndUpdate(
				id,
				{ $push: { images: { $each: images } } },
				{ new: true },
			)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses");

			return updatedCar;
		},

		deleteCarImage: async (_, { id, imageUrl }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(id);
			if (!car) throw new Error("Car not found");

			// Delete from Cloudinary
			const publicId = extractPublicId(imageUrl);
			if (publicId) {
				await deleteImage(publicId);
			}

			// Remove from array
			const updatedCar = await Car.findByIdAndUpdate(
				id,
				{ $pull: { images: imageUrl } },
				{ new: true },
			)
				.populate("brand")
				.populate("carModel")
				.populate("assignedClient")
				.populate("expenses");

			return updatedCar;
		},
	},

	Car: {
		profitCRC: async (car) => {
			const expenses = await Expense.find({ car: car._id });
			return calculateCarProfit(car, expenses);
		},
		purchaseDate: (car) => car.purchaseDate?.toISOString?.() ?? null,
		saleDate: (car) => car.saleDate?.toISOString?.() ?? null,
		duaRegistrationDate: (car) =>
			car.duaRegistrationDate?.toISOString?.() ?? null,
		creationDate: (car) => car.creationDate?.toISOString?.() ?? null,
		updateDate: (car) => car.updateDate?.toISOString?.() ?? null,
		departureFloridaDate: (car) =>
			car.departureFloridaDate?.toISOString?.() ?? null,
		warehouseArrivalDate: (car) =>
			car.warehouseArrivalDate?.toISOString?.() ?? null,
		dekraPendingDate: (car) => car.dekraPendingDate?.toISOString?.() ?? null,
		availableForSaleDate: (car) =>
			car.availableForSaleDate?.toISOString?.() ?? null,
		repairDate: (car) => car.repairDate?.toISOString?.() ?? null,
	},
};

// Helper function to build query filters
function buildCarQuery(filters) {
	const query = {};

	if (filters.brand) query.brand = filters.brand;
	if (filters.carModel) query.carModel = filters.carModel;
	if (filters.year) query.year = filters.year;
	if (filters.bodyType) query.bodyType = filters.bodyType;
	if (filters.transmission) query.transmission = filters.transmission;
	if (filters.drivetrain) query.drivetrain = filters.drivetrain;
	if (filters.fuelType) query.fuelType = filters.fuelType;
	if (filters.color) query.color = filters.color;
	if (filters.logisticStatus) query.logisticStatus = filters.logisticStatus;
	if (filters.availability) query.availability = filters.availability;
	if (filters.owner) query.owner = filters.owner;

	if (filters.minPrice || filters.maxPrice) {
		query.publishedPriceCRC = {};
		if (filters.minPrice) query.publishedPriceCRC.$gte = filters.minPrice;
		if (filters.maxPrice) query.publishedPriceCRC.$lte = filters.maxPrice;
	}

	if (filters.minYear || filters.maxYear) {
		query.year = {};
		if (filters.minYear) query.year.$gte = filters.minYear;
		if (filters.maxYear) query.year.$lte = filters.maxYear;
	}

	if (filters.search) {
		query.$or = [
			{ vin: { $regex: filters.search, $options: "i" } },
			{ dua: { $regex: filters.search, $options: "i" } },
			{ color: { $regex: filters.search, $options: "i" } },
			{ description: { $regex: filters.search, $options: "i" } },
		];
	}

	return query;
}

export default carResolvers;
