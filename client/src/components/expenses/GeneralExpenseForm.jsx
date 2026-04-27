import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
	CREATE_GENERAL_EXPENSE,
	UPDATE_GENERAL_EXPENSE,
} from "../../graphql/mutations/generalExpenseMutations";
import { useToast } from "../../context/ToastContext";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import ImageUploader from "../cars/ImageUploader";

const initialFormData = {
	concept: "",
	amount: "",
	currency: "CRC",
	expenseDate: new Date().toISOString().split("T")[0],
	description: "",
};

const GeneralExpenseForm = ({ expense, onClose, onSuccess }) => {
	const { toast } = useToast();
	const isEditing = !!expense;

	const [formData, setFormData] = useState(() => {
		if (expense) {
			return {
				concept: expense.concept || "",
				amount: expense.amount?.toString() || "",
				currency: expense.currency || "CRC",
				expenseDate: expense.expenseDate
					? expense.expenseDate.split("T")[0]
					: new Date().toISOString().split("T")[0],
				description: expense.description || "",
			};
		}
		return initialFormData;
	});

	const [errors, setErrors] = useState({});

	const [receipt, setReceipt] = useState(() => {
		return expense?.receipt ? [expense.receipt] : [];
	});

	const [createExpense, { loading: creating }] = useMutation(
		CREATE_GENERAL_EXPENSE,
	);
	const [updateExpense, { loading: updating }] = useMutation(
		UPDATE_GENERAL_EXPENSE,
	);

	const loading = creating || updating;

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const handleReceiptChange = (images) => {
		setReceipt(images);
		handleChange("receipt", images[0] || "");
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.concept.trim()) newErrors.concept = "Requerido";
		if (!formData.amount || Number(formData.amount) <= 0)
			newErrors.amount = "Requerido";
		if (!formData.expenseDate) newErrors.expenseDate = "Requerido";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		const variables = {
			input: {
				concept: formData.concept.trim(),
				amount: Number(formData.amount),
				currency: formData.currency,
				expenseDate: formData.expenseDate,
				description: formData.description.trim() || undefined,
			},
		};

		try {
			if (isEditing) {
				await updateExpense({
					variables: { id: expense._id, input: variables.input },
				});
				toast.success("Gasto actualizado");
			} else {
				await createExpense({ variables: { input: variables.input } });
				toast.success("Gasto creado");
			}
			onSuccess?.();
			onClose();
		} catch (error) {
			toast.error(error.message || "Error al guardar gasto");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Concepto"
				value={formData.concept}
				onChange={(e) => handleChange("concept", e.target.value)}
				error={errors.concept}
				placeholder="Ej: Pago a contadora, Publicidad..."
				size="sm"
			/>
			<div className="grid grid-cols-2 gap-4">
				<Input
					label="Monto"
					type="number"
					value={formData.amount}
					onChange={(e) => handleChange("amount", e.target.value)}
					error={errors.amount}
					min={0}
					size="sm"
				/>
				<Select
					label="Moneda"
					options={[
						{ value: "CRC", label: "CRC" },
						{ value: "USD", label: "USD" },
					]}
					value={formData.currency}
					onChange={(e) => handleChange("currency", e.target.value)}
					size="sm"
				/>
			</div>
			<Input
				label="Fecha del gasto"
				type="date"
				value={formData.expenseDate}
				onChange={(e) => handleChange("expenseDate", e.target.value)}
				error={errors.expenseDate}
				size="sm"
			/>
			<Input
				label="Descripción (opcional)"
				value={formData.description}
				onChange={(e) => handleChange("description", e.target.value)}
				size="sm"
			/>
			<ImageUploader
				images={receipt}
				onImagesChange={handleReceiptChange}
				maxImages={1}
			/>
			<div className="flex justify-end gap-3 pt-4 border-t border-first/10">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" loading={loading}>
					{isEditing ? "Guardar cambios" : "Crear gasto"}
				</Button>
			</div>
		</form>
	);
};

export default GeneralExpenseForm;
