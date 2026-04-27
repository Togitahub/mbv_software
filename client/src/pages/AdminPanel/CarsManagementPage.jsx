import { useState } from "react";
import { Link } from "react-router-dom";
import { BsPlus, BsPencil, BsTrash } from "react-icons/bs";
import { useCar } from "../../context/CarContext";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/common/Pagination";
import Filters from "../../components/common/Filters";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import CarForm from "../../components/cars/CarForm";
import { useToast } from "../../context/ToastContext";
import {
	formatCRC,
	formatDate,
	getLogisticStatusText,
	getAvailabilityText,
	getLogisticStatusColor,
	getAvailabilityColor,
} from "../../utils/formatters";

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
		refetchCars,
	} = useCar();

	const { toast } = useToast();
	const [selectedCars, setSelectedCars] = useState([]);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCar, setEditingCar] = useState(null);

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

	const toggleSelectAll = () => {
		if (selectedCars.length === cars?.cars?.length) {
			setSelectedCars([]);
		} else {
			setSelectedCars(cars?.cars?.map((c) => c._id) || []);
		}
	};

	const toggleSelectCar = (id) => {
		setSelectedCars((prev) =>
			prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
		);
	};

	if (carsLoading)
		return <LoadingOverlay visible={true} text="Cargando vehículos..." />;

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
					<div className="bg-second/5 rounded-xl p-3 mb-4 flex items-center gap-3">
						<span className="text-sm text-first font-medium">
							{selectedCars.length} seleccionados
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSelectedCars([])}
						>
							Cancelar selección
						</Button>
					</div>
				)}

				{cars?.cars?.length > 0 ? (
					<>
						<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-first/10">
											<th className="w-10 p-4">
												<input
													type="checkbox"
													checked={
														selectedCars.length === cars?.cars?.length &&
														cars?.cars?.length > 0
													}
													onChange={toggleSelectAll}
													className="rounded border-first/30"
												/>
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Vehículo
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Precio
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Estado
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Disp.
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Fecha
											</th>
											<th className="text-right p-4 text-xs font-medium text-first/40 uppercase">
												Acciones
											</th>
										</tr>
									</thead>
									<tbody>
										{cars.cars.map((car) => (
											<tr
												key={car._id}
												className="border-b border-first/5 hover:bg-first/5 transition-colors"
											>
												<td className="p-4">
													<input
														type="checkbox"
														checked={selectedCars.includes(car._id)}
														onChange={() => toggleSelectCar(car._id)}
														className="rounded border-first/30"
													/>
												</td>
												<td className="p-4">
													<Link
														to={`/car/${car._id}`}
														className="hover:text-second transition-colors"
													>
														<p className="font-medium text-first">
															{car.brand?.name} {car.carModel?.name}
														</p>
														<p className="text-xs text-first/40">
															{car.year} • {car.vin}
														</p>
													</Link>
												</td>
												<td className="p-4">
													<p className="text-sm font-medium text-first">
														{formatCRC(car.publishedPriceCRC)}
													</p>
												</td>
												<td className="p-4">
													<Badge
														size="sm"
														className={getLogisticStatusColor(
															car.logisticStatus,
														)}
													>
														{getLogisticStatusText(car.logisticStatus)}
													</Badge>
												</td>
												<td className="p-4">
													<Badge
														size="sm"
														className={getAvailabilityColor(car.availability)}
													>
														{getAvailabilityText(car.availability)}
													</Badge>
												</td>
												<td className="p-4">
													<p className="text-sm text-first/60">
														{car.creationDate || car.purchaseDate
															? formatDate(car.creationDate || car.purchaseDate)
															: "—"}
													</p>
												</td>
												<td className="p-4">
													<div className="flex items-center justify-end gap-1">
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
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
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

				{/* Modal del formulario */}
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

				{/* Confirmación de eliminación */}
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
