import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
	BsGrid,
	BsCarFront,
	BsCarFrontFill,
	BsPeople,
	BsCashStack,
	BsReceipt,
	BsCreditCard,
	BsFileText,
	BsShieldLock,
	BsList,
	BsX,
	BsCurrencyDollar,
	BsBoxArrowRight,
} from "react-icons/bs";

const menuItems = [
	{
		to: "/admin/dashboard",
		icon: BsGrid,
		label: "Dashboard",
	},
	{
		to: "/admin/cars",
		icon: BsCarFront,
		label: "Vehículos",
	},
	{
		to: "/admin/dave-cars",
		icon: BsCarFrontFill,
		label: "Autos de Dave",
	},
	{
		to: "/admin/clients",
		icon: BsPeople,
		label: "Clientes",
	},
	{
		divider: true,
	},
	{
		to: "/admin/expenses",
		icon: BsCashStack,
		label: "Gastos de Autos",
	},
	{
		to: "/admin/general-expenses",
		icon: BsCurrencyDollar,
		label: "Gastos Generales",
	},
	{
		to: "/admin/jc-payments",
		icon: BsCreditCard,
		label: "Pagos a JC",
	},
	{
		to: "/admin/client-payments",
		icon: BsReceipt,
		label: "Pagos de Clientes",
	},
	{
		divider: true,
	},
	{
		to: "/admin/reports",
		icon: BsFileText,
		label: "Reporte Contable",
	},
	{
		to: "/admin/users",
		icon: BsShieldLock,
		label: "Usuarios",
		superadminOnly: true,
	},
];

const AdminSidebar = ({ user }) => {
	const [isOpen, setIsOpen] = useState(false);

	const filteredItems = menuItems.filter(
		(item) => !item.superadminOnly || user?.role === "superadmin",
	);

	const linkClass = ({ isActive }) =>
		`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
			isActive
				? "bg-second text-main shadow-sm"
				: "text-first/60 hover:text-first hover:bg-first/5"
		}`;

	return (
		<>
			{/* Mobile toggle button */}
			<button
				onClick={() => setIsOpen(true)}
				className="fixed top-4 right-3 z-40 lg:hidden w-10 h-10 rounded-xl bg-main border border-first/10 flex items-center justify-center shadow-sm"
			>
				<BsList className="w-5 h-5 text-first" />
			</button>

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 z-50 h-full w-64 bg-main border-r border-first/10 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-first/10">
					<h2 className="text-lg font-bold text-first">Panel Admin</h2>
					<button
						onClick={() => setIsOpen(false)}
						className="lg:hidden w-8 h-8 rounded-lg hover:bg-first/5 flex items-center justify-center"
					>
						<BsX className="w-5 h-5 text-first" />
					</button>
				</div>

				{/* Menu */}
				<nav className="flex-1 overflow-y-auto p-3 space-y-1">
					{filteredItems.map((item, index) =>
						item.divider ? (
							<div key={index} className="my-2 border-t border-first/5" />
						) : (
							<NavLink
								key={item.to}
								to={item.to}
								className={linkClass}
								onClick={() => setIsOpen(false)}
							>
								<item.icon className="w-4 h-4 shrink-0" />
								{item.label}
							</NavLink>
						),
					)}
				</nav>

				{/* Footer */}
				<div className="p-3 border-t border-first/10">
					<NavLink
						to="/"
						className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-first/40 hover:text-first hover:bg-first/5 transition-all duration-200"
					>
						<BsBoxArrowRight className="w-4 h-4 shrink-0" />
						Volver al sitio
					</NavLink>
				</div>
			</aside>
		</>
	);
};

export default AdminSidebar;
