import JCPayment from "../../models/JCPayment.js";
import Expense from "../../models/Expense.js";
import CompanyBalance from "../../models/CompanyBalance.js";
import { getCurrentExchangeRate } from "../../utils/currencyConverter.js";

const jcPaymentResolvers = {
	Query: {
		jcPayments: async (
			_,
			{ page, limit, startDate, endDate, carId },
			{ user },
		) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const query = {};

			if (startDate || endDate) {
				query.actualPaymentDate = {};
				if (startDate) query.actualPaymentDate.$gte = new Date(startDate);
				if (endDate) query.actualPaymentDate.$lte = new Date(endDate);
			}

			if (carId) {
				query.associatedCars = carId;
			}

			let paymentsQuery = JCPayment.find(query)
				.populate("associatedCars")
				.populate("createdBy")
				.sort({ actualPaymentDate: -1 });

			if (page && limit) {
				paymentsQuery = paymentsQuery.skip((page - 1) * limit).limit(limit);
			}

			return paymentsQuery;
		},

		jcPayment: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			return JCPayment.findById(id)
				.populate("associatedCars")
				.populate("createdBy")
				.populate("updatedBy");
		},

		jcDebtSummary: async (_, __, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			// Get all JC related expenses (what JC has invested)
			const jcExpenses = await Expense.find({ isFromJuanCarlos: true });
			const totalInvestedUSD = jcExpenses.reduce((sum, exp) => {
				return sum + (exp.currency === "USD" ? exp.amount : 0);
			}, 0);

			// Get all payments made to JC
			const payments = await JCPayment.find({})
				.populate("associatedCars")
				.populate("createdBy")
				.sort({ actualPaymentDate: -1 });

			const totalPaidUSD = payments.reduce((sum, payment) => {
				return sum + payment.amount;
			}, 0);

			const totalPendingUSD = totalInvestedUSD - totalPaidUSD;

			return {
				totalInvestedUSD,
				totalPaidUSD,
				totalPendingUSD,
				payments,
			};
		},
	},

	Mutation: {
		createJCPayment: async (_, { input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const payment = await JCPayment.create({
				...input,
				createdBy: user._id,
			});

			// Update CompanyBalance - reduce balance (real payment made)
			const balance = await CompanyBalance.findOne();
			if (balance) {
				const rate = await getCurrentExchangeRate();
				balance.currentBalance -= input.amount * rate;
				balance.lastUpdated = new Date();
				balance.updatedBy = user._id;
				await balance.save();
			}

			return JCPayment.findById(payment._id)
				.populate("associatedCars")
				.populate("createdBy");
		},

		updateJCPayment: async (_, { id, input }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const payment = await JCPayment.findById(id);
			if (!payment) throw new Error("Payment not found");

			if (!payment.updatable) {
				throw new Error("This payment cannot be updated");
			}

			if (input.receipt === "" || input.receipt === undefined) {
				input.receipt = null;
			}

			const updatedPayment = await JCPayment.findByIdAndUpdate(
				id,
				{
					$set: {
						...input,
						updatedBy: user._id,
					},
				},
				{ new: true, runValidators: true },
			)
				.populate("associatedCars")
				.populate("createdBy")
				.populate("updatedBy");

			return updatedPayment;
		},

		deleteJCPayment: async (_, { id }, { user }) => {
			if (!user || !["superadmin", "admin"].includes(user.role)) {
				throw new Error("Not authorized");
			}

			const payment = await JCPayment.findById(id);
			if (!payment) throw new Error("Payment not found");

			if (!payment.updatable) {
				throw new Error("This payment cannot be deleted");
			}

			await JCPayment.findByIdAndDelete(id);
			return true;
		},
	},
};

export default jcPaymentResolvers;
