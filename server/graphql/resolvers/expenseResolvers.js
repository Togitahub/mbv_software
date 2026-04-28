import CompanyBalance from "../../models/CompanyBalance.js";
import Expense from "../../models/Expense.js";
import Car from "../../models/Car.js";

import { getCurrentExchangeRate } from "../../utils/currencyConverter.js";

const expenseResolvers = {
	Query: {
		expenses: async (
			_,
			{ carId, isFromJuanCarlos, type, page, limit },
			{ user },
		) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const query = {};
			if (carId) query.car = carId;
			if (isFromJuanCarlos !== undefined)
				query.isFromJuanCarlos = isFromJuanCarlos;
			if (type) query.type = type;

			let expensesQuery = Expense.find(query)
				.populate({
					path: "car",
					populate: {
						path: "brand",
					},
				})
				.populate({
					path: "car",
					populate: {
						path: "carModel",
					},
				})
				.sort({ expenseDate: -1 });

			if (page && limit) {
				expensesQuery = expensesQuery.skip((page - 1) * limit).limit(limit);
			}

			return expensesQuery;
		},

		expense: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			return Expense.findById(id).populate("car");
		},

		carExpensesSummary: async (_, { carId }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expenses = await Expense.find({ car: carId });

			let totalUSD = 0;
			let totalCRC = 0;

			for (const expense of expenses) {
				if (expense.currency === "USD") {
					totalUSD += expense.amount;
				} else {
					totalCRC += expense.amount;
				}
			}

			return {
				totalUSD,
				totalCRC,
				expenses,
			};
		},
	},

	Mutation: {
		createExpense: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const car = await Car.findById(input.car);
			if (!car) throw new Error("Car not found");

			if (car.availability === "Sold") {
				throw new Error("Cannot add expenses to a sold car");
			}

			const expense = await Expense.create(input);

			// Add expense to car's expenses array
			await Car.findByIdAndUpdate(input.car, {
				$addToSet: { expenses: expense._id },
			});

			// Update CompanyBalance if it's a non-JC expense
			if (!input.isFromJuanCarlos) {
				const balance = await CompanyBalance.findOne();
				if (balance) {
					if (input.currency === "CRC") {
						balance.currentBalance -= input.amount;
					} else {
						const rate = await getCurrentExchangeRate();
						balance.currentBalance -= input.amount * rate;
					}
					balance.lastUpdated = new Date();
					balance.updatedBy = user._id;
					await balance.save();
				}
			}

			return Expense.findById(expense._id).populate({
				path: "car",
				populate: [{ path: "brand" }, { path: "carModel" }],
			});
		},

		updateExpense: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await Expense.findById(id);
			if (!expense) throw new Error("Expense not found");

			const car = await Car.findById(expense.car);
			if (car && car.availability === "Sold") {
				throw new Error("Cannot update expenses of a sold car");
			}

			if (input.receipt === "" || input.receipt === undefined) {
				input.receipt = null;
			}

			const updatedExpense = await Expense.findByIdAndUpdate(
				id,
				{ $set: input },
				{ new: true, runValidators: true },
			).populate({
				path: "car",
				populate: [{ path: "brand" }, { path: "carModel" }],
			});

			return updatedExpense;
		},

		deleteExpense: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const expense = await Expense.findById(id);
			if (!expense) throw new Error("Expense not found");

			const car = await Car.findById(expense.car);
			if (car && car.availability === "Sold") {
				throw new Error("Cannot delete expenses from a sold car");
			}

			// Remove expense reference from car
			if (car) {
				await Car.findByIdAndUpdate(car._id, {
					$pull: { expenses: id },
				});
			}

			await Expense.findByIdAndDelete(id);
			return true;
		},
	},

	Expense: {
		expenseDate: (expense) => {
			return expense.expenseDate?.toISOString?.() ?? null;
		},
		createdAt: (expense) => {
			return expense.createdAt?.toISOString?.() ?? null;
		},
	},
};

export default expenseResolvers;
