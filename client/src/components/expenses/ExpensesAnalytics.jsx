import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";

import { BsGraphUp, BsPieChart, BsBarChart, BsCarFront } from "react-icons/bs";

import { formatCRC } from "../../utils/formatters";

import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";

const ExpensesAnalytics = ({ expenses = [], generalExpenses = [] }) => {
	const { data: exchangeData } = useQuery(GET_EXCHANGE_RATE);
	const exchangeRate = exchangeData?.exchangeRate?.value || 0;

	const analytics = useMemo(() => {
		const convertToCRC = (amount, currency) => {
			if (currency === "CRC") return amount;
			return amount * exchangeRate;
		};

		// Totales en CRC
		const totalCRC = expenses.reduce(
			(sum, e) => sum + convertToCRC(e.amount, e.currency),
			0,
		);
		const totalUSD = expenses.reduce(
			(sum, e) => (e.currency === "USD" ? sum + e.amount : sum),
			0,
		);
		const totalGeneralCRC = generalExpenses.reduce(
			(sum, e) => sum + convertToCRC(e.amount, e.currency),
			0,
		);
		const totalGeneralUSD = generalExpenses.reduce(
			(sum, e) => (e.currency === "USD" ? sum + e.amount : sum),
			0,
		);

		// Gastos por tipo (CRC)
		const byType = {};
		expenses.forEach((e) => {
			if (!byType[e.type]) byType[e.type] = 0;
			byType[e.type] += convertToCRC(e.amount, e.currency);
		});

		// Gastos por auto (CRC)
		const byCar = {};
		expenses.forEach((e) => {
			const key = e.car
				? `${e.car.carModel?.name} ${e.car.year} (${e.car.vin?.slice(-6)})`
				: "Sin auto";
			if (!byCar[key]) byCar[key] = 0;
			byCar[key] += convertToCRC(e.amount, e.currency);
		});

		// Gastos generales por concepto (CRC)
		const generalByConcept = {};
		generalExpenses.forEach((e) => {
			if (!generalByConcept[e.concept]) generalByConcept[e.concept] = 0;
			generalByConcept[e.concept] += convertToCRC(e.amount, e.currency);
		});

		// Top 5
		const topCars = Object.entries(byCar)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);
		const topTypes = Object.entries(byType)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		// Por mes (CRC)
		const byMonth = {};
		expenses.forEach((e) => {
			const date = new Date(e.expenseDate);
			const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
			if (!byMonth[key]) byMonth[key] = 0;
			byMonth[key] += convertToCRC(e.amount, e.currency);
		});

		const monthlyData = Object.entries(byMonth)
			.sort((a, b) => a[0].localeCompare(b[0]))
			.slice(-6);
		const maxMonthly = Math.max(...monthlyData.map((d) => d[1]), 1);

		return {
			totalCRC,
			totalUSD,
			totalGeneralCRC,
			totalGeneralUSD,
			topCars,
			topTypes,
			monthlyData,
			maxMonthly,
			generalByConcept,
		};
	}, [expenses, generalExpenses, exchangeRate]);

	const statsCards = [
		{
			label: "Total gastos autos",
			value: formatCRC(analytics.totalCRC),
			icon: BsCarFront,
			color: "from-blue-500/20 to-blue-500/5",
			iconColor: "text-blue-500",
		},
		{
			label: "Total gastos generales",
			value: formatCRC(analytics.totalGeneralCRC),
			icon: BsGraphUp,
			color: "from-purple-500/20 to-purple-500/5",
			iconColor: "text-purple-500",
		},
	];

	const monthNames = {
		"01": "Ene",
		"02": "Feb",
		"03": "Mar",
		"04": "Abr",
		"05": "May",
		"06": "Jun",
		"07": "Jul",
		"08": "Ago",
		"09": "Sep",
		10: "Oct",
		11: "Nov",
		12: "Dic",
	};

	return (
		<div className="space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 text-center gap-4">
				{statsCards.map((stat) => (
					<div
						key={stat.label}
						className={`bg-linear-to-br ${stat.color} rounded-2xl border border-first/10 p-5`}
					>
						<div className="flex items-center justify-center gap-2 mb-2">
							<stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
							<span className="text-xs text-first/50">{stat.label}</span>
						</div>
						<p className="text-xl font-bold text-first">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Gastos por mes */}
				<div className="bg-main rounded-2xl border border-first/10 p-5">
					<h3 className="flex items-center gap-2 text-sm font-semibold text-first mb-4">
						<BsBarChart className="w-4 h-4 text-second" />
						Gastos por mes (últimos 6)
					</h3>
					{analytics.monthlyData.length > 0 ? (
						<div className="space-y-2">
							{analytics.monthlyData.map(([month, amount]) => {
								const [year, m] = month.split("-");
								return (
									<div key={month} className="flex items-center gap-3">
										<span className="text-xs text-first/40 w-12">
											{monthNames[m]} {year.slice(2)}
										</span>
										<div className="flex-1 bg-first/5 rounded-full h-5">
											<div
												className="bg-second h-5 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
												style={{
													width: `${(amount / analytics.maxMonthly) * 100}%`,
												}}
											>
												{amount / analytics.maxMonthly > 0.2 && (
													<span className="text-xs text-main font-medium">
														{formatCRC(amount)}
													</span>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="text-sm text-first/30 text-center py-8">Sin datos</p>
					)}
				</div>

				{/* Top 5 tipos de gasto */}
				<div className="bg-main rounded-2xl border border-first/10 p-5">
					<h3 className="flex items-center gap-2 text-sm font-semibold text-first mb-4">
						<BsPieChart className="w-4 h-4 text-second" />
						Top 5 tipos de gasto
					</h3>
					{analytics.topTypes.length > 0 ? (
						<div className="space-y-3">
							{analytics.topTypes.map(([type, typeAmount], index) => (
								<div key={type} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-lg font-bold text-first/20">
											#{index + 1}
										</span>
										<div>
											<p className="text-sm font-medium text-first truncate max-w-50">
												{type}
											</p>
										</div>
									</div>
									<p className="text-sm font-semibold text-first">
										{formatCRC(typeAmount)}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-first/30 text-center py-8">Sin datos</p>
					)}
				</div>

				{/* Top 5 autos con más gastos */}
				<div className="bg-main rounded-2xl border border-first/10 p-5">
					<h3 className="flex items-center gap-2 text-sm font-semibold text-first mb-4">
						<BsCarFront className="w-4 h-4 text-second" />
						Top 5 autos con más gastos
					</h3>
					{analytics.topCars.length > 0 ? (
						<div className="space-y-3">
							{analytics.topCars.map(([car, amount], index) => (
								<div key={car} className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-lg font-bold text-first/20">
											#{index + 1}
										</span>
										<p className="text-sm font-medium text-first truncate max-w-50">
											{car}
										</p>
									</div>
									<p className="text-sm font-semibold text-first">
										{formatCRC(amount)}
									</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-first/30 text-center py-8">Sin datos</p>
					)}
				</div>

				{/* Gastos generales por concepto */}
				<div className="bg-main rounded-2xl border border-first/10 p-5">
					<h3 className="flex items-center gap-2 text-sm font-semibold text-first mb-4">
						<BsGraphUp className="w-4 h-4 text-second" />
						Gastos generales por concepto
					</h3>
					{Object.entries(analytics.generalByConcept).length > 0 ? (
						<div className="space-y-3">
							{Object.entries(analytics.generalByConcept)
								.sort((a, b) => b[1] - a[1])
								.map(([concept, amount]) => (
									<div
										key={concept}
										className="flex items-center justify-between"
									>
										<p className="text-sm text-first truncate max-w-50">
											{concept}
										</p>
										<p className="text-sm font-semibold text-first">
											{formatCRC(amount)}
										</p>
									</div>
								))}
						</div>
					) : (
						<p className="text-sm text-first/30 text-center py-8">Sin datos</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExpensesAnalytics;
