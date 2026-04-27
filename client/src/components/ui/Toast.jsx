/* eslint-disable react-refresh/only-export-components */
import { Toaster, toast } from "react-hot-toast";

// Componente Toaster para usar en App.jsx
export const ToastUi = () => {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 4000,
				style: {
					background: "var(--color-main)",
					color: "var(--color-first)",
					borderRadius: "12px",
					border: "1px solid var(--color-first)/10",
				},
				success: {
					iconTheme: {
						primary: "#16dd16",
						secondary: "var(--color-main)",
					},
				},
				error: {
					iconTheme: {
						primary: "#dd1616",
						secondary: "var(--color-main)",
					},
				},
			}}
		/>
	);
};

// Helpers para usar toasts fácilmente
export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showLoading = (message) => toast.loading(message);
export const dismissToast = (id) => toast.dismiss(id);

export default toast;
