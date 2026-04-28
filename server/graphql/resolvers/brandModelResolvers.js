import Brand from "../../models/Brand.js";
import CarModel from "../../models/CarModel.js";

const brandModelResolvers = {
	Query: {
		brands: async () => {
			return Brand.find({}).sort({ name: 1 }).populate("createdBy");
		},

		brand: async (_, { id }) => {
			return Brand.findById(id).populate("createdBy");
		},

		carModels: async (_, { brandId }) => {
			const filter = brandId ? { brand: brandId } : {};
			return CarModel.find(filter).populate("brand").sort({ name: 1 });
		},

		carModel: async (_, { id }) => {
			return CarModel.findById(id).populate("brand").populate("createdBy");
		},
	},

	Mutation: {
		createBrand: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const existingBrand = await Brand.findOne({
				name: input.name.toUpperCase(),
			});
			if (existingBrand) throw new Error("Brand already exists");

			return Brand.create({
				name: input.name.toUpperCase(),
				createdBy: user._id,
			});
		},

		updateBrand: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const brand = await Brand.findByIdAndUpdate(
				id,
				{ name: input.name.toUpperCase() },
				{ new: true, runValidators: true },
			).populate("createdBy");

			if (!brand) throw new Error("Brand not found");
			return brand;
		},

		deleteBrand: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			// Check if any models are using this brand
			const modelsCount = await CarModel.countDocuments({ brand: id });
			if (modelsCount > 0) {
				throw new Error("Cannot delete brand with associated models");
			}

			await Brand.findByIdAndDelete(id);
			return true;
		},

		createCarModel: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const existingModel = await CarModel.findOne({
				name: input.name.toUpperCase(),
				brand: input.brand,
			});
			if (existingModel) throw new Error("Model already exists for this brand");

			const model = await CarModel.create({
				name: input.name.toUpperCase(),
				brand: input.brand,
				createdBy: user._id,
			});

			return CarModel.findById(model._id).populate("brand");
		},

		updateCarModel: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const model = await CarModel.findByIdAndUpdate(
				id,
				{
					name: input.name.toUpperCase(),
					brand: input.brand,
				},
				{ new: true, runValidators: true },
			).populate("brand");

			if (!model) throw new Error("Model not found");
			return model;
		},

		deleteCarModel: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			await CarModel.findByIdAndDelete(id);
			return true;
		},
	},
};

export default brandModelResolvers;
