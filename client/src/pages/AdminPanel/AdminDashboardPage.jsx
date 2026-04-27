import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "react-router-dom";
import { useState } from "react";

import {
	BsCarFront,
	BsPeople,
	BsCashStack,
	BsGraphUp,
	BsTruck,
	BsBuilding,
	BsClipboardCheck,
	BsCurrencyDollar,
	BsArrowRight,
} from "react-icons/bs";

import { GET_CARS } from "../../graphql/queries/carQueries";
import { GET_CLIENTS } from "../../graphql/queries/userQueries";
import { GET_COMPANY_BALANCE } from "../../graphql/queries/companyBalanceQueries";
import { GET_JC_DEBT_SUMMARY } from "../../graphql/queries/jcPaymentQueries";
import { GET_EXCHANGE_RATE } from "../../graphql/queries/exchangeRateQueries";

import { UPDATE_EXCHANGE_RATE } from "../../graphql/mutations/exchangeRateMutations";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import { formatCRC, formatUSD } from "../../utils/formatters";

const AdminDashboardPage = () => {
	const [showExchangeModal, setShowExchangeModal] = useState(false);
	const [newExchangeRate, setNewExchangeRate] = useState("");
	const [updatingRate, setUpdatingRate] = useState(false);

	const { data: carsData, loading: carsLoading } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});

	const { data: clientsData, loading: clientsLoading } = useQuery(GET_CLIENTS);
	const { data: balanceData, loading: balanceLoading } =
		useQuery(GET_COMPANY_BALANCE);
	const { data: jcDebtData, loading: jcDebtLoading } =
		useQuery(GET_JC_DEBT_SUMMARY);
	const { data: exchangeData } = useQuery(GET_EXCHANGE_RATE);

	const [updateExchangeRate] = useMutation(UPDATE_EXCHANGE_RATE);

	const loading =
		carsLoading || clientsLoading || balanceLoading || jcDebtLoading;

	const cars = carsData?.cars?.cars || [];
	const clients = clientsData?.clients || [];
	const companyBalance = balanceData?.companyBalance;
	const jcSummary = jcDebtData?.jcDebtSummary;
	const exchangeRate = exchangeData?.exchangeRate?.value || 0;

	const availableCars = cars.filter(
		(c) => c.availability === "Available",
	).length;
	const soldCars = cars.filter((c) => c.availability === "Sold").length;
	const reservedCars = cars.filter((c) => c.availability === "Reserved").length;
	const inRepairCars = cars.filter(
		(c) => c.availability === "Under repair",
	).length;

	const inTransit = cars.filter(
		(c) => c.logisticStatus === "In transit",
	).length;
	const inWarehouse = cars.filter(
		(c) => c.logisticStatus === "In warehouse",
	).length;
	const dekraPending = cars.filter(
		(c) => c.logisticStatus === "Dekra pending",
	).length;
	const availableForSale = cars.filter(
		(c) => c.logisticStatus === "Available for direct sale",
	).length;

	const totalSalesValue = cars
		.filter((c) => c.availability === "Sold")
		.reduce((sum, c) => sum + (c.finalSalePriceCRC || 0), 0);

	const statsCards = [
		{
			title: "Balance actual",
			value: formatCRC(companyBalance?.currentBalance || 0),
			icon: BsCashStack,
			color: "from-green-500/20 to-green-500/5",
			iconColor: "text-success",
			link: null,
		},
		{
			title: "Vehículos disponibles",
			value: availableCars,
			icon: BsCarFront,
			color: "from-blue-500/20 to-blue-500/5",
			iconColor: "text-blue-500",
			link: "/admin/cars",
		},
		{
			title: "Clientes registrados",
			value: clients.length,
			icon: BsPeople,
			color: "from-purple-500/20 to-purple-500/5",
			iconColor: "text-purple-500",
			link: "/admin/clients",
		},
		{
			title: "Ventas totales",
			value: formatCRC(totalSalesValue),
			icon: BsGraphUp,
			color: "from-yellow-500/20 to-yellow-500/5",
			iconColor: "text-yellow-500",
			link: null,
		},
	];

	const handleUpdateRate = async () => {
		if (!newExchangeRate || Number(newExchangeRate) <= 0) {
			return;
		}
		setUpdatingRate(true);
		try {
			await updateExchangeRate({
				variables: { value: Number(newExchangeRate) },
			});
			window.location.reload(); // Recargar para actualizar todas las queries
		} catch (error) {
			console.error(error);
		}
		setUpdatingRate(false);
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando dashboard..." />;

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-first">
						Panel Administrativo
					</h1>
					<p className="text-first/50 mt-1">Resumen general del negocio</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					{statsCards.map((stat) => (
						<div
							key={stat.title}
							className={`relative bg-linear-to-br ${stat.color} rounded-2xl border border-first/10 p-6 overflow-hidden`}
						>
							<div className="flex items-start justify-between">
								<div>
									<p className="text-sm text-first/50">{stat.title}</p>
									<p className="text-2xl font-bold text-first mt-1">
										{stat.value}
									</p>
								</div>
								<div
									className={`w-10 h-10 rounded-xl bg-first/5 flex items-center justify-center ${stat.iconColor}`}
								>
									<stat.icon className="w-5 h-5" />
								</div>
							</div>
							{stat.link && (
								<Link
									to={stat.link}
									className="inline-flex items-center gap-1 text-xs text-second hover:underline mt-3"
								>
									Ver detalles <BsArrowRight className="w-3 h-3" />
								</Link>
							)}
						</div>
					))}
				</div>

				{/* Detailed Stats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
					{/* Availability Stats */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Disponibilidad de Vehículos
						</h2>
						<div className="space-y-3">
							{[
								{
									label: "Disponibles",
									value: availableCars,
									total: cars.length,
									color: "bg-success",
								},
								{
									label: "Reservados",
									value: reservedCars,
									total: cars.length,
									color: "bg-warning",
								},
								{
									label: "En reparación",
									value: inRepairCars,
									total: cars.length,
									color: "bg-blue-500",
								},
								{
									label: "Vendidos",
									value: soldCars,
									total: cars.length,
									color: "bg-error",
								},
							].map((item) => (
								<div key={item.label}>
									<div className="flex justify-between text-sm mb-1">
										<span className="text-first/60">{item.label}</span>
										<span className="text-first font-medium">{item.value}</span>
									</div>
									<div className="w-full bg-first/5 rounded-full h-2">
										<div
											className={`${item.color} h-2 rounded-full transition-all duration-500`}
											style={{
												width: `${item.total ? (item.value / item.total) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Logistic Stats */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Estado Logístico
						</h2>
						<div className="grid grid-cols-2 gap-4">
							{[
								{
									label: "En camino",
									value: inTransit,
									icon: BsTruck,
									color: "text-blue-500",
								},
								{
									label: "En almacén",
									value: inWarehouse,
									icon: BsBuilding,
									color: "text-yellow-500",
								},
								{
									label: "Dekra pendiente",
									value: dekraPending,
									icon: BsClipboardCheck,
									color: "text-orange-500",
								},
								{
									label: "Disponibles venta",
									value: availableForSale,
									icon: BsCarFront,
									color: "text-green-500",
								},
							].map((item) => (
								<div
									key={item.label}
									className="bg-first/5 rounded-xl p-4 flex items-center gap-3"
								>
									<div
										className={`w-10 h-10 rounded-lg bg-first/10 flex items-center justify-center ${item.color}`}
									>
										<item.icon className="w-5 h-5" />
									</div>
									<div>
										<p className="text-2xl font-bold text-first">
											{item.value}
										</p>
										<p className="text-xs text-first/40">{item.label}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Financial Summary */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Company Balance */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Balance de Caja
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Monto inicial</span>
								<span className="text-sm font-medium text-first">
									{formatCRC(companyBalance?.initialAmount || 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Balance actual</span>
								<span className="text-sm font-bold text-second">
									{formatCRC(companyBalance?.currentBalance || 0)}
								</span>
							</div>
							<div className="border-t border-first/10 pt-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-first/50">Tipo de cambio</span>
									<button
										onClick={() => {
											setNewExchangeRate(exchangeRate?.toString() || "");
											setShowExchangeModal(true);
										}}
										className="text-sm font-medium text-first hover:text-second transition-colors underline underline-offset-2"
									>
										{formatCRC(exchangeRate)} / USD
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* JC Debt */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Deuda con Juan Carlos
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Total invertido</span>
								<span className="text-sm font-medium text-first">
									{formatUSD(jcSummary?.totalInvestedUSD || 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Total pagado</span>
								<span className="text-sm font-medium text-success">
									{formatUSD(jcSummary?.totalPaidUSD || 0)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-first/50">Saldo pendiente</span>
								<span className="text-sm font-bold text-error">
									{formatUSD(jcSummary?.totalPendingUSD || 0)}
								</span>
							</div>
						</div>
						<Link
							to="/admin/jc-payments"
							className="inline-flex items-center gap-1 text-xs text-second hover:underline mt-4"
						>
							Ver pagos <BsArrowRight className="w-3 h-3" />
						</Link>
					</div>

					{/* Quick Actions */}
					<div className="bg-main rounded-2xl border border-first/10 p-6">
						<h2 className="text-lg font-semibold text-first mb-4">
							Acciones Rápidas
						</h2>
						<div className="space-y-2">
							<Link
								to="/admin/cars"
								className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl bg-first/5 hover:bg-first/10 text-sm text-first transition-colors"
							>
								<BsCarFront className="w-4 h-4" />
								Gestionar vehículos
							</Link>
							<Link
								to="/admin/expenses"
								className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl bg-first/5 hover:bg-first/10 text-sm text-first transition-colors"
							>
								<BsCurrencyDollar className="w-4 h-4" />
								Registrar Gastos de autos
							</Link>
							<Link
								to="/admin/general-expenses"
								className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl bg-first/5 hover:bg-first/10 text-sm text-first transition-colors"
							>
								<BsCurrencyDollar className="w-4 h-4" />
								Registrar Gastos generales
							</Link>
							<Link
								to="/admin/reports"
								className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl bg-first/5 hover:bg-first/10 text-sm text-first transition-colors"
							>
								<BsClipboardCheck className="w-4 h-4" />
								Reporte contable
							</Link>
						</div>
					</div>

					{/* Modal para actualizar tipo de cambio */}
					<Modal
						isOpen={showExchangeModal}
						onClose={() => setShowExchangeModal(false)}
						title="Actualizar Tipo de Cambio"
						size="sm"
					>
						<div className="space-y-4">
							<div>
								<p className="text-sm text-first/50 mb-1">
									Tipo de cambio actual
								</p>
								<p className="text-xl font-bold text-first">
									{formatCRC(exchangeRate)} por USD
								</p>
							</div>
							<Input
								label="Nuevo valor (CRC por USD)"
								type="number"
								value={newExchangeRate}
								onChange={(e) => setNewExchangeRate(e.target.value)}
								placeholder="Ej: 540"
								min={0}
								size="md"
							/>
							<p className="text-xs text-first/40">
								Este valor afecta todos los cálculos de conversión USD a CRC en
								el sistema.
							</p>
							<div className="flex justify-end gap-2 pt-2">
								<Button
									variant="ghost"
									onClick={() => setShowExchangeModal(false)}
								>
									Cancelar
								</Button>
								<Button
									onClick={handleUpdateRate}
									loading={updatingRate}
									disabled={!newExchangeRate || Number(newExchangeRate) <= 0}
								>
									Actualizar
								</Button>
							</div>
						</div>
					</Modal>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboardPage;
