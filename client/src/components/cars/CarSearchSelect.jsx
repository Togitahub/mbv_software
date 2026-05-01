import { useState, useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CARS } from "../../graphql/queries/carQueries";
import { BsSearch, BsX } from "react-icons/bs";

function useDebounce(value, delay = 300) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}

const CarSearchSelect = ({
	value,
	onChange,
	placeholder = "Buscar auto...",
	disabled = false,
}) => {
	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCarData, setSelectedCarData] = useState(null);

	const wrapperRef = useRef(null);

	const debouncedSearch = useDebounce(search, 400);

	const { data } = useQuery(GET_CARS, {
		variables: {
			page: 1,
			limit: 30,
			filters: debouncedSearch ? { search: debouncedSearch } : {},
		},
		skip: !isOpen,
	});

	const cars = data?.cars?.cars || [];

	// Cerrar al hacer clic fuera
	useEffect(() => {
		const handleClick = (e) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div ref={wrapperRef} className="relative">
			<label className="text-sm font-medium text-first/80 mb-1 block">
				Auto {!disabled && <span className="text-error">*</span>}
			</label>

			{selectedCarData && !isOpen ? (
				<div
					className={`flex items-center justify-between p-2 rounded-md border border-first/20 bg-main text-first text-sm ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					onClick={() => !disabled && setIsOpen(true)}
				>
					<span>
						{selectedCarData.brand?.name} {selectedCarData.carModel?.name}{" "}
						{selectedCarData.year} ({selectedCarData.vin})
					</span>
					{!disabled && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onChange("");
								setSearch("");
							}}
							className="text-first/30 hover:text-error"
						>
							<BsX className="w-4 h-4" />
						</button>
					)}
				</div>
			) : (
				<div className="relative">
					<BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-first/30" />
					<input
						type="text"
						placeholder={
							selectedCarData
								? `${selectedCarData.brand?.name} ${selectedCarData.carModel?.name}`
								: placeholder
						}
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => setIsOpen(true)}
						disabled={disabled}
						className="w-full pl-9 pr-3 py-2 rounded-md border border-first/20 bg-main text-first text-sm
                     focus:outline-none focus:ring-2 focus:ring-second/30 focus:border-second
                     placeholder:text-first/30 disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					{search && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onChange("");
								setSelectedCarData(null);
								setSearch("");
							}}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-first/30 hover:text-first"
						>
							<BsX className="w-4 h-4" />
						</button>
					)}
				</div>
			)}

			{/* Dropdown */}
			{isOpen && !disabled && (
				<div className="absolute z-50 mt-1 w-full bg-main rounded-lg border border-first/10 shadow-xl max-h-48 overflow-y-auto">
					{cars.length > 0 ? (
						cars.map((car) => (
							<button
								key={car._id}
								type="button"
								onClick={() => {
									setSelectedCarData(car);
									onChange(car._id);
									setSearch("");
									setIsOpen(false);
								}}
								className={`w-full text-left px-3 py-2 text-sm hover:bg-first/5 transition-colors ${
									car._id === value ? "bg-second/10 text-second" : "text-first"
								}`}
							>
								{car.brand?.name} {car.carModel?.name} {car.year}
								<span className="text-xs text-first/40 ml-1">({car.vin})</span>
							</button>
						))
					) : (
						<p className="text-sm text-first/30 text-center py-3">
							{search ? "No se encontraron autos" : "Escribe para buscar"}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default CarSearchSelect;
