import { useState } from "react";
import { BsSearch, BsFilter, BsX } from "react-icons/bs";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";
import {
	BODY_TYPE_OPTIONS,
	TRANSMISSION_OPTIONS,
	DRIVETRAIN_OPTIONS,
	FUEL_TYPE_OPTIONS,
	LOGISTIC_STATUS_OPTIONS,
	AVAILABILITY_OPTIONS,
} from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

const Filters = ({
	filters,
	onFilterChange,
	onClearFilters,
	showAdvanced = false,
}) => {
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
	const [searchValue, setSearchValue] = useState(filters.search || "");

	const { user } = useAuth();

	const handleSearch = (e) => {
		e.preventDefault();
		onFilterChange({ search: searchValue });
	};

	const handleClear = () => {
		setSearchValue("");
		onClearFilters();
	};

	const hasActiveFilters = Object.values(filters).some(
		(v) => v !== undefined && v !== "" && v !== null,
	);

	return (
		<div className="bg-main rounded-xl border border-first/10 p-4 space-y-4">
			{/* Search Bar */}
			<form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2">
				<div className="relative flex-1">
					<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-first/30" />
					<input
						type="text"
						placeholder="Buscar por VIN, DUA, color..."
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						className="w-full pl-10 pr-4 py-2 rounded-md border border-first/20 bg-main text-first text-sm
                     focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second
                     placeholder:text-first/30 transition-all duration-150"
					/>
				</div>
				<Button
					type="submit"
					variant="secondary"
					size="sm"
					icon={<BsSearch className="w-4 h-4" />}
				>
					Buscar
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					icon={<BsFilter className="w-4 h-4" />}
					onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
				>
					Filtros
				</Button>
				{hasActiveFilters && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						icon={<BsX className="w-4 h-4" />}
						onClick={handleClear}
					>
						Limpiar
					</Button>
				)}
			</form>

			{/* Advanced Filters */}
			<div
				className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 transition-all duration-300 ${
					isAdvancedOpen
						? "opacity-100 max-h-96 overflow-auto"
						: "opacity-0 max-h-0 overflow-hidden"
				}`}
			>
				<Select
					label="Carrocería"
					size="sm"
					placeholder="Todas"
					options={BODY_TYPE_OPTIONS}
					value={filters.bodyType || ""}
					onChange={(e) =>
						onFilterChange({ bodyType: e.target.value || undefined })
					}
				/>
				<Select
					label="Transmisión"
					size="sm"
					placeholder="Todas"
					options={TRANSMISSION_OPTIONS}
					value={filters.transmission || ""}
					onChange={(e) =>
						onFilterChange({ transmission: e.target.value || undefined })
					}
				/>
				<Select
					label="Estado logístico"
					size="sm"
					placeholder="Todos"
					options={LOGISTIC_STATUS_OPTIONS}
					value={filters.logisticStatus || ""}
					onChange={(e) =>
						onFilterChange({ logisticStatus: e.target.value || undefined })
					}
				/>
				{(user?.role === "superadmin" || user?.role === "admin") && (
					<Select
						label="Disponibilidad"
						size="sm"
						placeholder="Todas"
						options={AVAILABILITY_OPTIONS}
						value={filters.availability || ""}
						onChange={(e) =>
							onFilterChange({ availability: e.target.value || undefined })
						}
					/>
				)}
				<Select
					label="Tracción"
					size="sm"
					placeholder="Todas"
					options={DRIVETRAIN_OPTIONS}
					value={filters.drivetrain || ""}
					onChange={(e) =>
						onFilterChange({ drivetrain: e.target.value || undefined })
					}
				/>
				<Select
					label="Combustible"
					size="sm"
					placeholder="Todos"
					options={FUEL_TYPE_OPTIONS}
					value={filters.fuelType || ""}
					onChange={(e) =>
						onFilterChange({ fuelType: e.target.value || undefined })
					}
				/>
				<Input
					type="number"
					label="Año mínimo"
					size="sm"
					placeholder="Ej: 2015"
					value={filters.minYear || ""}
					onChange={(e) =>
						onFilterChange({
							minYear: e.target.value ? Number(e.target.value) : undefined,
						})
					}
				/>
				<Input
					type="number"
					label="Año máximo"
					size="sm"
					placeholder="Ej: 2024"
					value={filters.maxYear || ""}
					onChange={(e) =>
						onFilterChange({
							maxYear: e.target.value ? Number(e.target.value) : undefined,
						})
					}
				/>
				<Input
					type="number"
					label="Precio mínimo (CRC)"
					size="sm"
					placeholder="₡0"
					value={filters.minPrice || ""}
					onChange={(e) =>
						onFilterChange({
							minPrice: e.target.value ? Number(e.target.value) : undefined,
						})
					}
				/>
				<Input
					type="number"
					label="Precio máximo (CRC)"
					size="sm"
					placeholder="₡0"
					value={filters.maxPrice || ""}
					onChange={(e) =>
						onFilterChange({
							maxPrice: e.target.value ? Number(e.target.value) : undefined,
						})
					}
				/>
				<Input
					label="Color"
					size="sm"
					placeholder="Ej: Blanco"
					value={filters.color || ""}
					onChange={(e) =>
						onFilterChange({ color: e.target.value || undefined })
					}
				/>
			</div>
		</div>
	);
};

export default Filters;
