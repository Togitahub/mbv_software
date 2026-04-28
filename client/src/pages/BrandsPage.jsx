import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_BRANDS } from "../graphql/queries/brandModelQueries";
import { GET_PUBLIC_CARS } from "../graphql/queries/carQueries";
import { BsCarFront, BsSearch, BsArrowLeft } from "react-icons/bs";
import EmptyState from "../components/ui/EmptyState";
import { LoadingOverlay } from "../components/ui/LoadingUi";
import Pagination from "../components/common/Pagination";
import Filters from "../components/common/Filters";
import CarCard from "../components/cars/CarCard";

const BrandsPage = () => {
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedBrand, setSelectedBrand] = useState(null);
	const [carFilters, setCarFilters] = useState({});
	const [carPage, setCarPage] = useState(1);
	const itemsPerPage = 12;

	const { data, loading } = useQuery(GET_BRANDS);

	const { data: carsData, loading: carsLoading } = useQuery(GET_PUBLIC_CARS, {
		variables: {
			page: carPage,
			limit: 12,
			filters: { ...carFilters, brand: selectedBrand?._id },
		},
		skip: !selectedBrand,
	});

	const brands = data?.brands || [];

	const filteredBrands = brands.filter((brand) =>
		brand.name.toLowerCase().includes(search.toLowerCase()),
	);

	const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
	const paginatedBrands = filteredBrands.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const cars = carsData?.publicCars;

	if (loading)
		return <LoadingOverlay visible={true} text="Cargando marcas..." />;

	return (
		<div className="min-h-screen pt-20 pb-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				{!selectedBrand ? (
					<>
						<div className="text-center mb-12">
							<h1 className="text-3xl sm:text-4xl font-bold text-first">
								Marcas Disponibles
							</h1>
							<p className="mt-3 text-first/50 max-w-2xl mx-auto">
								Selecciona una marca para ver sus vehículos disponibles.
							</p>
						</div>

						{/* Search */}
						<div className="max-w-md mx-auto mb-8">
							<div className="relative">
								<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-first/30" />
								<input
									type="text"
									placeholder="Buscar marca..."
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
										setCurrentPage(1);
									}}
									className="w-full pl-10 pr-4 py-3 rounded-xl border border-first/10 bg-main text-first text-sm
                           focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second
                           placeholder:text-first/30 transition-all duration-150"
								/>
							</div>
						</div>
					</>
				) : (
					<div className="mb-8">
						<button
							onClick={() => setSelectedBrand(null)}
							className="flex items-center gap-2 text-first/50 hover:text-first mb-4 transition-colors"
						>
							<BsArrowLeft className="w-4 h-4" />
							<span className="text-sm">Todas las marcas</span>
						</button>
						<h2 className="text-2xl font-bold text-first">
							{selectedBrand.name}
						</h2>
						<p className="text-first/50 mt-1">
							{cars?.totalCount || 0} vehículos disponibles
						</p>
					</div>
				)}

				{/* Brands Grid */}
				{!selectedBrand && (
					<>
						{paginatedBrands.length > 0 ? (
							<>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
									{paginatedBrands.map((brand) => (
										<button
											key={brand._id}
											onClick={() => {
												setSelectedBrand(brand);
												setCarPage(1);
												setCarFilters({});
											}}
											className="group bg-main rounded-xl border border-first/10 p-6 text-center
                               hover:border-second/30 hover:shadow-lg hover:shadow-second/5
                               transition-all duration-300 transform hover:-translate-y-1"
										>
											<div
												className="w-12 h-12 mx-auto mb-3 rounded-full bg-second/10 flex items-center justify-center
                                    group-hover:bg-second/20 transition-colors duration-300"
											>
												<BsCarFront className="w-6 h-6 text-second" />
											</div>
											<h3 className="text-sm font-semibold text-first group-hover:text-second transition-colors">
												{brand.name}
											</h3>
										</button>
									))}
								</div>

								{totalPages > 1 && (
									<div className="mt-8">
										<Pagination
											currentPage={currentPage}
											totalPages={totalPages}
											onPageChange={setCurrentPage}
										/>
									</div>
								)}
							</>
						) : (
							<EmptyState
								title="No se encontraron marcas"
								description={
									search
										? "Intenta con otra búsqueda"
										: "No hay marcas disponibles aún"
								}
							/>
						)}
					</>
				)}

				{/* Cars Section */}
				{selectedBrand && (
					<>
						<div className="mb-6">
							<Filters
								filters={carFilters}
								onFilterChange={(newFilters) => {
									setCarFilters((prev) => ({ ...prev, ...newFilters }));
									setCarPage(1);
								}}
								onClearFilters={() => {
									setCarFilters({});
									setCarPage(1);
								}}
							/>
						</div>

						{carsLoading ? (
							<LoadingOverlay visible={true} text="Cargando vehículos..." />
						) : cars?.cars?.length > 0 ? (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{cars.cars.map((car) => (
										<CarCard key={car._id} car={car} />
									))}
								</div>
								{cars.totalPages > 1 && (
									<div className="mt-8">
										<Pagination
											currentPage={carPage}
											totalPages={cars.totalPages}
											onPageChange={setCarPage}
										/>
									</div>
								)}
							</>
						) : (
							<EmptyState
								title="No se encontraron vehículos"
								description={`No hay vehículos disponibles para ${selectedBrand.name}.`}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default BrandsPage;
