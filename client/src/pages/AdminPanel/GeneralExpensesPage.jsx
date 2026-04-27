import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_GENERAL_EXPENSES } from "../../graphql/queries/generalExpenseQueries";
import { DELETE_GENERAL_EXPENSE } from "../../graphql/mutations/generalExpenseMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import GeneralExpenseForm from "../../components/expenses/GeneralExpenseForm";
import { BsPlus, BsPencil, BsTrash } from "react-icons/bs";
import { formatCRC, formatUSD, formatDate } from "../../utils/formatters";

const GeneralExpensesPage = () => {
	const { toast } = useToast();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const { data, loading, refetch } = useQuery(GET_GENERAL_EXPENSES);
	const [deleteExpense] = useMutation(DELETE_GENERAL_EXPENSE);

	const expenses = data?.generalExpenses || [];

	const handleDelete = async (id) => {
		try {
			await deleteExpense({ variables: { id } });
			toast.success("Gasto eliminado");
			refetch();
		} catch (error) {
			toast.error(error.message);
		}
		setDeleteConfirm(null);
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando gastos..." />;

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">Gastos Generales</h1>
						<p className="text-first/50 mt-1">
							{expenses.length} gastos (no ligados a autos)
						</p>
					</div>
					<Button
						icon={<BsPlus className="w-4 h-4" />}
						onClick={() => {
							setEditingExpense(null);
							setIsFormOpen(true);
						}}
					>
						Nuevo gasto
					</Button>
				</div>

				{expenses.length > 0 ? (
					<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-first/10">
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Concepto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Monto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Fecha
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Descripción
										</th>
										<th className="text-right p-4 text-xs font-medium text-first/40 uppercase">
											Acciones
										</th>
									</tr>
								</thead>
								<tbody>
									{expenses.map((expense) => (
										<tr
											key={expense._id}
											className="border-b border-first/5 hover:bg-first/5"
										>
											<td className="p-4">
												<p className="font-medium text-first text-sm">
													{expense.concept}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm font-medium text-first">
													{expense.currency === "CRC"
														? formatCRC(expense.amount)
														: formatUSD(expense.amount)}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/60">
													{formatDate(expense.expenseDate)}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/50 max-w-xs truncate">
													{expense.description || "—"}
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
															setEditingExpense(expense);
															setIsFormOpen(true);
														}}
													/>
													<Button
														iconOnly
														variant="ghost"
														size="sm"
														className="text-error"
														icon={<BsTrash className="w-3.5 h-3.5" />}
														onClick={() => setDeleteConfirm(expense._id)}
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
						title="No hay gastos generales"
						description="Crea un nuevo gasto general para comenzar."
						action={
							<Button
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setIsFormOpen(true)}
							>
								Nuevo gasto
							</Button>
						}
					/>
				)}

				<Modal
					isOpen={isFormOpen}
					onClose={() => {
						setIsFormOpen(false);
						setEditingExpense(null);
					}}
					title={
						editingExpense ? "Editar Gasto General" : "Nuevo Gasto General"
					}
					size="md"
				>
					<GeneralExpenseForm
						expense={editingExpense}
						onClose={() => {
							setIsFormOpen(false);
							setEditingExpense(null);
						}}
						onSuccess={() => refetch()}
					/>
				</Modal>

				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar gasto general"
					description="¿Estás seguro?"
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default GeneralExpensesPage;
