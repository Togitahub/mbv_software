import { useState, useEffect } from "react";
import { BsArrowDown, BsChevronRight } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useCar } from "../context/CarContext";
import Filters from "../components/common/Filters";
import CarCard from "../components/cars/CarCard";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/ui/EmptyState";
import { LoadingOverlay } from "../components/ui/LoadingUi";

const LandingPage = () => {
	const {
		publicCars,
		publicCarsLoading,
		filters,
		updateFilters,
		clearFilters,
		pagination,
		changePage,
	} = useCar();
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToCatalog = () => {
		document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="relative py-20 min-h-screen flex items-center justify-center overflow-hidden">
				{/* Background with gradient */}
				<div className="absolute inset-0 bg-linear-to-br from-second via-second/95 to-main" />

				{/* Animated background shapes */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -top-40 -right-40 w-80 h-80 bg-second/30 rounded-full blur-3xl animate-pulse" />
					<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-second/20 rounded-full blur-3xl animate-pulse delay-1000" />
				</div>

				{/* Content */}
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<div
						className="space-y-8"
						style={{
							transform: `translateY(${scrollY * 0.3}px)`,
							opacity: Math.max(0, 1 - scrollY / 500),
						}}
					>
						<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-first tracking-tight">
							Importaciones MBV
						</h1>

						<p className="text-sm sm:text-xl text-first/70 max-w-2xl mx-auto leading-relaxed">
							Vehículos importados desde Florida, USA. Calidad, confianza y el
							mejor servicio en cada auto que traemos para ti.
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
							<button
								onClick={scrollToCatalog}
								className="group inline-flex cursor-pointer items-center gap-2 px-8 py-3 bg-main text-first rounded-full font-medium hover:bg-main/50 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
							>
								Ver catálogo
								<BsArrowDown className="w-4 h-4 group-hover:animate-bounce" />
							</button>

							<Link
								to="/brands"
								className="inline-flex items-center gap-2 px-8 py-3 border border-first/30 shadow-lg text-first rounded-full font-medium hover:bg-main/10 transition-all duration-300"
							>
								Ver marcas
								<BsChevronRight className="w-4 h-4" />
							</Link>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-12">
							{[
								{
									value: publicCars?.totalCount || 0,
									label: "Vehículos disponibles",
								},
								{ value: "100%", label: "Importados USA" },
								{ value: "CR", label: "Entregas en Costa Rica" },
								{ value: "24/7", label: "Soporte WhatsApp" },
							].map((stat) => (
								<div key={stat.label} className="text-center">
									<div className="text-2xl font-bold text-first">
										{stat.value}
									</div>
									<div className="text-sm text-first/60 mt-1">{stat.label}</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Scroll indicator */}
				<button
					onClick={scrollToCatalog}
					className="absolute bottom-8 left-1/2 -translate-x-1/2 text-main/50 hover:text-main transition-colors animate-bounce"
					aria-label="Scroll to catalog"
				>
					<BsArrowDown className="w-6 h-6" />
				</button>
			</section>

			{/* Catalog Section */}
			<section id="catalog" className="py-16 bg-first/5">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl sm:text-4xl font-bold text-first">
							Nuestro Catálogo
						</h2>
						<p className="mt-3 text-first/50 max-w-2xl mx-auto">
							Explora nuestra selección de vehículos importados. Todos nuestros
							autos pasan por rigurosos controles de calidad antes de ser
							publicados.
						</p>
					</div>

					{/* Filters */}
					<div className="mb-8">
						<Filters
							filters={filters}
							onFilterChange={updateFilters}
							onClearFilters={clearFilters}
							showAdvanced
						/>
					</div>

					{/* Loading */}
					{publicCarsLoading && (
						<LoadingOverlay visible={true} text="Cargando catálogo..." />
					)}

					{/* Cars Grid */}
					{!publicCarsLoading && publicCars?.cars?.length > 0 ? (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{publicCars.cars.map((car) => (
									<CarCard key={car._id} car={car} />
								))}
							</div>

							{/* Pagination */}
							<div className="mt-8">
								<Pagination
									currentPage={pagination.page}
									totalPages={publicCars.totalPages}
									onPageChange={changePage}
								/>
							</div>
						</>
					) : !publicCarsLoading ? (
						<EmptyState
							title="No se encontraron vehículos"
							description="Intenta ajustar los filtros o vuelve más tarde para ver nuevos vehículos."
						/>
					) : null}
				</div>
			</section>
		</div>
	);
};

export default LandingPage;
