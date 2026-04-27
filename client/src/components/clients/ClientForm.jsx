import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
	CREATE_USER,
	UPDATE_USER,
} from "../../graphql/mutations/userMutations";
import { useToast } from "../../context/ToastContext";
import Input from "../ui/Input";
import Button from "../ui/Button";

const initialFormData = {
	name: "",
	email: "",
	password: "",
	phone: "",
	address: "",
};

const ClientForm = ({ client, onClose, onSuccess }) => {
	const { toast } = useToast();
	const isEditing = !!client;

	const [formData, setFormData] = useState(() => {
		if (client) {
			return {
				name: client.name || "",
				email: client.email || "",
				password: "",
				phone: client.phone || "",
				address: client.address || "",
			};
		}
		return initialFormData;
	});

	const [errors, setErrors] = useState({});

	const [createUser, { loading: creating }] = useMutation(CREATE_USER);
	const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);

	const loading = creating || updating;

	const handleChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.name.trim()) newErrors.name = "Requerido";
		if (!formData.email.trim()) newErrors.email = "Requerido";
		if (!isEditing && !formData.password.trim()) {
			newErrors.password = "Se generará automáticamente";
		}
		setErrors(newErrors);
		return (
			Object.keys(newErrors).length === 0 ||
			(Object.keys(newErrors).length === 1 && newErrors.password)
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validate()) return;

		const variables = {
			input: {
				name: formData.name.trim(),
				email: formData.email.trim(),
				role: "client",
				phone: formData.phone.trim() || undefined,
				address: formData.address.trim() || undefined,
			},
		};

		if (!isEditing) {
			variables.input.password = formData.password.trim() || undefined;
		}

		try {
			if (isEditing) {
				await updateUser({
					variables: { id: client._id, input: variables.input },
				});
				toast.success("Cliente actualizado");
			} else {
				await createUser({ variables: { input: variables.input } });
				toast.success("Cliente creado");
			}
			onSuccess?.();
			onClose();
		} catch (error) {
			toast.error(error.message || "Error al guardar cliente");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Nombre completo"
				required
				value={formData.name}
				onChange={(e) => handleChange("name", e.target.value)}
				error={errors.name}
				size="sm"
			/>
			<Input
				label="Email"
				type="email"
				required
				value={formData.email}
				onChange={(e) => handleChange("email", e.target.value)}
				error={errors.email}
				disabled={isEditing}
				size="sm"
			/>
			{!isEditing && (
				<Input
					label="Contraseña (vacío = se genera temporal)"
					type="password"
					value={formData.password}
					onChange={(e) => handleChange("password", e.target.value)}
					hint="Si no asigna contraseña, se generará una aleatoria"
					size="sm"
				/>
			)}
			<Input
				label="Teléfono"
				value={formData.phone}
				onChange={(e) => handleChange("phone", e.target.value)}
				size="sm"
			/>
			<Input
				label="Dirección"
				value={formData.address}
				onChange={(e) => handleChange("address", e.target.value)}
				size="sm"
			/>
			<div className="flex justify-end gap-3 pt-4 border-t border-first/10">
				<Button type="button" variant="ghost" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" loading={loading}>
					{isEditing ? "Guardar cambios" : "Crear cliente"}
				</Button>
			</div>
		</form>
	);
};

export default ClientForm;
