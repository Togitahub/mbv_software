import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_DAVE_CARS } from "../../graphql/queries/daveCarQueries";
import {
	CREATE_DAVE_CAR,
	UPDATE_DAVE_CAR,
	DELETE_DAVE_CAR,
} from "../../graphql/mutations/daveCarMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/common/Pagination";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import { BsPlus, BsPencil, BsTrash, BsSearch } from "react-icons/bs";
import { formatDate } from "../../utils/formatters";

const DaveCarsListPage = () => {
	const { toast } = useToast();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingCar, setEditingCar] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [formData, setFormData] = useState({
		vin: "",
		dua: "",
		brand: "",
		model: "",
		year: new Date().getFullYear(),
		color: "",
		duaRegistrationDate: "",
	});

	const { data, loading, refetch } = useQuery(GET_DAVE_CARS, {
		variables: { page, limit: 12, search: search || undefined },
	});

	const [createDaveCar] = useMutation(CREATE_DAVE_CAR);
	const [updateDaveCar] = useMutation(UPDATE_DAVE_CAR);
	const [deleteDaveCar] = useMutation(DELETE_DAVE_CAR);

	const daveCars = data?.daveCars;

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await createDaveCar({
				variables: {
					input: {
						...formData,
						year: Number(formData.year),
					},
				},
			});
			toast.success("Auto de Dave creado exitosamente");
			setIsCreateModalOpen(false);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al crear auto");
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		if (!editingCar) return;
		try {
			await updateDaveCar({
				variables: {
					id: editingCar._id,
					input: {
						...formData,
						year: Number(formData.year),
					},
				},
			});
			toast.success("Auto actualizado exitosamente");
			setEditingCar(null);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al actualizar auto");
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteDaveCar({ variables: { id } });
			toast.success("Auto eliminado exitosamente");
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al eliminar auto");
		}
		setDeleteConfirm(null);
	};

	const openEditModal = (car) => {
		setEditingCar(car);
		setFormData({
			vin: car.vin || "",
			dua: car.dua || "",
			brand: car.brand || "",
			model: car.model || "",
			year: car.year || new Date().getFullYear(),
			color: car.color || "",
			duaRegistrationDate: car.duaRegistrationDate
				? car.duaRegistrationDate.split("T")[0]
				: "",
		});
	};

	const resetForm = () => {
		setFormData({
			vin: "",
			dua: "",
			brand: "",
			model: "",
			year: new Date().getFullYear(),
			color: "",
			duaRegistrationDate: "",
		});
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando autos de Dave..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">Autos de Dave</h1>
						<p className="text-first/50 mt-1">
							{daveCars?.totalCount || 0} autos registrados (solo control
							contable)
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => setIsCreateModalOpen(true)}
					>
						Nuevo auto
					</Button>
				</div>

				{/* Search */}
				<div className="max-w-md mb-6">
					<div className="relative">
						<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-first/30" />
						<input
							type="text"
							placeholder="Buscar por VIN, DUA, marca..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className="w-full pl-10 pr-4 py-2 rounded-xl border border-first/10 bg-main text-first text-sm
                       focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second
                       placeholder:text-first/30 transition-all duration-150"
						/>
					</div>
				</div>

				{daveCars?.cars?.length > 0 ? (
					<>
						<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-first/10">
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Vehículo
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												VIN
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												DUA
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Disponibilidad
											</th>
											<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
												Fecha DUA
											</th>
											<th className="text-right p-4 text-xs font-medium text-first/40 uppercase">
												Acciones
											</th>
										</tr>
									</thead>
									<tbody>
										{daveCars.cars.map((car) => (
											<tr
												key={car._id}
												className="border-b border-first/5 hover:bg-first/5 transition-colors"
											>
												<td className="p-4">
													<p className="font-medium text-first">
														{car.brand} {car.model}
													</p>
													<p className="text-xs text-first/40">
														{car.year} • {car.color}
													</p>
												</td>
												<td className="p-4">
													<p className="text-sm text-first/60 font-mono">
														{car.vin}
													</p>
												</td>
												<td className="p-4">
													<p className="text-sm text-first/60 font-mono">
														{car.dua}
													</p>
												</td>
												<td className="p-4">
													<Badge
														size="sm"
														variant={
															car.availability === "Available"
																? "success"
																: "neutral"
														}
													>
														{car.availability === "Available"
															? "Disponible"
															: "Vendido"}
													</Badge>
												</td>
												<td className="p-4">
													<p className="text-sm text-first/60">
														{car.duaRegistrationDate
															? formatDate(car.duaRegistrationDate)
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
															onClick={() => openEditModal(car)}
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
								currentPage={page}
								totalPages={daveCars.totalPages}
								onPageChange={setPage}
							/>
						</div>
					</>
				) : (
					<EmptyState
						title="No se encontraron autos de Dave"
						description="Crea un nuevo registro o ajusta la búsqueda."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsCreateModalOpen(true)}
							>
								Nuevo auto
							</Button>
						}
					/>
				)}

				{/* Create/Edit Modal */}
				<Modal
					isOpen={isCreateModalOpen || !!editingCar}
					onClose={() => {
						setIsCreateModalOpen(false);
						setEditingCar(null);
						resetForm();
					}}
					title={editingCar ? "Editar Auto de Dave" : "Nuevo Auto de Dave"}
					size="md"
				>
					<form
						onSubmit={editingCar ? handleUpdate : handleCreate}
						className="space-y-4"
					>
						<div className="grid grid-cols-2 gap-4">
							<Input
								label="VIN"
								required
								value={formData.vin}
								onChange={(e) =>
									setFormData((p) => ({ ...p, vin: e.target.value }))
								}
							/>
							<Input
								label="DUA"
								required
								value={formData.dua}
								onChange={(e) =>
									setFormData((p) => ({ ...p, dua: e.target.value }))
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<Input
								label="Marca"
								required
								value={formData.brand}
								onChange={(e) =>
									setFormData((p) => ({ ...p, brand: e.target.value }))
								}
							/>
							<Input
								label="Modelo"
								required
								value={formData.model}
								onChange={(e) =>
									setFormData((p) => ({ ...p, model: e.target.value }))
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<Input
								label="Año"
								type="number"
								required
								value={formData.year}
								onChange={(e) =>
									setFormData((p) => ({ ...p, year: e.target.value }))
								}
							/>
							<Input
								label="Color"
								required
								value={formData.color}
								onChange={(e) =>
									setFormData((p) => ({ ...p, color: e.target.value }))
								}
							/>
						</div>
						<Input
							label="Fecha de registro DUA"
							type="date"
							value={formData.duaRegistrationDate}
							onChange={(e) =>
								setFormData((p) => ({
									...p,
									duaRegistrationDate: e.target.value,
								}))
							}
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setIsCreateModalOpen(false);
									setEditingCar(null);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button type="submit">
								{editingCar ? "Guardar cambios" : "Crear auto"}
							</Button>
						</div>
					</form>
				</Modal>

				{/* Delete Confirmation */}
				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar auto de Dave"
					description="¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer."
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default DaveCarsListPage;
