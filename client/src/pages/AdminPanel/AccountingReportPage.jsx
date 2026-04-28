import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CARS } from "../../graphql/queries/carQueries";
import { GET_DAVE_CARS } from "../../graphql/queries/daveCarQueries";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import { BsDownload, BsPrinter, BsCarFront } from "react-icons/bs";
import { formatDate } from "../../utils/formatters";

const AccountingReportPage = () => {
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
	});

	const { data: carsData, loading: carsLoading } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 10000 },
	});

	const { data: daveCarsData, loading: daveCarsLoading } = useQuery(
		GET_DAVE_CARS,
		{
			variables: { page: 1, limit: 10000 },
		},
	);

	const loading = carsLoading || daveCarsLoading;

	const [year, month] = selectedMonth.split("-").map(Number);

	// Filter cars by DUA registration date in selected month
	const filteredMBVCars = useMemo(() => {
		const cars = carsData?.cars?.cars || [];
		return cars.filter((car) => {
			if (!car.duaRegistrationDate) return false;
			const duaDate = new Date(car.duaRegistrationDate);
			return duaDate.getFullYear() === year && duaDate.getMonth() + 1 === month;
		});
	}, [carsData, year, month]);

	const filteredDaveCars = useMemo(() => {
		const cars = daveCarsData?.daveCars?.cars || [];
		return cars.filter((car) => {
			if (!car.duaRegistrationDate) return false;
			const duaDate = new Date(car.duaRegistrationDate);
			return duaDate.getFullYear() === year && duaDate.getMonth() + 1 === month;
		});
	}, [daveCarsData, year, month]);

	const allCars = useMemo(() => {
		const mbvCars = filteredMBVCars.map((car) => ({
			...car,
			source: "MBV",
			brandName: car.brand?.name || "N/A",
			modelName: car.carModel?.name || "N/A",
		}));

		const daveCars = filteredDaveCars.map((car) => ({
			...car,
			source: "Dave",
			brandName: car.brand,
			modelName: car.model,
		}));

		return [...mbvCars, ...daveCars].sort((a, b) => {
			return new Date(b.duaRegistrationDate) - new Date(a.duaRegistrationDate);
		});
	}, [filteredMBVCars, filteredDaveCars]);

	const monthNames = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre",
	];

	const handlePrint = () => {
		const reportContent = document.getElementById("report-content");
		if (!reportContent) return;

		const printWindow = window.open("", "_blank");
		if (!printWindow) return;

		const styles = document.querySelectorAll("style, link[rel='stylesheet']");
		let styleContent = "";
		styles.forEach((style) => {
			styleContent += style.outerHTML;
		});

		printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Contable - ${monthNames[month - 1]} ${year}</title>
          ${styleContent}
          <style>
            body { padding: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${reportContent.innerHTML}
        </body>
      </html>
    `);
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => printWindow.print(), 500);
	};

	const handleDownloadPDF = () => {
		handlePrint();
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando reporte..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">Reporte Contable</h1>
						<p className="text-first/50 mt-1">
							Reporte mensual para la contadora (por fecha de registro DUA)
						</p>
					</div>
					<div className="flex items-center gap-2 no-print">
						<Button
							variant="secondary"
							size="sm"
							icon={<BsPrinter className="w-4 h-4" />}
							onClick={handlePrint}
						>
							Imprimir
						</Button>
						<Button
							size="sm"
							icon={<BsDownload className="w-4 h-4" />}
							onClick={handleDownloadPDF}
						>
							Descargar PDF
						</Button>
					</div>
				</div>

				{/* Month Selector */}
				<div className="bg-main rounded-2xl border border-first/10 p-4 mb-6 no-print">
					<div className="max-w-xs">
						<Input
							label="Seleccionar mes"
							type="month"
							value={selectedMonth}
							onChange={(e) => setSelectedMonth(e.target.value)}
							size="sm"
						/>
					</div>
				</div>

				{/* Report Content */}
				<div id="report-content">
					<div className="bg-main rounded-2xl border border-first/10 overflow-hidden mb-6">
						{/* Report Header */}
						<div className="p-6 border-b border-first/10 text-center">
							<h2 className="text-xl font-bold text-first">
								Importaciones MBV
							</h2>
							<h3 className="text-lg text-first/70 mt-1">
								Reporte de Autos Registrados - {monthNames[month - 1]} {year}
							</h3>
							<p className="text-sm text-first/40 mt-1">
								Total: {allCars.length} autos registrados en el mes
							</p>
						</div>

						{allCars.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-first/10 bg-first/5">
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												#
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												Fuente
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												Marca
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												Modelo
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												Año
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												VIN
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												DUA
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												Fecha DUA
											</th>
											<th className="text-left p-3 text-xs font-medium text-first/40 uppercase">
												Disponibilidad
											</th>
										</tr>
									</thead>
									<tbody>
										{allCars.map((car, index) => (
											<tr
												key={`${car.source}-${car._id}`}
												className="border-b border-first/5 hover:bg-first/5 transition-colors"
											>
												<td className="p-3 text-sm text-first/40">
													{index + 1}
												</td>
												<td className="p-3">
													<Badge
														size="sm"
														variant={car.source === "MBV" ? "info" : "warning"}
													>
														{car.source}
													</Badge>
												</td>
												<td className="p-3 text-sm text-first">
													{car.brandName}
												</td>
												<td className="p-3 text-sm text-first">
													{car.modelName}
												</td>
												<td className="p-3 text-sm text-first">{car.year}</td>
												<td className="p-3 text-first/60 font-mono text-xs">
													{car.vin}
												</td>
												<td className="p-3 text-first/60 font-mono text-xs">
													{car.dua}
												</td>
												<td className="p-3 text-sm text-first/60">
													{formatDate(car.duaRegistrationDate)}
												</td>
												<td className="p-3">
													<Badge
														size="sm"
														variant={
															car.availability === "Available"
																? "success"
																: car.availability === "Sold"
																	? "error"
																	: "neutral"
														}
													>
														{car.availability === "Available"
															? "Disponible"
															: car.availability === "Sold"
																? "Vendido"
																: car.availability}
													</Badge>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="p-12">
								<EmptyState
									icon={<BsCarFront className="w-12 h-12" />}
									title="No hay autos registrados en este mes"
									description={`No se encontraron autos con fecha de registro DUA en ${monthNames[month - 1]} de ${year}.`}
								/>
							</div>
						)}
					</div>

					{/* Summary */}
					{allCars.length > 0 && (
						<div className="bg-main rounded-2xl border border-first/10 p-6">
							<h3 className="text-lg font-semibold text-first mb-4">
								Resumen del Mes
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="bg-first/5 rounded-xl p-4 text-center">
									<p className="text-3xl font-bold text-first">
										{allCars.length}
									</p>
									<p className="text-sm text-first/50">
										Total autos registrados
									</p>
								</div>
								<div className="bg-blue-500/5 rounded-xl p-4 text-center">
									<p className="text-3xl font-bold text-second">
										{filteredMBVCars.length}
									</p>
									<p className="text-sm text-first/50">Autos MBV</p>
								</div>
								<div className="bg-yellow-500/5 rounded-xl p-4 text-center">
									<p className="text-3xl font-bold text-yellow-600">
										{filteredDaveCars.length}
									</p>
									<p className="text-sm text-first/50">Autos Dave</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AccountingReportPage;
