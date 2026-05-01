import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { useParams, useNavigate } from "react-router-dom";

import { GET_CAR } from "../../graphql/queries/carQueries";

import { useAuth } from "../../context/AuthContext";
import { useWhatsApp } from "../../context/WhatsAppContext";

import ImageGallery from "./ImageGallery";
import ProfitSimulator from "./ProfitSimulator";

import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { LoadingOverlay } from "../ui/LoadingUi";
import ErrorMessage from "../ui/ErrorMessage";

import {
	BsArrowLeft,
	BsFuelPump,
	BsGear,
	BsSpeedometer2,
	BsCarFront,
	BsPalette,
	BsCalendar,
	BsFileText,
} from "react-icons/bs";

import {
	formatCRC,
	formatUSD,
	formatDate,
	formatMileage,
	getLogisticStatusText,
	getLogisticStatusColor,
	getAvailabilityColor,
	getDetailsTranslation,
} from "../../utils/formatters";
import { GET_CAR_EXPENSES_SUMMARY } from "../../graphql/queries/expenseQueries";
import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";

const CarDetail = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { sendWhatsAppInquiry, shareVehicle } = useWhatsApp();
	const [showSimulator, setShowSimulator] = useState(false);

	const isAdmin = user?.role === "admin" || user?.role === "superadmin";

	const { data, loading, error } = useQuery(GET_CAR, {
		variables: { id },
	});

	const car = data?.car;

	const { data: expensesData } = useQuery(GET_CAR_EXPENSES_SUMMARY, {
		variables: { carId: id },
	});

	const expensesCRC = expensesData?.carExpensesSummary?.totalCRC || 0;
	const expensesUSD = expensesData?.carExpensesSummary?.totalUSD || 0;

	const { data: exchangeData } = useQuery(GET_EXCHANGE_RATE);

	const exchangeRate = exchangeData?.exchangeRate?.value || 0;

	const totalExpenses = expensesCRC + expensesUSD * exchangeRate;

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando detalles..." />;
	if (error)
		return <ErrorMessage message={error.message} centered className="pt-20" />;
	if (!car)
		return (
			<ErrorMessage message="Auto no encontrado" centered className="pt-20" />
		);

	const displayMileage = car.adjustedMileage || car.actualMileage;

	const specs = [
		{
			icon: BsFuelPump,
			label: "Combustible",
			value: getDetailsTranslation("fuelType", car.fuelType),
		},
		{
			icon: BsGear,
			label: "Transmisión",
			value: getDetailsTranslation("transmission", car.transmission),
		},
		{
			icon: BsCarFront,
			label: "Tracción",
			value: getDetailsTranslation("drivetrain", car.drivetrain),
		},
		{
			icon: BsSpeedometer2,
			label: "Millaje",
			value: formatMileage(displayMileage),
		},
		{ icon: BsCalendar, label: "Año", value: car.year },
		{ icon: BsCarFront, label: "Carrocería", value: car.bodyType },
		{
			icon: BsPalette,
			label: "Color",
			value: car.color,
			color: true,
		},
		{ icon: BsFileText, label: "Motor", value: car.engine },
	];

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Back Button */}
				<button
					onClick={() => navigate(-1)}
					className="flex items-center gap-2 text-first/50 hover:text-first mb-6 transition-colors"
				>
					<BsArrowLeft className="w-4 h-4" />
					<span className="text-sm">Volver</span>
				</button>

				{/* Header */}
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Image Gallery */}
					{car.images && car.images.length > 0 && (
						<div className="lg:w-3/5">
							<ImageGallery images={car.images} />
						</div>
					)}

					{/* Details */}
					<div
						className={`${car.images && car.images.length > 0 ? "lg:w-2/5" : "lg:w-full"} space-y-6`}
					>
						{/* Title & Status */}
						<div>
							<div className="flex items-center gap-2 mb-2">
								<Badge
									className={getLogisticStatusColor(car.logisticStatus)}
									size="sm"
								>
									{getLogisticStatusText(car.logisticStatus)}
								</Badge>
								<Badge
									className={getAvailabilityColor(car.availability)}
									size="sm"
								>
									{getDetailsTranslation("availability", car.availability)}
								</Badge>
							</div>
							<h1 className="text-3xl font-bold text-first">
								{car.brand?.name} {car.carModel?.name}
							</h1>
							<p className="text-first/40 mt-1">{car.year}</p>
						</div>

						{/* Price */}
						<div className="bg-second/5 rounded-2xl p-6">
							<p className="text-sm text-first/50 mb-1">Precio</p>
							<p className="text-3xl font-bold text-second">
								{formatCRC(car.publishedPriceCRC)}
							</p>
							{car.finalSalePriceCRC && car.availability === "Sold" && (
								<p className="text-sm text-success mt-2">
									Vendido por: {formatCRC(car.finalSalePriceCRC)}
								</p>
							)}
						</div>

						{/* Actions */}
						<div className="flex gap-2">
							{!isAdmin && car.availability === "Available" && (
								<Button
									variant="secondary"
									size="lg"
									fullWidth
									onClick={() => sendWhatsAppInquiry(car)}
								>
									Consultar por WhatsApp
								</Button>
							)}
							<Button
								variant="primary"
								size="lg"
								fullWidth
								onClick={() => shareVehicle(car)}
								aria-label="Compartir"
							>
								Compartir
							</Button>
							{isAdmin && (
								<Button
									variant="primary"
									size="lg"
									fullWidth
									onClick={() => setShowSimulator(!showSimulator)}
								>
									{showSimulator
										? "Ocultar simulador"
										: "Simulador de ganancia"}
								</Button>
							)}
						</div>

						{/* Specs Grid */}
						<div className="grid grid-cols-2 gap-3">
							{specs.map((spec) => (
								<div
									key={spec.label}
									className="flex items-center gap-3 p-3 bg-first/5 rounded-xl"
								>
									<spec.icon className="w-5 h-5 text-first/40 shrink-0" />
									<div>
										<p className="text-xs text-first/40">{spec.label}</p>
										<p className="text-sm font-medium text-first">
											{spec.value}
										</p>
									</div>
								</div>
							))}
						</div>

						{/* Description */}
						{car.description && (
							<div>
								<h3 className="text-sm font-semibold text-first mb-2">
									Descripción
								</h3>
								<p className="text-sm text-first/60 leading-relaxed">
									{car.description}
								</p>
							</div>
						)}

						{/* Admin Only Info */}
						{isAdmin && (
							<div className="border-t border-first/10 pt-4 space-y-3">
								<h3 className="text-sm font-semibold text-first">
									Información Administrativa
								</h3>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<p className="text-first/40">VIN</p>
									<p className="text-first font-mono">{car.vin}</p>
									<p className="text-first/40">DUA</p>
									<p className="text-first font-mono">{car.dua}</p>
									<p className="text-first/40">Compra USA</p>
									<p className="text-first">{formatDate(car.purchaseDate)}</p>
									<p className="text-first/40">Valor compra</p>
									<p className="text-first">
										{formatUSD(car.purchaseValueUSD)}
									</p>
									<p className="text-first/40">Valor factura</p>
									<p className="text-first">{formatUSD(car.invoiceValueUSD)}</p>
									<p className="text-first/40">Dueño</p>
									<p className="text-first">{car.owner}</p>
									{car.saleDate && (
										<>
											<p className="text-first/40">Fecha venta</p>
											<p className="text-first">{formatDate(car.saleDate)}</p>
										</>
									)}
									{car.buyerName && (
										<>
											<p className="text-first/40">Comprador</p>
											<p className="text-first">{car.buyerName}</p>
										</>
									)}
									<p className="text-first/40">Gastos totales:</p>
									<p className="text-first">{formatCRC(totalExpenses)}</p>
								</div>

								{/* Profit */}
								{car.profitCRC !== null && car.profitCRC !== undefined && (
									<div
										className={`p-4 rounded-xl ${car.profitCRC >= 0 ? "bg-success/5" : "bg-error/5"}`}
									>
										<p className="text-center text-sm text-first/40">
											{car.profitCRC >= 0 ? "Ganancia" : "Perdida"}
										</p>
										<p
											className={`text-xl text-center font-bold ${car.profitCRC >= 0 ? "text-success" : "text-error"}`}
										>
											{formatCRC(car.profitCRC)}
										</p>
									</div>
								)}
							</div>
						)}

						{/* Assigned Client */}
						{isAdmin && car.assignedClient && (
							<div className="border-t border-first/10 pt-4">
								<h3 className="text-sm font-semibold text-first mb-2">
									Cliente asignado
								</h3>
								<div className="flex items-center gap-3 p-3 bg-first/5 rounded-xl">
									<div className="w-10 h-10 rounded-full bg-second/10 flex items-center justify-center">
										<span className="text-sm font-semibold text-second">
											{car.assignedClient.name.charAt(0)}
										</span>
									</div>
									<div>
										<p className="text-sm font-medium text-first">
											{car.assignedClient.name}
										</p>
										<p className="text-xs text-first/40">
											{car.assignedClient.email}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Profit Simulator Modal */}
				{showSimulator && isAdmin && (
					<div className="mt-8">
						<ProfitSimulator car={car} />
					</div>
				)}
			</div>
		</div>
	);
};

export default CarDetail;
