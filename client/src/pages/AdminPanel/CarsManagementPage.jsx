import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client/react";

import {
	BsPlus,
	BsPencil,
	BsTrash,
	BsSpeedometer2,
	BsCalendar,
	BsCheckCircle,
} from "react-icons/bs";

import { useCar } from "../../context/CarContext";
import { useToast } from "../../context/ToastContext";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/common/Pagination";
import Filters from "../../components/common/Filters";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import CarForm from "../../components/cars/CarForm";
import Select from "../../components/ui/Select";

import {
	formatCRC,
	formatMileage,
	formatDate,
	getLogisticStatusText,
	getLogisticStatusColor,
	getAvailabilityColor,
	getDetailsTranslation,
} from "../../utils/formatters";

import {
	LOGISTIC_STATUS_OPTIONS,
	AVAILABILITY_OPTIONS,
} from "../../utils/constants";

import { MARK_CAR_AS_SOLD } from "../../graphql/mutations/carMutations";

const CarsManagementPage = () => {
	const {
		cars,
		carsLoading,
		filters,
		pagination,
		updateFilters,
		clearFilters,
		changePage,
		deleteCar,
		bulkUpdateCars,
		refetchCars,
	} = useCar();

	const [markCarAsSold] = useMutation(MARK_CAR_AS_SOLD);

	const { toast } = useToast();
	const [selectedCars, setSelectedCars] = useState([]);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCar, setEditingCar] = useState(null);

	const [sellModal, setSellModal] = useState(null);
	const [sellForm, setSellForm] = useState({
		finalSalePriceCRC: "",
		saleDate: new Date().toISOString().split("T")[0],
		buyerName: "",
	});
	const [markingSold, setMarkingSold] = useState(false);

	const handleDelete = async (id) => {
		try {
			await deleteCar(id);
			toast.success("Vehículo eliminado");
			refetchCars();
		} catch (error) {
			toast.error(error.message || "Error al eliminar");
		}
		setDeleteConfirm(null);
	};

	const toggleSelectCar = (id) => {
		setSelectedCars((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
		);
	};

	const handleBulkStatus = (value, field) => {
		if (!value) return;
		bulkUpdateCars({ carIds: selectedCars, [field]: value });
		setSelectedCars([]);
		toast.success("Vehículos actualizados");
		refetchCars();
	};

	const handleMarkAsSold = async (e) => {
		e.preventDefault();
		if (!sellForm.finalSalePriceCRC || Number(sellForm.finalSalePriceCRC) <= 0)
			return;
		if (!sellForm.saleDate) return;

		setMarkingSold(true);
		try {
			await markCarAsSold({
				variables: {
					id: sellModal,
					finalSalePriceCRC: Number(sellForm.finalSalePriceCRC),
					saleDate: sellForm.saleDate,
					buyerName: sellForm.buyerName || undefined,
				},
			});
			toast.success("Auto marcado como vendido");
			setSellModal(null);
			setSellForm({
				finalSalePriceCRC: "",
				saleDate: new Date().toISOString().split("T")[0],
				buyerName: "",
			});
			refetchCars();
		} catch (error) {
			toast.error(error.message || "Error al marcar como vendido");
		}
		setMarkingSold(false);
	};

	if (carsLoading)
		return <LoadingOverlay visible={true} text="Cargando vehículos..." />;

	return (
		<div className="min-h-screen pb-16">
			<div className="px-4 sm:px-6 lg:px-8 py-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">
							Gestión de Vehículos
						</h1>
						<p className="text-first/50 mt-1">
							{cars?.totalCount || 0} vehículos
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => {
							setEditingCar(null);
							setIsFormOpen(true);
						}}
					>
						Nuevo vehículo
					</Button>
				</div>

				<div className="mb-6">
					<Filters
						filters={filters}
						onFilterChange={updateFilters}
						onClearFilters={clearFilters}
					/>
				</div>

				{selectedCars.length > 0 && (
					<div className="bg-second/5 rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3">
						<span className="text-sm text-first font-medium">
							{selectedCars.length} seleccionados
						</span>
						<Select
							size="sm"
							placeholder="Estado logístico..."
							className="w-48"
							options={LOGISTIC_STATUS_OPTIONS}
							onChange={(e) =>
								handleBulkStatus(e.target.value, "logisticStatus")
							}
						/>
						<Select
							size="sm"
							placeholder="Disponibilidad..."
							className="w-44"
							options={AVAILABILITY_OPTIONS}
							onChange={(e) => handleBulkStatus(e.target.value, "availability")}
						/>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedCars([])}
						>
							Cancelar
						</Button>
					</div>
				)}

				{cars?.cars?.length > 0 ? (
					<>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
							{cars.cars.map((car) => (
								<div
									key={car._id}
									className={`relative bg-main text-center rounded-2xl border transition-all duration-200 hover:shadow-lg ${
										selectedCars.includes(car._id)
											? "border-second ring-2 ring-second/20"
											: "border-first/10 hover:border-second/30"
									}`}
								>
									{/* Checkbox */}
									<div className="absolute top-3 left-3 z-10">
										<input
											type="checkbox"
											checked={selectedCars.includes(car._id)}
											onChange={() => toggleSelectCar(car._id)}
											className="rounded border-first/30 w-4 h-4"
										/>
									</div>

									{/* Content */}
									<Link
										to={`/car/${car._id}`}
										className="block text-center p-4 pt-10"
									>
										<h3 className="font-semibold text-first text-sm line-clamp-1">
											{car.brand?.name} {car.carModel?.name} {car.year}{" "}
											{car.color.toUpperCase()}
										</h3>
										<p className="text-xs text-first/40 mt-0.5">{car.vin}</p>
									</Link>

									<div className="px-4 pb-2 space-y-2">
										<p className="text-lg font-bold text-second">
											{formatCRC(car.publishedPriceCRC)}
										</p>

										<div className="flex items-center justify-center gap-2 text-xs text-first/50">
											<BsSpeedometer2 className="w-3 h-3" />
											{formatMileage(car.adjustedMileage || car.actualMileage)}
											<BsCalendar className="w-3 h-3 ml-1" />
											{formatDate(car.purchaseDate)}
										</div>

										<div className="flex items-center justify-center gap-1.5 flex-wrap">
											<Badge
												size="sm"
												className={getLogisticStatusColor(car.logisticStatus)}
											>
												{getLogisticStatusText(car.logisticStatus)}
											</Badge>
											<Badge
												size="sm"
												className={getAvailabilityColor(car.availability)}
											>
												{getDetailsTranslation(
													"availability",
													car.availability,
												)}
											</Badge>
										</div>

										<p className="text-xs text-first/40">
											{getDetailsTranslation("fuelType", car.fuelType)} •{" "}
											{getDetailsTranslation("transmission", car.transmission)}{" "}
											• {getDetailsTranslation("bodyType", car.bodyType)}
										</p>
									</div>

									{/* Actions */}
									<div className="px-4 pb-3 flex gap-1 justify-end border-t border-first/5 pt-2">
										{car.availability !== "Sold" && (
											<Button
												iconOnly
												variant="ghost"
												size="sm"
												className="text-success"
												icon={<BsCheckCircle className="w-3.5 h-3.5" />}
												onClick={() => {
													setSellModal(car._id);
													setSellForm({
														finalSalePriceCRC:
															car.publishedPriceCRC?.toString() || "",
														saleDate: new Date().toISOString().split("T")[0],
														buyerName: "",
													});
												}}
												title="Marcar como vendido"
											/>
										)}
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											icon={<BsPencil className="w-3.5 h-3.5" />}
											onClick={() => {
												setEditingCar(car);
												setIsFormOpen(true);
											}}
										/>
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											className="text-error"
											icon={<BsTrash className="w-3.5 h-3.5" />}
											onClick={() => setDeleteConfirm(car._id)}
										/>
									</div>
								</div>
							))}
						</div>

						<div className="mt-6">
							<Pagination
								currentPage={pagination.page}
								totalPages={cars.totalPages}
								onPageChange={changePage}
							/>
						</div>
					</>
				) : (
					<EmptyState
						title="No se encontraron vehículos"
						description="Crea un nuevo vehículo o ajusta los filtros."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsFormOpen(true)}
							>
								Nuevo vehículo
							</Button>
						}
					/>
				)}

				<Modal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false);
						setEditingCar(null);
					}}
					title={editingCar ? "Editar Vehículo" : "Nuevo Vehículo"}
					size="xl"
					showCloseButton={false}
				>
					<CarForm
						car={editingCar}
						onClose={() => {
							setIsFormOpen(false);
							setEditingCar(null);
						}}
						onSuccess={() => refetchCars()}
					/>
				</Modal>

				{/* Modal Marcar como Vendido */}
				<Modal
					isOpen={!!sellModal}
					onClose={() => setSellModal(null)}
					title="Marcar como Vendido"
					size="sm"
				>
					<form onSubmit={handleMarkAsSold} className="space-y-4">
						<Input
							label="Precio final de venta (CRC)"
							type="number"
							required
							min={0}
							value={sellForm.finalSalePriceCRC}
							onChange={(e) =>
								setSellForm((p) => ({
									...p,
									finalSalePriceCRC: e.target.value,
								}))
							}
						/>
						<Input
							label="Fecha de venta"
							type="date"
							required
							value={sellForm.saleDate}
							onChange={(e) =>
								setSellForm((p) => ({ ...p, saleDate: e.target.value }))
							}
						/>
						<Input
							label="Comprador (opcional)"
							value={sellForm.buyerName}
							onChange={(e) =>
								setSellForm((p) => ({ ...p, buyerName: e.target.value }))
							}
							placeholder="Nombre del comprador"
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => setSellModal(null)}
							>
								Cancelar
							</Button>
							<Button type="submit" loading={markingSold}>
								Marcar como vendido
							</Button>
						</div>
					</form>
				</Modal>

				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar vehículo"
					description="¿Estás seguro? Esta acción no se puede deshacer."
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default CarsManagementPage;
