import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_EXPENSES } from "../../graphql/queries/expenseQueries";
import { DELETE_EXPENSE } from "../../graphql/mutations/expenseMutations";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import ExpenseForm from "../../components/expenses/ExpenseForm";
import { BsPlus, BsPencil, BsTrash, BsSearch } from "react-icons/bs";
import { formatCRC, formatUSD, formatDate } from "../../utils/formatters";

const ExpensesManagementPage = () => {
	const { toast } = useToast();
	const [search, setSearch] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);

	const { data, loading, refetch } = useQuery(GET_EXPENSES);
	const [deleteExpense] = useMutation(DELETE_EXPENSE);

	const expenses = data?.expenses || [];

	const filteredExpenses = expenses.filter((exp) => {
		if (!search) return true;
		const s = search.toLowerCase();
		return (
			exp.type?.toLowerCase().includes(s) ||
			exp.car?.brand?.name?.toLowerCase().includes(s) ||
			exp.car?.carModel?.name?.toLowerCase().includes(s) ||
			exp.description?.toLowerCase().includes(s)
		);
	});

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
						<h1 className="text-3xl font-bold text-first">Gestión de Gastos</h1>
						<p className="text-first/50 mt-1">{expenses.length} gastos</p>
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

				<div className="max-w-md mb-6">
					<div className="relative">
						<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-first/30" />
						<input
							type="text"
							placeholder="Buscar gastos..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-xl border border-first/10 bg-main text-first text-sm
                       focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second placeholder:text-first/30"
						/>
					</div>
				</div>

				{filteredExpenses.length > 0 ? (
					<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-first/10">
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Auto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Tipo
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Monto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Fecha
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											JC
										</th>
										<th className="text-right p-4 text-xs font-medium text-first/40 uppercase">
											Acciones
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredExpenses.map((expense) => (
										<tr
											key={expense._id}
											className="border-b border-first/5 hover:bg-first/5"
										>
											<td className="p-4">
												<p className="font-medium text-first text-sm">
													{expense.car?.brand?.name}{" "}
													{expense.car?.carModel?.name}
												</p>
												<p className="text-xs text-first/40">
													{expense.car?.year}
												</p>
											</td>
											<td className="p-4">
												<p className="text-sm text-first/70">{expense.type}</p>
												{expense.description && (
													<p className="text-xs text-first/40">
														{expense.description}
													</p>
												)}
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
												<Badge
													size="sm"
													variant={
														expense.isFromJuanCarlos ? "info" : "neutral"
													}
												>
													{expense.isFromJuanCarlos ? "JC" : "MBV"}
												</Badge>
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
						title="No se encontraron gastos"
						description="Crea un nuevo gasto o ajusta la búsqueda."
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
					title={editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
					size="lg"
				>
					<ExpenseForm
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
					title="Eliminar gasto"
					description="¿Estás seguro?"
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default ExpensesManagementPage;
