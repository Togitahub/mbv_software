import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

// Common components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./routes/ScrollToTop";
import TokenWatcher from "./routes/TokenWatcher";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import { LoadingOverlay } from "./components/ui/LoadingUi";
import AdminLayout from "./components/common/AdminLayout";

// Lazy loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const BrandsPage = lazy(() => import("./pages/BrandsPage"));
const ModelsPage = lazy(() => import("./pages/ModelsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const MyAccountPage = lazy(() => import("./pages/MyAccountPage"));
const MyCarsPage = lazy(() => import("./pages/MyCarsPage"));
const CarDetail = lazy(() => import("./components/cars/CarDetail"));
const NoMatchPage = lazy(() => import("./pages/NoMatchPage"));

// Lazy loaded admin pages
const AdminDashboardPage = lazy(
	() => import("./pages/AdminPanel/AdminDashboardPage"),
);
const CarsManagementPage = lazy(
	() => import("./pages/AdminPanel/CarsManagementPage"),
);
const DaveCarsListPage = lazy(
	() => import("./pages/AdminPanel/DaveCarsListPage"),
);
const ClientsManagementPage = lazy(
	() => import("./pages/AdminPanel/ClientsManagementPage"),
);
const ExpensesManagementPage = lazy(
	() => import("./pages/AdminPanel/ExpensesManagementPage"),
);
const GeneralExpensesPage = lazy(
	() => import("./pages/AdminPanel/GeneralExpensesPage"),
);
const JCPaymentsManagementPage = lazy(
	() => import("./pages/AdminPanel/JCPaymentsManagementPage"),
);
const ClientPaymentsManagementPage = lazy(
	() => import("./pages/AdminPanel/ClientPaymentsManagementPage"),
);
const AccountingReportPage = lazy(
	() => import("./pages/AdminPanel/AccountingReportPage"),
);
const UsersManagementPage = lazy(
	() => import("./pages/AdminPanel/UsersManagementPage"),
);

const SuspenseFallback = () => (
	<div className="min-h-screen flex items-center justify-center">
		<LoadingOverlay visible={true} text="Cargando..." />
	</div>
);

const App = () => {
	const location = useLocation();
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<div className="min-h-screen bg-main text-first">
			<ScrollToTop />
			<TokenWatcher />
			{!isAdminRoute && <Navbar />}

			<main className="min-h-screen">
				<Suspense fallback={<SuspenseFallback />}>
					<Routes>
						{/* Public routes */}
						<Route path="/" element={<LandingPage />} />
						<Route path="/brands" element={<BrandsPage />} />
						<Route path="/models" element={<ModelsPage />} />
						<Route path="/auth" element={<AuthPage />} />
						<Route path="/car/:id" element={<CarDetail />} />

						{/* Protected routes - Client */}
						<Route
							element={
								<ProtectedRoutes
									allowedRoles={["client", "admin", "superadmin"]}
								/>
							}
						>
							<Route path="/my-account" element={<MyAccountPage />} />
						</Route>

						{/* Protected routes - Client with cars */}
						<Route element={<ProtectedRoutes allowedRoles={["client"]} />}>
							<Route path="/my-cars" element={<MyCarsPage />} />
						</Route>

						{/* Protected routes - Admin & Superadmin */}
						<Route
							element={
								<ProtectedRoutes allowedRoles={["admin", "superadmin"]} />
							}
						>
							<Route element={<AdminLayout />}>
								<Route
									path="/admin/dashboard"
									element={<AdminDashboardPage />}
								/>
								<Route path="/admin/cars" element={<CarsManagementPage />} />
								<Route path="/admin/dave-cars" element={<DaveCarsListPage />} />
								<Route
									path="/admin/clients"
									element={<ClientsManagementPage />}
								/>
								<Route
									path="/admin/expenses"
									element={<ExpensesManagementPage />}
								/>
								<Route
									path="/admin/general-expenses"
									element={<GeneralExpensesPage />}
								/>
								<Route
									path="/admin/jc-payments"
									element={<JCPaymentsManagementPage />}
								/>
								<Route
									path="/admin/client-payments"
									element={<ClientPaymentsManagementPage />}
								/>
								<Route
									path="/admin/reports"
									element={<AccountingReportPage />}
								/>
							</Route>
						</Route>

						{/* Protected routes - Superadmin only */}
						<Route element={<ProtectedRoutes allowedRoles={["superadmin"]} />}>
							<Route path="/admin/users" element={<UsersManagementPage />} />
						</Route>

						{/* 404 */}
						<Route path="*" element={<NoMatchPage />} />
					</Routes>
				</Suspense>
			</main>

			{!isAdminRoute && <Footer />}
		</div>
	);
};

export default App;
