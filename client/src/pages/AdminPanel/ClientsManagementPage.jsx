import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CLIENTS } from "../../graphql/queries/userQueries";
import {
	DELETE_USER,
	ASSIGN_CAR_TO_CLIENT,
	REMOVE_CAR_FROM_CLIENT,
} from "../../graphql/mutations/userMutations";
import { GET_CARS } from "../../graphql/queries/carQueries";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import ClientForm from "../../components/clients/ClientForm";
import {
	BsPlus,
	BsPencil,
	BsTrash,
	BsPerson,
	BsEnvelope,
	BsPhone,
	BsCarFront,
	BsX,
} from "react-icons/bs";
import { formatDate } from "../../utils/formatters";

const ClientsManagementPage = () => {
	const { toast } = useToast();
	const { data: clientsData, loading, refetch } = useQuery(GET_CLIENTS);
	const { data: carsData } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});

	const [deleteUser] = useMutation(DELETE_USER);
	const [assignCar] = useMutation(ASSIGN_CAR_TO_CLIENT);
	const [removeCar] = useMutation(REMOVE_CAR_FROM_CLIENT);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingClient, setEditingClient] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [assigningCar, setAssigningCar] = useState(null);

	const clients = clientsData?.clients || [];
	const availableCars =
		carsData?.cars?.cars?.filter(
			(c) => c.availability !== "Sold" && !c.assignedClient,
		) || [];

	const handleDelete = async (id) => {
		try {
			await deleteUser({ variables: { id } });
			toast.success("Cliente eliminado");
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
		setDeleteConfirm(null);
	};

	const handleAssignCar = async (carId) => {
		try {
			await assignCar({ variables: { userId: assigningCar, carId } });
			toast.success("Auto asignado");
			setAssigningCar(null);
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
	};

	const handleRemoveCar = async (userId, carId) => {
		try {
			await removeCar({ variables: { userId, carId } });
			toast.success("Auto removido");
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando clientes..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">
							Gestión de Clientes
						</h1>
						<p className="text-first/50 mt-1">{clients.length} clientes</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => {
							setEditingClient(null);
							setIsFormOpen(true);
						}}
					>
						Nuevo cliente
					</Button>
				</div>

				{clients.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{clients.map((client) => (
							<div
								key={client._id}
								className="bg-main rounded-2xl border border-first/10 p-6 hover:shadow-lg transition-shadow"
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-full bg-second/10 flex items-center justify-center">
											<BsPerson className="w-6 h-6 text-second" />
										</div>
										<div>
											<h3 className="font-semibold text-first">
												{client.name}
											</h3>
											<div className="flex items-center gap-2 mt-1">
												{client.isDirectBuyer && (
													<Badge variant="success" size="sm">
														Comprador
													</Badge>
												)}
												{client.temporaryPassword && (
													<Badge variant="warning" size="sm">
														Contraseña temporal
													</Badge>
												)}
											</div>
										</div>
									</div>
									<div className="flex gap-1">
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											icon={<BsPencil className="w-3.5 h-3.5" />}
											onClick={() => {
												setEditingClient(client);
												setIsFormOpen(true);
											}}
										/>
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											className="text-error"
											icon={<BsTrash className="w-3.5 h-3.5" />}
											onClick={() => setDeleteConfirm(client._id)}
										/>
									</div>
								</div>

								<div className="space-y-2 text-sm">
									<p className="flex items-center gap-2 text-first/60">
										<BsEnvelope className="w-3.5 h-3.5" />
										{client.email}
									</p>
									{client.phone && (
										<p className="flex items-center gap-2 text-first/60">
											<BsPhone className="w-3.5 h-3.5" />
											{client.phone}
										</p>
									)}
									<p className="text-first/30 text-xs">
										Registrado: {formatDate(client.registrationDate)}
									</p>
								</div>

								{client.commissionedCars?.length > 0 && (
									<div className="mt-4 pt-4 border-t border-first/10">
										<p className="text-xs text-first/40 mb-2">
											Autos por encargo:
										</p>
										<div className="space-y-2">
											{client.commissionedCars.map((car) => (
												<div
													key={car._id}
													className="flex items-center justify-between bg-first/5 rounded-lg p-2"
												>
													<div className="flex items-center gap-2">
														<BsCarFront className="w-3.5 h-3.5 text-first/30" />
														<span className="text-sm text-first/70">
															{car.brand?.name} {car.carModel?.name} {car.year}
														</span>
													</div>
													<Button
														iconOnly
														variant="ghost"
														size="sm"
														className="text-error"
														icon={<BsX className="w-3.5 h-3.5" />}
														onClick={() => handleRemoveCar(client._id, car._id)}
													/>
												</div>
											))}
										</div>
									</div>
								)}

								<Button
									variant="secondary"
									size="sm"
									fullWidth
									className="mt-4"
									onClick={() => setAssigningCar(client._id)}
								>
									Asignar auto
								</Button>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={<BsPerson className="w-12 h-12" />}
						title="No hay clientes"
						description="Crea un nuevo cliente para comenzar."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsFormOpen(true)}
							>
								Nuevo cliente
							</Button>
						}
					/>
				)}

				{/* Modal formulario */}
				<Modal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false);
						setEditingClient(null);
					}}
					title={editingClient ? "Editar Cliente" : "Nuevo Cliente"}
					size="md"
				>
					<ClientForm
						client={editingClient}
						onClose={() => {
							setIsFormOpen(false);
							setEditingClient(null);
						}}
						onSuccess={() => refetch()}
					/>
				</Modal>

				{/* Modal asignar auto */}
				<Modal
					isOpen={!!assigningCar}
					onClose={() => setAssigningCar(null)}
					title="Asignar Auto"
					size="md"
				>
					<div className="space-y-2 max-h-96 overflow-y-auto">
						{availableCars.length > 0 ? (
							availableCars.map((car) => (
								<button
									key={car._id}
									onClick={() => handleAssignCar(car._id)}
									className="w-full text-left p-3 rounded-xl bg-first/5 hover:bg-first/10 transition-colors"
								>
									<p className="font-medium text-first">
										{car.brand?.name} {car.carModel?.name} {car.year}
									</p>
									<p className="text-sm text-first/40">{car.vin}</p>
								</button>
							))
						) : (
							<p className="text-center text-first/40 py-8">
								No hay autos disponibles
							</p>
						)}
					</div>
				</Modal>

				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar cliente"
					description="¿Estás seguro? Esta acción no se puede deshacer."
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default ClientsManagementPage;
