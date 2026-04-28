import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_USERS } from "../../graphql/queries/userQueries";
import {
	CREATE_USER,
	UPDATE_USER,
	DELETE_USER,
} from "../../graphql/mutations/userMutations";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import { Modal, ConfirmDialog } from "../../components/ui/Modal";
import { LoadingOverlay } from "../../components/ui/LoadingUi";
import EmptyState from "../../components/ui/EmptyState";
import {
	BsPlus,
	BsPencil,
	BsTrash,
	BsShieldLock,
	BsArrowLeft,
} from "react-icons/bs";
import { formatDate } from "../../utils/formatters";
import { ROLE_OPTIONS } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const UsersManagementPage = () => {
	const navigate = useNavigate();

	const { user: currentUser } = useAuth();
	const { toast } = useToast();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		role: "admin",
		phone: "",
		address: "",
	});

	const { data, loading, refetch } = useQuery(GET_USERS);

	const [createUser] = useMutation(CREATE_USER);
	const [updateUser] = useMutation(UPDATE_USER);
	const [deleteUser] = useMutation(DELETE_USER);

	const users = data?.users || [];

	// Superadmin can manage all users; admins should not access this page
	// const isSuperadmin = currentUser?.role === "superadmin";

	const handleCreate = async (e) => {
		e.preventDefault();
		try {
			await createUser({
				variables: {
					input: {
						name: formData.name,
						email: formData.email,
						password: formData.password || undefined,
						role: formData.role,
						phone: formData.phone || undefined,
						address: formData.address || undefined,
					},
				},
			});
			toast.success("Usuario creado exitosamente");
			setIsCreateModalOpen(false);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al crear usuario");
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		if (!editingUser) return;
		try {
			await updateUser({
				variables: {
					id: editingUser._id,
					input: {
						name: formData.name,
						role: formData.role,
						phone: formData.phone || undefined,
						address: formData.address || undefined,
					},
				},
			});
			toast.success("Usuario actualizado exitosamente");
			setEditingUser(null);
			resetForm();
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al actualizar usuario");
		}
	};

	const handleDelete = async (id) => {
		if (id === currentUser._id) {
			toast.error("No puedes eliminar tu propio usuario");
			setDeleteConfirm(null);
			return;
		}
		try {
			await deleteUser({ variables: { id } });
			toast.success("Usuario eliminado exitosamente");
			refetch();
		} catch (error) {
			toast.error(error.message || "Error al eliminar usuario");
		}
		setDeleteConfirm(null);
	};

	const openEditModal = (user) => {
		if (user.role === "superadmin" && user._id !== currentUser._id) {
			toast.error("No puedes editar a otro superadmin");
			return;
		}
		setEditingUser(user);
		setFormData({
			name: user.name || "",
			email: user.email || "",
			password: "",
			role: user.role || "admin",
			phone: user.phone || "",
			address: user.address || "",
		});
	};

	const resetForm = () => {
		setFormData({
			name: "",
			email: "",
			password: "",
			role: "admin",
			phone: "",
			address: "",
		});
	};

	const getRoleBadge = (role) => {
		switch (role) {
			case "superadmin":
				return { variant: "error", label: "Superadmin" };
			case "admin":
				return { variant: "info", label: "Admin" };
			case "client":
				return { variant: "neutral", label: "Cliente" };
			default:
				return { variant: "neutral", label: role };
		}
	};

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando usuarios..." />;

	return (
		<div className="min-h-screen pt-6 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-3xl font-bold text-first">
							Gestión de Usuarios
						</h1>
						<p className="text-first/50 mt-1">
							{users.length} usuarios registrados (solo superadmin)
						</p>
					</div>
					<div className="flex justify-center gap-2">
						<Button icon={<BsArrowLeft />} onClick={() => navigate(-1)}>
							Volver
						</Button>
						<Button
							icon={<BsPlus className="w-4 h-4" />}
							onClick={() => setIsCreateModalOpen(true)}
						>
							Nuevo usuario
						</Button>
					</div>
				</div>

				{users.length > 0 ? (
					<div className="bg-main rounded-2xl border border-first/10 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-first/10">
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Usuario
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Rol
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Contacto
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Registro
										</th>
										<th className="text-left p-4 text-xs font-medium text-first/40 uppercase">
											Estado
										</th>
										<th className="text-right p-4 text-xs font-medium text-first/40 uppercase">
											Acciones
										</th>
									</tr>
								</thead>
								<tbody>
									{users.map((u) => {
										const roleBadge = getRoleBadge(u.role);
										const isCurrentUser = u._id === currentUser._id;

										return (
											<tr
												key={u._id}
												className={`border-b border-first/5 hover:bg-first/5 transition-colors ${
													isCurrentUser ? "bg-second/5" : ""
												}`}
											>
												<td className="p-4">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 rounded-full bg-first/5 flex items-center justify-center">
															<BsShieldLock className="w-5 h-5 text-first/30" />
														</div>
														<div>
															<p className="font-medium text-first text-sm">
																{u.name}
																{isCurrentUser && (
																	<span className="text-xs text-second ml-2">
																		(Tú)
																	</span>
																)}
															</p>
															<p className="text-xs text-first/40">{u.email}</p>
														</div>
													</div>
												</td>
												<td className="p-4">
													<Badge size="sm" variant={roleBadge.variant}>
														{roleBadge.label}
													</Badge>
												</td>
												<td className="p-4">
													<p className="text-sm text-first/60">
														{u.phone || "—"}
													</p>
												</td>
												<td className="p-4">
													<p className="text-sm text-first/60">
														{formatDate(u.registrationDate)}
													</p>
												</td>
												<td className="p-4">
													<Badge
														size="sm"
														variant={u.active ? "success" : "error"}
													>
														{u.active ? "Activo" : "Inactivo"}
													</Badge>
													{u.temporaryPassword && (
														<Badge size="sm" variant="warning" className="ml-1">
															Temp
														</Badge>
													)}
												</td>
												<td className="p-4">
													<div className="flex items-center justify-end gap-1">
														{(isCurrentUser || u.role !== "superadmin") && (
															<>
																<Button
																	iconOnly
																	variant="ghost"
																	size="sm"
																	icon={<BsPencil className="w-3.5 h-3.5" />}
																	onClick={() => openEditModal(u)}
																/>
																{!isCurrentUser && (
																	<Button
																		iconOnly
																		variant="ghost"
																		size="sm"
																		className="text-error"
																		icon={<BsTrash className="w-3.5 h-3.5" />}
																		onClick={() => setDeleteConfirm(u._id)}
																	/>
																)}
															</>
														)}
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					<EmptyState
						title="No hay usuarios registrados"
						description="Crea un nuevo usuario para comenzar."
					/>
				)}

				{/* Create Modal */}
				<Modal
					isOpen={isCreateModalOpen}
					onClose={() => {
						setIsCreateModalOpen(false);
						resetForm();
					}}
					title="Nuevo Usuario"
					size="md"
				>
					<form onSubmit={handleCreate} className="space-y-4">
						<Input
							label="Nombre"
							required
							value={formData.name}
							onChange={(e) =>
								setFormData((p) => ({ ...p, name: e.target.value }))
							}
						/>
						<Input
							label="Email"
							type="email"
							required
							value={formData.email}
							onChange={(e) =>
								setFormData((p) => ({ ...p, email: e.target.value }))
							}
						/>
						<Input
							label="Contraseña (opcional - se genera temporal)"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData((p) => ({ ...p, password: e.target.value }))
							}
						/>
						<Select
							label="Rol"
							required
							options={ROLE_OPTIONS.filter((r) => r.value !== "superadmin")}
							value={formData.role}
							onChange={(e) =>
								setFormData((p) => ({ ...p, role: e.target.value }))
							}
						/>
						<Input
							label="Teléfono"
							value={formData.phone}
							onChange={(e) =>
								setFormData((p) => ({ ...p, phone: e.target.value }))
							}
						/>
						<Input
							label="Dirección"
							value={formData.address}
							onChange={(e) =>
								setFormData((p) => ({ ...p, address: e.target.value }))
							}
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setIsCreateModalOpen(false);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button type="submit">Crear usuario</Button>
						</div>
					</form>
				</Modal>

				{/* Edit Modal */}
				<Modal
					isOpen={!!editingUser}
					onClose={() => {
						setEditingUser(null);
						resetForm();
					}}
					title="Editar Usuario"
					size="md"
				>
					<form onSubmit={handleUpdate} className="space-y-4">
						<Input
							label="Nombre"
							value={formData.name}
							onChange={(e) =>
								setFormData((p) => ({ ...p, name: e.target.value }))
							}
						/>
						<Input label="Email" value={formData.email} disabled />
						<Select
							label="Rol"
							options={ROLE_OPTIONS.filter((r) => {
								if (editingUser?.role === "superadmin")
									return r.value === "superadmin";
								return r.value !== "superadmin";
							})}
							value={formData.role}
							onChange={(e) =>
								setFormData((p) => ({ ...p, role: e.target.value }))
							}
						/>
						<Input
							label="Teléfono"
							value={formData.phone}
							onChange={(e) =>
								setFormData((p) => ({ ...p, phone: e.target.value }))
							}
						/>
						<Input
							label="Dirección"
							value={formData.address}
							onChange={(e) =>
								setFormData((p) => ({ ...p, address: e.target.value }))
							}
						/>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="ghost"
								type="button"
								onClick={() => {
									setEditingUser(null);
									resetForm();
								}}
							>
								Cancelar
							</Button>
							<Button type="submit">Guardar cambios</Button>
						</div>
					</form>
				</Modal>

				{/* Delete Confirmation */}
				<ConfirmDialog
					isOpen={!!deleteConfirm}
					onClose={() => setDeleteConfirm(null)}
					onConfirm={() => handleDelete(deleteConfirm)}
					title="Eliminar usuario"
					description="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer y podría afectar los autos asignados."
					confirmLabel="Eliminar"
					variant="danger"
				/>
			</div>
		</div>
	);
};

export default UsersManagementPage;
