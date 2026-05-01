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
import ExpensesAnalytics from "../../components/expenses/ExpensesAnalytics";

import {
	BsPlus,
	BsPencil,
	BsTrash,
	BsSearch,
	BsCarFront,
	BsCalendar,
	BsCash,
	BsFileText,
	BsGraphUp,
} from "react-icons/bs";

import {
	formatCRC,
	formatUSD,
	formatDate,
	getDetailsTranslation,
} from "../../utils/formatters";

const ExpensesManagementPage = () => {
	const { toast } = useToast();
	const [search, setSearch] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [showAnalytics, setShowAnalytics] = useState(false);

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
			exp.car?.vin?.toLowerCase().includes(s) ||
			exp.car?.year?.toString().includes(s) ||
			(
				exp.car?.carModel?.name?.toLowerCase() +
				" " +
				exp.car?.year?.toString()
			).includes(s)
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
		<div className="min-h-screen pb-16">
			<div className="px-4 sm:px-6 lg:px-8 py-6">
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

				<div className="flex flex-col md:flex-row gap-4 mb-6">
					<div className="relative max-w-md">
						<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-first/30" />
						<input
							type="text"
							placeholder="Buscar gastos..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-xl border border-first/10 bg-main text-first text-sm focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second placeholder:text-first/30"
						/>
					</div>
				</div>

				{/* Analytics Section */}
				{/* Analytics Section */}
				{expenses.length > 0 && (
					<div className="mb-8">
						<div className="flex justify-center mb-5">
							<Button
								onClick={() => setShowAnalytics(!showAnalytics)}
								icon={<BsGraphUp className="w-4 h-4" />}
								variant="outline"
							>
								{showAnalytics ? "Ocultar analíticas" : "Ver analíticas"}
							</Button>
						</div>
						{showAnalytics && <ExpensesAnalytics expenses={filteredExpenses} />}
					</div>
				)}

				{filteredExpenses.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{filteredExpenses.map((expense) => (
							<div
								key={expense._id}
								className="bg-main rounded-2xl border border-first/10 hover:shadow-lg hover:border-second/20 transition-all duration-200"
							>
								<div className="p-4">
									{/* Car info */}
									<div className="flex items-center gap-2 mb-3">
										<div className="w-10 h-10 rounded-lg bg-first/5 flex items-center justify-center shrink-0">
											<BsCarFront className="w-5 h-5 text-first/30" />
										</div>
										<div className="min-w-0">
											<p className="text-sm font-medium text-first truncate">
												{expense.car?.carModel?.name} {expense.car?.year}{" "}
												{expense.car?.color}
											</p>
											<p className="text-xs text-first/40">
												{expense.car?.vin}
											</p>
										</div>
									</div>

									{/* Type & JC Badge */}
									<div className="flex items-center gap-2 mb-3">
										<Badge
											size="sm"
											variant={expense.isFromJuanCarlos ? "info" : "neutral"}
										>
											{expense.isFromJuanCarlos ? "JC" : "MBV"}
										</Badge>
										<p className="text-sm text-first/70 truncate">
											{getDetailsTranslation("expenseType", expense.type)}
										</p>
									</div>

									{expense.description && (
										<p className="text-xs text-first/40 mb-3 truncate">
											{expense.description}
										</p>
									)}

									{/* Amount & Date */}
									<div className="flex items-center justify-between pt-3 border-t border-first/5">
										<div className="flex items-center gap-1.5">
											<BsCash className="w-3.5 h-3.5 text-first/30" />
											<p className="text-lg font-bold text-second">
												{expense.currency === "CRC"
													? formatCRC(expense.amount)
													: formatUSD(expense.amount)}
											</p>
										</div>
										<div className="flex items-center gap-1.5 text-xs text-first/40">
											<BsCalendar className="w-3 h-3" />
											{formatDate(expense.expenseDate)}
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="px-4 pb-3 flex gap-1 justify-end border-t border-first/5 pt-2">
									{expense.receipt && (
										<Button
											iconOnly
											variant="ghost"
											size="sm"
											className="text-second"
											icon={<BsFileText className="w-3.5 h-3.5" />}
											onClick={() => window.open(expense.receipt, "_blank")}
											title="Ver comprobante"
										/>
									)}
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
							</div>
						))}
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
