import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_CARS } from "../../graphql/queries/carQueries";
import {
	CREATE_JC_PAYMENT,
	UPDATE_JC_PAYMENT,
} from "../../graphql/mutations/jcPaymentMutations";
import { useToast } from "../../context/ToastContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ImageUploader from "../cars/ImageUploader";

const initialFormData = {
	amount: "",
	actualPaymentDate: new Date().toISOString().split("T")[0],
	concept: "",
	associatedCars: [],
	transferReference: "",
};

const JCPaymentForm = ({ payment, onClose, onSuccess }) => {
	const { toast } = useToast();
	const isEditing = !!payment;

	const [formData, setFormData] = useState(() => {
		if (payment) {
			return {
				amount: payment.amount?.toString() || "",
				actualPaymentDate: payment.actualPaymentDate
					? payment.actualPaymentDate.split("T")[0]
					: new Date().toISOString().split("T")[0],
				concept: payment.concept || "",
				associatedCars: payment.associatedCars?.map((c) => c._id) || [],
				transferReference: payment.transferReference || "",
			};
		}
		return initialFormData;
	});

	const [errors, setErrors] = useState({});

	const [receipt, setReceipt] = useState(() => {
		return payment?.receipt ? [payment.receipt] : [];
	});

	const { data: carsData } = useQuery(GET_CARS, {
		variables: { page: 1, limit: 1000 },
	});
	const [createPayment, { loading: creating }] = useMutation(CREATE_JC_PAYMENT);
	const [updatePayment, { loading: updating }] = useMutation(UPDATE_JC_PAYMENT);

	const cars = carsData?.cars?.cars || [];
	const loading = creating || updating;

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const handleReceiptChange = (images) => {
		setReceipt(images);
		handleChange("receipt", images[0] || "");
	};

	const toggleCar = (carId) => {
		setFormData((prev) => ({
			...prev,
			associatedCars: prev.associatedCars.includes(carId)
				? prev.associatedCars.filter((id) => id !== carId)
				: [...prev.associatedCars, carId],
		}));
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.amount || Number(formData.amount) <= 0)
			newErrors.amount = "Requerido";
		if (!formData.actualPaymentDate) newErrors.actualPaymentDate = "Requerido";
		const today = new Date().toISOString().split("T")[0];
		if (formData.actualPaymentDate > today)
			newErrors.actualPaymentDate = "No puede ser fecha futura";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		const variables = {
			input: {
				amount: Number(formData.amount),
				actualPaymentDate: formData.actualPaymentDate,
				concept: formData.concept.trim() || undefined,
				associatedCars:
					formData.associatedCars.length > 0
						? formData.associatedCars
						: undefined,
				transferReference: formData.transferReference.trim() || undefined,
			},
		};

		try {
			if (isEditing) {
				await updatePayment({
					variables: { id: payment._id, input: variables.input },
				});
				toast.success("Pago actualizado");
			} else {
				await createPayment({ variables: { input: variables.input } });
				toast.success("Pago registrado");
			}
			onSuccess?.();
			onClose();
		} catch (error) {
			toast.error(error.message || "Error al guardar pago");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Monto (USD)"
				type="number"
				value={formData.amount}
				onChange={(e) => handleChange("amount", e.target.value)}
				error={errors.amount}
				min={0}
				step="0.01"
				size="sm"
			/>
			<Input
				label="Fecha real del pago"
				type="date"
				value={formData.actualPaymentDate}
				onChange={(e) => handleChange("actualPaymentDate", e.target.value)}
				error={errors.actualPaymentDate}
				max={new Date().toISOString().split("T")[0]}
				size="sm"
			/>
			<Input
				label="Concepto (opcional)"
				value={formData.concept}
				onChange={(e) => handleChange("concept", e.target.value)}
				placeholder="Ej: Pago parcial factura #123"
				size="sm"
			/>
			<Input
				label="Referencia de transferencia (opcional)"
				value={formData.transferReference}
				onChange={(e) => handleChange("transferReference", e.target.value)}
				size="sm"
			/>
			<div>
				<p className="text-sm font-medium text-first/80 mb-2">
					Autos asociados (opcional)
				</p>
				<div className="max-h-48 overflow-y-auto space-y-1 border border-first/10 rounded-xl p-2">
					{cars.length > 0 ? (
						cars.map((car) => (
							<label
								key={car._id}
								className="flex items-center gap-3 p-2 rounded-lg hover:bg-first/5 cursor-pointer"
							>
								<input
									type="checkbox"
									checked={formData.associatedCars.includes(car._id)}
									onChange={() => toggleCar(car._id)}
									className="rounded border-first/30"
								/>
								<div>
									<p className="text-sm text-first">
										{car.brand?.name} {car.carModel?.name} {car.year}
									</p>
									<p className="text-xs text-first/40">{car.vin}</p>
								</div>
							</label>
						))
					) : (
						<p className="text-sm text-first/30 text-center py-4">
							No hay autos disponibles
						</p>
					)}
				</div>
			</div>
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
					{isEditing ? "Guardar cambios" : "Registrar pago"}
				</Button>
			</div>
		</form>
	);
};

export default JCPaymentForm;
