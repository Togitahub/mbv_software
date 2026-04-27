import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CLIENT_PAYMENTS } from "../../graphql/queries/clientPaymentQueries";
import { GET_CLIENTS } from "../../graphql/queries/userQueries";
import { GET_CARS } from "../../graphql/queries/carQueries";
import {
	CREATE_CLIENT_PAYMENT,
	UPDATE_CLIENT_PAYMENT,
	DELETE_CLIENT_PAYMENT,
} from "../../graphql/mutations/clientPaymentMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import { BsPlus, BsPencil, BsTrash } from "react-icons/bs";
import { formatCRC, formatDate } from "../../utils/formatters";
import ImageUploader from "../../components/cars/ImageUploader";

const ClientPaymentsManagementPage = () => {
	const { toast } = useToast();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingPayment, setEditingPayment] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [formData, setFormData] = useState({
		client: "",
		car: "",
		amount: "",
		paymentDate: new Date().toISOString().split("T")[0],
		paymentMethod: "",
		pendingBalance: "",
	});

	const [receipt, setReceipt] = useState([]);

	const {
		data: paymentsData,
		loading,
		refetch,
	} = useQuery(GET_CLIENT_PAYMENTS);
	const { data: clientsData } = useQuery(GET_CLIENTS);
	const { data: carsData } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});

	const [createClientPayment] = useMutation(CREATE_CLIENT_PAYMENT);
	const [updateClientPayment] = useMutation(UPDATE_CLIENT_PAYMENT);
	const [deleteClientPayment] = useMutation(DELETE_CLIENT_PAYMENT);

	const payments = paymentsData?.clientPayments || [];
	const clients = clientsData?.clients || [];
	const cars = carsData?.cars?.cars || [];

	const clientOptions = clients.map((c) => ({
		value: c._id,
		label: `${c.name} (${c.email})`,
	}));

	const carOptions = cars.map((c) => ({
		value: c._id,
		label: `${c.brand?.name} ${c.carModel?.name} ${c.year} (${c.vin})`,
	}));

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await createClientPayment({
				variables: {
					input: {
						client: formData.client,
						car: formData.car,
						amount: Number(formData.amount),
						paymentDate: formData.paymentDate,
						paymentMethod: formData.paymentMethod || undefined,
						pendingBalance: formData.pendingBalance
							? Number(formData.pendingBalance)
							: undefined,
					},
				},
			});
			toast.success("Pago de cliente registrado exitosamente");
			setIsCreateModalOpen(false);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al registrar pago");
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		if (!editingPayment) return;
		try {
			await updateClientPayment({
				variables: {
					id: editingPayment._id,
					input: {
						amount: Number(formData.amount),
						paymentDate: formData.paymentDate,
						paymentMethod: formData.paymentMethod || undefined,
						pendingBalance: formData.pendingBalance
							? Number(formData.pendingBalance)
							: undefined,
					},
				},
			});
			toast.success("Pago actualizado exitosamente");
			setEditingPayment(null);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al actualizar pago");
		}
	};

	const handleDelete = async (id) => {
		try {
			await deleteClientPayment({ variables: { id } });
			toast.success("Pago eliminado exitosamente");
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al eliminar pago");
		}
		setDeleteConfirm(null);
	};

	const openEditModal = (payment) => {
		setEditingPayment(payment);
		setFormData({
			client: payment.client?._id || "",
			car: payment.car?._id || "",
			amount: payment.amount?.toString() || "",
			paymentDate: payment.paymentDate
				? payment.paymentDate.split("T")[0]
				: new Date().toISOString().split("T")[0],
			paymentMethod: payment.paymentMethod || "",
			pendingBalance: payment.pendingBalance?.toString() || "",
		});
		setReceipt(payment.receipt ? [payment.receipt] : []);
	};

	const resetForm = () => {
		setFormData({
			client: "",
			car: "",
			amount: "",
			paymentDate: new Date().toISOString().split("T")[0],
			paymentMethod: "",
			pendingBalance: "",
		});
		setReceipt([]);
	};

	const handleReceiptChange = (images) => {
		setReceipt(images);
		setFormData((p) => ({ ...p, receipt: images[0] || "" }));
	};

	const paymentMethodOptions = [
		{ value: "Transfer", label: "Transferencia" },
		{ value: "Cash", label: "Efectivo" },
		{ value: "Card", label: "Tarjeta" },
		{ value: "Check", label: "Cheque" },
	];

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando pagos..." />;

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">Pagos de Clientes</h1>
						<p className="text-first/50 mt-1">
							{payments.length} pagos registrados
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => setIsCreateModalOpen(true)}
					>
						Nuevo pago
					</Button>
				</div>

				{payments.length > 0 ? (
					<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-first/10">
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Cliente
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Auto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Monto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Fecha
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Método
										</th>
										<th className="text-right p-4 text-xs font-medium text-first/40 uppercase">
											Acciones
										</th>
									</tr>
								</thead>
								<tbody>
									{payments.map((payment) => (
										<tr
											key={payment._id}
											className="border-b border-first/5 hover:bg-first/5 transition-colors"
										>
											<td className="p-4">
												<p className="font-medium text-first text-sm">
													{payment.client?.name}
												</p>
												<p className="text-xs text-first/40">
													{payment.client?.email}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/70">
													{payment.car?.brand?.name}{" "}
													{payment.car?.carModel?.name}
												</p>
												<p className="text-xs text-first/40">
													{payment.car?.year}
												</p>
											</td>
											<td className="p-4">
												<p className="font-semibold text-first">
													{formatCRC(payment.amount)}
												</p>
												{payment.pendingBalance > 0 && (
													<p className="text-xs text-warning">
														Pendiente: {formatCRC(payment.pendingBalance)}
													</p>
												)}
											</td>
											<td className="p-4">
												<p className="text-sm text-first/60">
													{formatDate(payment.paymentDate)}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/60">
													{payment.paymentMethod || "—"}
												</p>
											</td>
											<td className="p-4">
												<div className="flex items-center justify-end gap-1">
													<Button
														iconOnly
														variant="ghost"
														size="sm"
														icon={<BsPencil className="w-3.5 h-3.5" />}
														onClick={() => openEditModal(payment)}
													/>
													<Button
														iconOnly
														variant="ghost"
														size="sm"
														className="text-error"
														icon={<BsTrash className="w-3.5 h-3.5" />}
														onClick={() => setDeleteConfirm(payment._id)}
													/>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<EmptyState
						title="No hay pagos de clientes registrados"
						description="Registra un nuevo pago de cliente para comenzar."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsCreateModalOpen(true)}
							>
								Nuevo pago
							</Button>
						}
					/>
				)}

				{/* Create/Edit Modal */}
				<Modal
					isOpen={isCreateModalOpen || !!editingPayment}
					onClose={() => {
						setIsCreateModalOpen(false);
						setEditingPayment(null);
						resetForm();
					}}
					title={
						editingPayment ? "Editar Pago de Cliente" : "Nuevo Pago de Cliente"
					}
					size="lg"
				>
					<form
						onSubmit={editingPayment ? handleUpdate : handleCreate}
						className="space-y-4"
					>
						<Select
							label="Cliente"
							required
							options={clientOptions}
							value={formData.client}
							onChange={(e) =>
								setFormData((p) => ({ ...p, client: e.target.value }))
							}
							disabled={!!editingPayment}
							placeholder="Seleccionar cliente..."
						/>
						<Select
							label="Auto"
							required
							options={carOptions}
							value={formData.car}
							onChange={(e) =>
								setFormData((p) => ({ ...p, car: e.target.value }))
							}
							disabled={!!editingPayment}
							placeholder="Seleccionar auto..."
						/>
						<div className="grid grid-cols-2 gap-4">
							<Input
								label="Monto (CRC)"
								type="number"
								required
								min={0}
								value={formData.amount}
								onChange={(e) =>
									setFormData((p) => ({ ...p, amount: e.target.value }))
								}
							/>
							<Input
								label="Saldo pendiente (CRC)"
								type="number"
								min={0}
								value={formData.pendingBalance}
								onChange={(e) =>
									setFormData((p) => ({ ...p, pendingBalance: e.target.value }))
								}
							/>
						</div>
						<Input
							label="Fecha del pago"
							type="date"
							required
							value={formData.paymentDate}
							onChange={(e) =>
								setFormData((p) => ({ ...p, paymentDate: e.target.value }))
							}
						/>
						<Select
							label="Método de pago"
							options={paymentMethodOptions}
							value={formData.paymentMethod}
							onChange={(e) =>
								setFormData((p) => ({ ...p, paymentMethod: e.target.value }))
							}
							placeholder="Seleccionar método..."
						/>
						<ImageUploader
							images={receipt}
							onImagesChange={handleReceiptChange}
							maxImages={1}
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setIsCreateModalOpen(false);
									setEditingPayment(null);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button type="submit">
								{editingPayment ? "Guardar cambios" : "Registrar pago"}
							</Button>
						</div>
					</form>
				</Modal>

				{/* Delete Confirmation */}
				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar pago de cliente"
					description="¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer."
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default ClientPaymentsManagementPage;
