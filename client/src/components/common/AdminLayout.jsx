import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
	const { user } = useAuth();

	return (
		<div className="flex min-h-screen">
			<AdminSidebar user={user} />
			<main className="flex-1 lg:ml-64 min-w-0">
				<Outlet />
			</main>
		</div>
	);
};

export default AdminLayout;
