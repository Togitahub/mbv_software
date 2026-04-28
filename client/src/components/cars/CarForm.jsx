import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
	GET_BRANDS,
	GET_CAR_MODELS,
} from "../../graphql/queries/brandModelQueries";
import { GET_CLIENTS } from "../../graphql/queries/userQueries";
import { CREATE_CAR, UPDATE_CAR } from "../../graphql/mutations/carMutations";
import {
	CREATE_BRAND,
	CREATE_CAR_MODEL,
} from "../../graphql/mutations/brandModelMutations";
import { useToast } from "../../context/ToastContext";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import ImageUploader from "./ImageUploader";
import {
	LOGISTIC_STATUS_OPTIONS,
	AVAILABILITY_OPTIONS,
	FUEL_TYPE_OPTIONS,
	TRANSMISSION_OPTIONS,
	DRIVETRAIN_OPTIONS,
	BODY_TYPE_OPTIONS,
	OWNER_OPTIONS,
} from "../../utils/constants";
import { BsPlus } from "react-icons/bs";

const initialFormData = {
	brand: "",
	carModel: "",
	vin: "",
	dua: "",
	year: new Date().getFullYear(),
	purchaseDate: new Date().toISOString().split("T")[0],
	duaRegistrationDate: "",
	publishedPriceCRC: "",
	purchaseValueUSD: "",
	invoiceValueUSD: "",
	owner: "MBV",
	assignedClient: "",
	logisticStatus: "In transit",
	availability: "Available",
	actualMileage: "",
	adjustedMileage: "",
	fuelType: "Gasoline",
	engine: "",
	transmission: "Automatic",
	drivetrain: "Front",
	color: "",
	description: "",
	bodyType: "SUV",
	images: [],
};

const initialMandatoryExpenses = {
	shippingLine: {
		amount: "",
		currency: "CRC",
		expenseDate: new Date().toISOString().split("T")[0],
	},
	inspection: {
		amount: "",
		currency: "USD",
		expenseDate: new Date().toISOString().split("T")[0],
	},
	towTruck: {
		amount: "",
		currency: "USD",
		expenseDate: new Date().toISOString().split("T")[0],
	},
};

const CarForm = ({ car, onClose, onSuccess }) => {
	const { toast } = useToast();
	const isEditing = !!car;

	const [formData, setFormData] = useState(() => {
		if (car) {
			return {
				brand: car.brand?._id || "",
				carModel: car.carModel?._id || "",
				vin: car.vin || "",
				dua: car.dua || "",
				year: car.year || new Date().getFullYear(),
				purchaseDate: car.purchaseDate
					? car.purchaseDate.split("T")[0]
					: new Date().toISOString().split("T")[0],
				duaRegistrationDate: car.duaRegistrationDate
					? car.duaRegistrationDate.split("T")[0]
					: "",
				publishedPriceCRC: car.publishedPriceCRC || "",
				purchaseValueUSD: car.purchaseValueUSD || "",
				invoiceValueUSD: car.invoiceValueUSD || "",
				owner: car.owner || "MBV",
				assignedClient: car.assignedClient?._id || "",
				logisticStatus: car.logisticStatus || "In transit",
				availability: car.availability || "Available",
				actualMileage: car.actualMileage || "",
				adjustedMileage: car.adjustedMileage || "",
				fuelType: car.fuelType || "Gasoline",
				engine: car.engine || "",
				transmission: car.transmission || "Automatic",
				drivetrain: car.drivetrain || "Front",
				color: car.color || "",
				description: car.description || "",
				bodyType: car.bodyType || "SUV",
				images: car.images || [],
			};
		}
		return initialFormData;
	});
	const [mandatoryExpenses, setMandatoryExpenses] = useState(
		initialMandatoryExpenses,
	);
	const [optionalExpenses, setOptionalExpenses] = useState([]);
	const [showNewBrand, setShowNewBrand] = useState(false);
	const [showNewModel, setShowNewModel] = useState(false);
	const [newBrandName, setNewBrandName] = useState("");
	const [newModelName, setNewModelName] = useState("");
	const [errors, setErrors] = useState({});

	const { data: brandsData, refetch: refetchBrands } = useQuery(GET_BRANDS);
	const { data: modelsData, refetch: refetchModels } = useQuery(
		GET_CAR_MODELS,
		{
			variables: { brandId: formData.brand || undefined },
		},
	);
	const { data: clientsData } = useQuery(GET_CLIENTS);

	const [createCar, { loading: creating }] = useMutation(CREATE_CAR);
	const [updateCar, { loading: updating }] = useMutation(UPDATE_CAR);
	const [createBrand] = useMutation(CREATE_BRAND);
	const [createCarModel] = useMutation(CREATE_CAR_MODEL);

	const brands = brandsData?.brands || [];
	const models = modelsData?.carModels || [];
	const clients = clientsData?.clients || [];

	const brandOptions = brands.map((b) => ({ value: b._id, label: b.name }));
	const modelOptions = models.map((m) => ({ value: m._id, label: m.name }));
	const clientOptions = clients.map((c) => ({
		value: c._id,
		label: `${c.name} (${c.email})`,
	}));

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const handleMandatoryExpenseChange = (type, field, value) => {
		setMandatoryExpenses((prev) => ({
			...prev,
			[type]: { ...prev[type], [field]: value },
		}));
	};

	const handleAddOptionalExpense = () => {
		setOptionalExpenses((prev) => [
			...prev,
			{
				id: Date.now(),
				type: "Other expenses",
				description: "",
				amount: "",
				currency: "CRC",
				expenseDate: new Date().toISOString().split("T")[0],
				isFromJuanCarlos: false,
			},
		]);
	};

	const handleOptionalExpenseChange = (id, field, value) => {
		setOptionalExpenses((prev) =>
			prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
		);
	};

	const handleRemoveOptionalExpense = (id) => {
		setOptionalExpenses((prev) => prev.filter((exp) => exp.id !== id));
	};

	const handleCreateBrand = async () => {
		if (!newBrandName.trim()) return;
		try {
			const { data } = await createBrand({
				variables: { input: { name: newBrandName.trim() } },
			});
			setFormData((prev) => ({ ...prev, brand: data.createBrand._id }));
			setNewBrandName("");
			setShowNewBrand(false);
			refetchBrands();
			toast.success("Marca creada exitosamente");
		} catch (error) {
			toast.error(error.message || "Error al crear marca");
		}
	};

	const handleCreateModel = async () => {
		if (!newModelName.trim() || !formData.brand) return;
		try {
			const { data } = await createCarModel({
				variables: {
					input: { name: newModelName.trim(), brand: formData.brand },
				},
			});
			console.log("Model created:", data);
			setFormData((prev) => ({ ...prev, carModel: data.createCarModel._id }));
			setNewModelName("");
			setShowNewModel(false);
			refetchModels({ brandId: formData.brand });
			toast.success("Modelo creado exitosamente");
		} catch (error) {
			toast.error(error.message || "Error al crear modelo");
		}
	};

	const validate = () => {
		const newErrors = {};

		if (!formData.brand) newErrors.brand = "Requerido";
		if (!formData.carModel) newErrors.carModel = "Requerido";
		if (!formData.vin.trim()) newErrors.vin = "Requerido";
		if (!formData.dua.trim()) newErrors.dua = "Requerido";
		if (!formData.year) newErrors.year = "Requerido";
		if (!formData.purchaseDate) newErrors.purchaseDate = "Requerido";
		if (!formData.publishedPriceCRC || Number(formData.publishedPriceCRC) <= 0)
			newErrors.publishedPriceCRC = "Requerido";
		if (!formData.purchaseValueUSD || Number(formData.purchaseValueUSD) <= 0)
			newErrors.purchaseValueUSD = "Requerido";
		if (!formData.invoiceValueUSD || Number(formData.invoiceValueUSD) <= 0)
			newErrors.invoiceValueUSD = "Requerido";
		if (!formData.actualMileage || Number(formData.actualMileage) < 0)
			newErrors.actualMileage = "Requerido";
		if (!formData.engine.trim()) newErrors.engine = "Requerido";
		if (!formData.color.trim()) newErrors.color = "Requerido";

		if (!isEditing) {
			if (
				!mandatoryExpenses.shippingLine.amount ||
				Number(mandatoryExpenses.shippingLine.amount) <= 0
			)
				newErrors.shippingLineAmount = "Requerido";
			if (
				!mandatoryExpenses.inspection.amount ||
				Number(mandatoryExpenses.inspection.amount) <= 0
			)
				newErrors.inspectionAmount = "Requerido";
			if (
				!mandatoryExpenses.towTruck.amount ||
				Number(mandatoryExpenses.towTruck.amount) <= 0
			)
				newErrors.towTruckAmount = "Requerido";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		const variables = {
			input: {
				brand: formData.brand,
				carModel: formData.carModel,
				vin: formData.vin.trim(),
				dua: formData.dua.trim(),
				year: Number(formData.year),
				purchaseDate: formData.purchaseDate,
				duaRegistrationDate: formData.duaRegistrationDate || undefined,
				publishedPriceCRC: Number(formData.publishedPriceCRC),
				purchaseValueUSD: Number(formData.purchaseValueUSD),
				invoiceValueUSD: Number(formData.invoiceValueUSD),
				owner: formData.owner,
				assignedClient: formData.assignedClient || undefined,
				logisticStatus: formData.logisticStatus,
				availability:
					formData.owner === "Client" ? "Reserved" : formData.availability,
				actualMileage: Number(formData.actualMileage),
				adjustedMileage: formData.adjustedMileage
					? Number(formData.adjustedMileage)
					: undefined,
				fuelType: formData.fuelType,
				engine: formData.engine.trim(),
				transmission: formData.transmission,
				drivetrain: formData.drivetrain,
				color: formData.color.trim(),
				description: formData.description.trim() || undefined,
				bodyType: formData.bodyType,
				images: formData.images,
			},
		};

		if (!isEditing) {
			// Agregar gastos obligatorios y opcionales
			const expenseInputs = [
				{
					car: "", // Se asignará en el resolver
					type: "Shipping line",
					amount: Number(mandatoryExpenses.shippingLine.amount),
					currency: mandatoryExpenses.shippingLine.currency,
					expenseDate: mandatoryExpenses.shippingLine.expenseDate,
					isFromJuanCarlos: false,
				},
				{
					car: "",
					type: "Inspection",
					amount: Number(mandatoryExpenses.inspection.amount),
					currency: mandatoryExpenses.inspection.currency,
					expenseDate: mandatoryExpenses.inspection.expenseDate,
					isFromJuanCarlos: true,
				},
				{
					car: "",
					type: "Tow truck",
					amount: Number(mandatoryExpenses.towTruck.amount),
					currency: mandatoryExpenses.towTruck.currency,
					expenseDate: mandatoryExpenses.towTruck.expenseDate,
					isFromJuanCarlos: true,
				},
				...optionalExpenses
					.filter((exp) => exp.amount && Number(exp.amount) > 0)
					.map((exp) => ({
						car: "",
						type: exp.type,
						description: exp.description || undefined,
						amount: Number(exp.amount),
						currency: exp.currency,
						expenseDate: exp.expenseDate,
						isFromJuanCarlos: exp.isFromJuanCarlos,
					})),
			];
			variables.expenseInputs = expenseInputs;
		}

		try {
			if (isEditing) {
				await updateCar({ variables: { id: car._id, input: variables.input } });
				toast.success("Auto actualizado exitosamente");
			} else {
				await createCar({ variables });
				toast.success("Auto creado exitosamente");
			}
			onSuccess?.();
			onClose();
		} catch (error) {
			toast.error(error.message || "Error al guardar auto");
		}
	};

	const loading = creating || updating;

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 max-h-[80vh] overflow-y-auto px-1"
		>
			{/* Sección 1: Identificación */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
					Identificación del Vehículo
				</h3>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<div className="flex items-end gap-2">
							<div className="flex-1">
								<Select
									label="Marca"
									options={brandOptions}
									value={formData.brand}
									onChange={(e) => handleChange("brand", e.target.value)}
									error={errors.brand}
									placeholder="Seleccionar..."
									size="sm"
								/>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								iconOnly
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => setShowNewBrand(!showNewBrand)}
							/>
						</div>
						{showNewBrand && (
							<div className="flex gap-2 mt-2">
								<Input
									size="sm"
									placeholder="Nueva marca"
									value={newBrandName}
									onChange={(e) => setNewBrandName(e.target.value)}
									onKeyDown={(e) =>
										e.key === "Enter" &&
										(e.preventDefault(), handleCreateBrand())
									}
								/>
								<Button type="button" size="sm" onClick={handleCreateBrand}>
									Crear
								</Button>
							</div>
						)}
					</div>

					<div>
						<div className="flex items-end gap-2">
							<div className="flex-1">
								<Select
									label="Modelo"
									options={modelOptions}
									value={formData.carModel}
									onChange={(e) => handleChange("carModel", e.target.value)}
									error={errors.carModel}
									placeholder="Seleccionar..."
									size="sm"
									disabled={!formData.brand}
								/>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								iconOnly
								icon={<BsPlus className="w-4 h-4" />}
								onClick={() => formData.brand && setShowNewModel(!showNewModel)}
								disabled={!formData.brand}
							/>
						</div>
						{showNewModel && (
							<div className="flex gap-2 mt-2">
								<Input
									size="sm"
									placeholder="Nuevo modelo"
									value={newModelName}
									onChange={(e) => setNewModelName(e.target.value)}
									onKeyDown={(e) =>
										e.key === "Enter" &&
										(e.preventDefault(), handleCreateModel())
									}
								/>
								<Button type="button" size="sm" onClick={handleCreateModel}>
									Crear
								</Button>
							</div>
						)}
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<Input
						label="VIN"
						size="sm"
						value={formData.vin}
						onChange={(e) => handleChange("vin", e.target.value)}
						error={errors.vin}
						placeholder="Número VIN"
					/>
					<Input
						label="DUA"
						size="sm"
						value={formData.dua}
						onChange={(e) => handleChange("dua", e.target.value)}
						error={errors.dua}
						placeholder="Número DUA"
					/>
					<Input
						label="Año"
						type="number"
						size="sm"
						value={formData.year}
						onChange={(e) => handleChange("year", e.target.value)}
						error={errors.year}
						min={1990}
						max={new Date().getFullYear() + 1}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Fecha de compra (USA)"
						type="date"
						size="sm"
						value={formData.purchaseDate}
						onChange={(e) => handleChange("purchaseDate", e.target.value)}
						error={errors.purchaseDate}
					/>
					<Input
						label="Fecha registro DUA"
						type="date"
						size="sm"
						value={formData.duaRegistrationDate}
						onChange={(e) =>
							handleChange("duaRegistrationDate", e.target.value)
						}
					/>
				</div>
			</div>

			{/* Sección 2: Precios */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
					Precios y Valores
				</h3>
				<div className="grid grid-cols-3 gap-4">
					<Input
						label="Precio publicado (CRC)"
						type="number"
						size="sm"
						value={formData.publishedPriceCRC}
						onChange={(e) => handleChange("publishedPriceCRC", e.target.value)}
						error={errors.publishedPriceCRC}
						min={0}
					/>
					<Input
						label="Valor de compra (USD)"
						type="number"
						size="sm"
						value={formData.purchaseValueUSD}
						onChange={(e) => handleChange("purchaseValueUSD", e.target.value)}
						error={errors.purchaseValueUSD}
						min={0}
						step="0.01"
					/>
					<Input
						label="Valor de factura (USD)"
						type="number"
						size="sm"
						value={formData.invoiceValueUSD}
						onChange={(e) => handleChange("invoiceValueUSD", e.target.value)}
						error={errors.invoiceValueUSD}
						min={0}
						step="0.01"
					/>
				</div>
			</div>

			{/* Sección 3: Propiedad y Estados */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
					Propiedad y Estados
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<Select
						label="Dueño"
						options={OWNER_OPTIONS}
						value={formData.owner}
						onChange={(e) => handleChange("owner", e.target.value)}
						size="sm"
					/>
					{formData.owner === "Client" && (
						<Select
							label="Cliente asignado"
							options={clientOptions}
							value={formData.assignedClient}
							onChange={(e) => handleChange("assignedClient", e.target.value)}
							size="sm"
							placeholder="Seleccionar cliente..."
						/>
					)}
					<Select
						label="Estado logístico"
						options={LOGISTIC_STATUS_OPTIONS}
						value={formData.logisticStatus}
						onChange={(e) => handleChange("logisticStatus", e.target.value)}
						size="sm"
					/>
					<Select
						label="Disponibilidad"
						options={AVAILABILITY_OPTIONS}
						value={formData.availability}
						onChange={(e) => handleChange("availability", e.target.value)}
						size="sm"
						disabled={formData.owner === "Client"}
					/>
				</div>
			</div>

			{/* Sección 4: Millaje */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
					Millaje
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Millaje real"
						type="number"
						size="sm"
						value={formData.actualMileage}
						onChange={(e) => handleChange("actualMileage", e.target.value)}
						error={errors.actualMileage}
						min={0}
					/>
					<Input
						label="Millaje ajustado (opcional)"
						type="number"
						size="sm"
						value={formData.adjustedMileage}
						onChange={(e) => handleChange("adjustedMileage", e.target.value)}
						min={0}
					/>
				</div>
			</div>

			{/* Sección 5: Especificaciones */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
					Especificaciones Técnicas
				</h3>
				<div className="grid grid-cols-2 gap-4">
					<Select
						label="Combustible"
						options={FUEL_TYPE_OPTIONS}
						value={formData.fuelType}
						onChange={(e) => handleChange("fuelType", e.target.value)}
						size="sm"
					/>
					<Input
						label="Motor"
						size="sm"
						value={formData.engine}
						onChange={(e) => handleChange("engine", e.target.value)}
						error={errors.engine}
						placeholder='Ej: "2,400"'
					/>
					<Select
						label="Transmisión"
						options={TRANSMISSION_OPTIONS}
						value={formData.transmission}
						onChange={(e) => handleChange("transmission", e.target.value)}
						size="sm"
					/>
					<Select
						label="Tracción"
						options={DRIVETRAIN_OPTIONS}
						value={formData.drivetrain}
						onChange={(e) => handleChange("drivetrain", e.target.value)}
						size="sm"
					/>
					<Input
						label="Color"
						size="sm"
						value={formData.color}
						onChange={(e) => handleChange("color", e.target.value)}
						error={errors.color}
						placeholder="Ej: Blanco"
					/>
					<Select
						label="Carrocería"
						options={BODY_TYPE_OPTIONS}
						value={formData.bodyType}
						onChange={(e) => handleChange("bodyType", e.target.value)}
						size="sm"
					/>
				</div>
				<Input
					label="Descripción (opcional)"
					size="sm"
					value={formData.description}
					onChange={(e) => handleChange("description", e.target.value)}
					placeholder="Descripción del vehículo..."
				/>
			</div>

			{/* Sección 6: Imágenes */}
			<div className="space-y-4">
				<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
					Imágenes
				</h3>
				<ImageUploader
					images={formData.images}
					onImagesChange={(images) => handleChange("images", images)}
				/>
			</div>

			{/* Sección 7: Gastos obligatorios (solo al crear) */}
			{!isEditing && (
				<div className="space-y-4">
					<h3 className="text-base font-semibold text-first border-b border-first/10 pb-2">
						Gastos Obligatorios
					</h3>

					{/* Naviera */}
					<div className="border border-first/10 rounded-xl p-4 space-y-3">
						<p className="text-sm font-medium text-first">
							Naviera (Shipping line)
						</p>
						<div className="grid grid-cols-3 gap-3">
							<Input
								label="Monto"
								type="number"
								size="sm"
								value={mandatoryExpenses.shippingLine.amount}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"shippingLine",
										"amount",
										e.target.value,
									)
								}
								error={errors.shippingLineAmount}
								min={0}
							/>
							<Select
								label="Moneda"
								size="sm"
								options={[
									{ value: "CRC", label: "CRC" },
									{ value: "USD", label: "USD" },
								]}
								value={mandatoryExpenses.shippingLine.currency}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"shippingLine",
										"currency",
										e.target.value,
									)
								}
							/>
							<Input
								label="Fecha"
								type="date"
								size="sm"
								value={mandatoryExpenses.shippingLine.expenseDate}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"shippingLine",
										"expenseDate",
										e.target.value,
									)
								}
							/>
						</div>
					</div>

					{/* Revisión */}
					<div className="border border-first/10 rounded-xl p-4 space-y-3">
						<p className="text-sm font-medium text-first">
							Revisión (Inspection) - JC
						</p>
						<div className="grid grid-cols-3 gap-3">
							<Input
								label="Monto (USD)"
								type="number"
								size="sm"
								value={mandatoryExpenses.inspection.amount}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"inspection",
										"amount",
										e.target.value,
									)
								}
								error={errors.inspectionAmount}
								min={0}
							/>
							<Input
								label="Fecha"
								type="date"
								size="sm"
								value={mandatoryExpenses.inspection.expenseDate}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"inspection",
										"expenseDate",
										e.target.value,
									)
								}
							/>
						</div>
					</div>

					{/* Grúa */}
					<div className="border border-first/10 rounded-xl p-4 space-y-3">
						<p className="text-sm font-medium text-first">
							Grúa (Tow truck) - JC
						</p>
						<div className="grid grid-cols-3 gap-3">
							<Input
								label="Monto (USD)"
								type="number"
								size="sm"
								value={mandatoryExpenses.towTruck.amount}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"towTruck",
										"amount",
										e.target.value,
									)
								}
								error={errors.towTruckAmount}
								min={0}
							/>
							<Input
								label="Fecha"
								type="date"
								size="sm"
								value={mandatoryExpenses.towTruck.expenseDate}
								onChange={(e) =>
									handleMandatoryExpenseChange(
										"towTruck",
										"expenseDate",
										e.target.value,
									)
								}
							/>
						</div>
					</div>
				</div>
			)}

			{/* Sección 8: Gastos opcionales (solo al crear) */}
			{!isEditing && (
				<div className="space-y-4">
					<div className="flex items-center justify-between border-b border-first/10 pb-2">
						<h3 className="text-base font-semibold text-first">
							Gastos Opcionales
						</h3>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={handleAddOptionalExpense}
						>
							Agregar gasto
						</Button>
					</div>

					{optionalExpenses.map((expense) => (
						<div
							key={expense.id}
							className="border border-first/10 rounded-xl p-4 space-y-3"
						>
							<div className="flex items-center justify-between">
								<Select
									size="sm"
									className="flex-1"
									options={[
										{ value: "Car purchase", label: "Compra del auto" },
										{
											value: "Mileage adjustment in USA",
											label: "Ajuste millas USA",
										},
										{
											value: "Mileage adjustment in CR",
											label: "Ajuste millas CR",
										},
										{ value: "Taxes", label: "Impuestos" },
										{ value: "Warehouse", label: "Almacén" },
										{ value: "VAT", label: "IVA" },
										{ value: "Seller commission", label: "Comisión vendedor" },
										{ value: "Car registration", label: "Inscripción" },
										{ value: "Fuel", label: "Combustible" },
										{ value: "Spare parts", label: "Repuestos" },
										{ value: "Repairs", label: "Reparaciones" },
										{
											value: "Other Juan Carlos expenses",
											label: "Otros gastos JC",
										},
										{ value: "Other expenses", label: "Otros gastos" },
									]}
									value={expense.type}
									onChange={(e) =>
										handleOptionalExpenseChange(
											expense.id,
											"type",
											e.target.value,
										)
									}
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-error"
									onClick={() => handleRemoveOptionalExpense(expense.id)}
								>
									Eliminar
								</Button>
							</div>
							<Input
								label="Descripción"
								size="sm"
								value={expense.description}
								onChange={(e) =>
									handleOptionalExpenseChange(
										expense.id,
										"description",
										e.target.value,
									)
								}
							/>
							<div className="grid grid-cols-3 gap-3">
								<Input
									label="Monto"
									type="number"
									size="sm"
									value={expense.amount}
									onChange={(e) =>
										handleOptionalExpenseChange(
											expense.id,
											"amount",
											e.target.value,
										)
									}
									min={0}
								/>
								<Select
									label="Moneda"
									size="sm"
									options={[
										{ value: "CRC", label: "CRC" },
										{ value: "USD", label: "USD" },
									]}
									value={expense.currency}
									onChange={(e) =>
										handleOptionalExpenseChange(
											expense.id,
											"currency",
											e.target.value,
										)
									}
								/>
								<Input
									label="Fecha"
									type="date"
									size="sm"
									value={expense.expenseDate}
									onChange={(e) =>
										handleOptionalExpenseChange(
											expense.id,
											"expenseDate",
											e.target.value,
										)
									}
								/>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Botones */}
			<div className="flex justify-end gap-3 pt-4 border-t border-first/10 sticky bottom-0 bg-main py-4">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" loading={loading}>
					{isEditing ? "Guardar cambios" : "Crear auto"}
				</Button>
			</div>
		</form>
	);
};

export default CarForm;
