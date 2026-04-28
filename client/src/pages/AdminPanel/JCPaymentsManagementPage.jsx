import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
	GET_JC_PAYMENTS,
	GET_JC_DEBT_SUMMARY,
} from "../../graphql/queries/jcPaymentQueries";
import { DELETE_JC_PAYMENT } from "../../graphql/mutations/jcPaymentMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import JCPaymentForm from "../../components/juanCarlos/JCPaymentForm";
import DebtSummary from "../../components/juanCarlos/DebtSummary";
import { BsPlus, BsPencil, BsTrash, BsFileText } from "react-icons/bs";
import { formatUSD, formatDate } from "../../utils/formatters";

const JCPaymentsManagementPage = () => {
	const { toast } = useToast();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingPayment, setEditingPayment] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const { data: paymentsData, loading, refetch } = useQuery(GET_JC_PAYMENTS);
	const { data: debtData, refetch: refetchDebt } =
		useQuery(GET_JC_DEBT_SUMMARY);
	const [deletePayment] = useMutation(DELETE_JC_PAYMENT);

	const payments = paymentsData?.jcPayments || [];
	const summary = debtData?.jcDebtSummary;

	const handleDelete = async (id) => {
		try {
			await deletePayment({ variables: { id } });
			toast.success("Pago eliminado");
			refetch();
			refetchDebt();
		} catch (error) {
			toast.error(error.message);
		}
		setDeleteConfirm(null);
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando pagos..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">
							Pagos a Juan Carlos
						</h1>
						<p className="text-first/50 mt-1">
							Control de deuda y pagos al socio en Florida
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => {
							setEditingPayment(null);
							setIsFormOpen(true);
						}}
					>
						Nuevo pago
					</Button>
				</div>

				<div className="mb-8">
					<DebtSummary summary={summary} />
				</div>

				{payments.length > 0 ? (
					<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-first/10">
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Monto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Fecha pago
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Concepto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Autos
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Referencia
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
											className="border-b border-first/5 hover:bg-first/5"
										>
											<td className="p-4">
												<p className="font-semibold text-first">
													{formatUSD(payment.amount)}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/60">
													{formatDate(payment.actualPaymentDate)}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/70">
													{payment.concept || "—"}
												</p>
											</td>
											<td className="p-4">
												<div className="flex flex-wrap gap-1">
													{payment.associatedCars?.length > 0 ? (
														payment.associatedCars.map((car) => (
															<Badge key={car._id} size="sm" variant="neutral">
																{car.brand?.name} {car.carModel?.name}
															</Badge>
														))
													) : (
														<span className="text-sm text-first/30">—</span>
													)}
												</div>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/50 font-mono">
													{payment.transferReference || "—"}
												</p>
											</td>

											<td className="p-4">
												<div className="flex items-center justify-end gap-1">
													{payment.updatable && (
														<>
															{payment.receipt && (
																<Button
																	iconOnly
																	variant="ghost"
																	size="sm"
																	className="text-second"
																	icon={<BsFileText className="w-3.5 h-3.5" />}
																	onClick={() =>
																		window.open(payment.receipt, "_blank")
																	}
																	title="Ver comprobante"
																/>
															)}
															<Button
																iconOnly
																variant="ghost"
																size="sm"
																icon={<BsPencil className="w-3.5 h-3.5" />}
																onClick={() => {
																	setEditingPayment(payment);
																	setIsFormOpen(true);
																}}
															/>
															<Button
																iconOnly
																variant="ghost"
																size="sm"
																className="text-error"
																icon={<BsTrash className="w-3.5 h-3.5" />}
																onClick={() => setDeleteConfirm(payment._id)}
															/>
														</>
													)}
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
						title="No hay pagos registrados"
						description="Registra un nuevo pago a Juan Carlos."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsFormOpen(true)}
							>
								Nuevo pago
							</Button>
						}
					/>
				)}

				<Modal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false);
						setEditingPayment(null);
					}}
					title={
						editingPayment ? "Editar Pago a JC" : "Nuevo Pago a Juan Carlos"
					}
					size="lg"
				>
					<JCPaymentForm
						payment={editingPayment}
						onClose={() => {
							setIsFormOpen(false);
							setEditingPayment(null);
						}}
						onSuccess={() => {
							refetch();
							refetchDebt();
						}}
					/>
				</Modal>

				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar pago"
					description="¿Estás seguro?"
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default JCPaymentsManagementPage;
