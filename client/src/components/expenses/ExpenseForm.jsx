import { useState } from "react";
import { useMutation } from "@apollo/client/react";

import {
	CREATE_EXPENSE,
	UPDATE_EXPENSE,
} from "../../graphql/mutations/expenseMutations";

import { useToast } from "../../context/ToastContext";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import ImageUploader from "../cars/ImageUploader";

import { EXPENSE_TYPE_OPTIONS } from "../../utils/constants";
import CarSearchSelect from "../cars/CarSearchSelect";

const initialFormData = {
	car: "",
	type: "",
	description: "",
	amount: "",
	currency: "CRC",
	expenseDate: new Date().toISOString().split("T")[0],
	isFromJuanCarlos: false,
};

const ExpenseForm = ({ expense, onClose, onSuccess }) => {
	const { toast } = useToast();
	const isEditing = !!expense;

	const [formData, setFormData] = useState(() => {
		if (expense) {
			return {
				car: expense.car?._id || "",
				type: expense.type || "",
				description: expense.description || "",
				amount: expense.amount?.toString() || "",
				currency: expense.currency || "CRC",
				expenseDate: expense.expenseDate
					? expense.expenseDate.split("T")[0]
					: new Date().toISOString().split("T")[0],
				isFromJuanCarlos: expense.isFromJuanCarlos || false,
			};
		}
		return initialFormData;
	});

	const [errors, setErrors] = useState({});

	const [receipt, setReceipt] = useState(() => {
		return expense?.receipt ? [expense.receipt] : [];
	});

	const [createExpense, { loading: creating }] = useMutation(CREATE_EXPENSE);
	const [updateExpense, { loading: updating }] = useMutation(UPDATE_EXPENSE);

	const loading = creating || updating;

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const handleTypeChange = (type) => {
		const expenseType = EXPENSE_TYPE_OPTIONS.find((opt) => opt.value === type);
		setFormData((prev) => ({
			...prev,
			type,
			isFromJuanCarlos: expenseType?.isJC || false,
		}));
	};

	const handleReceiptChange = (images) => {
		setReceipt(images);
		handleChange("receipt", images[0] || "");
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.car) newErrors.car = "Requerido";
		if (!formData.type) newErrors.type = "Requerido";
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
				car: formData.car,
				type: formData.type,
				description: formData.description.trim() || undefined,
				amount: Number(formData.amount),
				currency: formData.currency,
				expenseDate: formData.expenseDate,
				isFromJuanCarlos: formData.isFromJuanCarlos,
				receipt: formData.receipt || undefined,
			},
		};

		try {
			if (isEditing) {
				await updateExpense({
					variables: {
						id: expense._id,
						input: {
							type: formData.type,
							description: formData.description.trim() || undefined,
							amount: Number(formData.amount),
							currency: formData.currency,
							expenseDate: formData.expenseDate,
							isFromJuanCarlos: formData.isFromJuanCarlos,
							receipt: formData.receipt || undefined,
						},
					},
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
			<CarSearchSelect
				value={formData.car}
				onChange={(id) => handleChange("car", id)}
				disabled={isEditing}
			/>
			<Select
				label="Tipo de gasto"
				options={EXPENSE_TYPE_OPTIONS}
				value={formData.type}
				onChange={(e) => handleTypeChange(e.target.value)}
				error={errors.type}
				placeholder="Seleccionar tipo..."
				size="sm"
			/>
			<Input
				label="Descripción"
				value={formData.description}
				onChange={(e) => handleChange("description", e.target.value)}
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

export default ExpenseForm;
