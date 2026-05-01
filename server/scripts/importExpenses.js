import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Car from "../models/Car.js";
import Expense from "../models/Expense.js";

const importExpenses = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("Connected to MongoDB\n");

		const csvPath = path.resolve("EXPENSES(EXPENSES V2).csv");
		const csvData = fs.readFileSync(csvPath, "utf8");

		const lines = csvData.trim().split("\n");
		const headers = lines[0].split(";");

		let imported = 0;
		let skipped = 0;

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(";");
			const row = {};

			headers.forEach((header, index) => {
				const value = values[index]?.trim();
				row[header.trim()] = value || undefined;
			});

			if (!row.vin || !row.type || !row.amount) {
				skipped++;
				continue;
			}

			try {
				const car = await Car.findOne({ vin: row.vin });
				if (!car) {
					console.log(`Car not found: ${row.vin}`);
					skipped++;
					continue;
				}

				// Convertir fecha DD/MM/YYYY a YYYY-MM-DD
				let expenseDate = row.expenseDate;
				if (expenseDate && expenseDate.includes("/")) {
					const [day, month, year] = expenseDate.split("/");
					expenseDate = `${year}-${month}-${day}`;
				}

				await Expense.create({
					car: car._id,
					type: row.type,
					description: row.description || undefined,
					amount: Number(row.amount),
					currency: row.currency || "CRC",
					expenseDate: new Date(expenseDate),
					isFromJuanCarlos: row.isFromJuanCarlos === "true",
				});

				imported++;
				console.log(
					`✅ ${row.vin}: ${row.type} - ${row.amount} ${row.currency}`,
				);
			} catch (error) {
				console.error(`❌ ${row.vin}: ${error.message}`);
			}
		}

		console.log(`\n--- Summary ---`);
		console.log(`✅ Imported: ${imported}`);
		console.log(`⏭️ Skipped: ${skipped}`);

		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
};

importExpenses();
