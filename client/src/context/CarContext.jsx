/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_PUBLIC_CARS, GET_CARS } from "../graphql/queries/carQueries";
import {
	CREATE_CAR,
	UPDATE_CAR,
	DELETE_CAR,
	BULK_UPDATE_CARS,
	MARK_CAR_AS_SOLD,
} from "../graphql/mutations/carMutations";

const CarContext = createContext(null);

export const CarProvider = ({ children }) => {
	const [filters, setFilters] = useState({});
	const [pagination, setPagination] = useState({ page: 1, limit: 12 });
	const [sorting, setSorting] = useState({
		sortBy: "purchaseDate",
		sortOrder: "desc",
	});

	// Public cars query
	const {
		data: publicCarsData,
		loading: publicCarsLoading,
		refetch: refetchPublicCars,
	} = useQuery(GET_PUBLIC_CARS, {
		variables: {
			page: pagination.page,
			limit: pagination.limit,
			filters,
			...sorting,
		},
		notifyOnNetworkStatusChange: true,
	});

	// Admin cars query
	const {
		data: carsData,
		loading: carsLoading,
		refetch: refetchCars,
	} = useQuery(GET_CARS, {
		variables: {
			page: pagination.page,
			limit: pagination.limit,
			filters,
			...sorting,
		},
		notifyOnNetworkStatusChange: true,
		skip: typeof window !== "undefined" && !localStorage.getItem("authToken"),
	});

	// Mutations
	const [createCarMutation] = useMutation(CREATE_CAR);
	const [updateCarMutation] = useMutation(UPDATE_CAR);
	const [deleteCarMutation] = useMutation(DELETE_CAR);
	const [bulkUpdateCarsMutation] = useMutation(BULK_UPDATE_CARS);
	const [markCarAsSoldMutation] = useMutation(MARK_CAR_AS_SOLD);

	const updateFilters = useCallback((newFilters) => {
		setFilters((prev) => ({ ...prev, ...newFilters }));
		setPagination((prev) => ({ ...prev, page: 1 }));
	}, []);

	const clearFilters = useCallback(() => {
		setFilters({});
		setPagination((prev) => ({ ...prev, page: 1 }));
	}, []);

	const changePage = useCallback((page) => {
		setPagination((prev) => ({ ...prev, page }));
	}, []);

	const changeSorting = useCallback((sortBy, sortOrder) => {
		setSorting({ sortBy, sortOrder });
	}, []);

	const createCar = useCallback(
		async (input, expenseInputs) => {
			const { data } = await createCarMutation({
				variables: { input, expenseInputs },
			});
			refetchCars();
			return data?.createCar;
		},
		[createCarMutation, refetchCars],
	);

	const updateCar = useCallback(
		async (id, input) => {
			const { data } = await updateCarMutation({
				variables: { id, input },
			});
			refetchCars();
			return data?.updateCar;
		},
		[updateCarMutation, refetchCars],
	);

	const deleteCar = useCallback(
		async (id) => {
			const { data } = await deleteCarMutation({
				variables: { id },
			});
			refetchCars();
			return data?.deleteCar;
		},
		[deleteCarMutation, refetchCars],
	);

	const bulkUpdateCars = useCallback(
		async (input) => {
			const { data } = await bulkUpdateCarsMutation({
				variables: { input },
			});
			refetchCars();
			return data?.bulkUpdateCars;
		},
		[bulkUpdateCarsMutation, refetchCars],
	);

	const markCarAsSold = useCallback(
		async (id, finalSalePriceCRC, saleDate, buyerName) => {
			const { data } = await markCarAsSoldMutation({
				variables: { id, finalSalePriceCRC, saleDate, buyerName },
			});
			refetchCars();
			return data?.markCarAsSold;
		},
		[markCarAsSoldMutation, refetchCars],
	);

	const value = {
		// Public catalog
		publicCars: publicCarsData?.publicCars,
		publicCarsLoading,
		refetchPublicCars,
		// Admin cars
		cars: carsData?.cars,
		carsLoading,
		refetchCars,
		// Filters & Pagination
		filters,
		pagination,
		sorting,
		updateFilters,
		clearFilters,
		changePage,
		changeSorting,
		// Mutations
		createCar,
		updateCar,
		deleteCar,
		bulkUpdateCars,
		markCarAsSold,
	};

	return <CarContext.Provider value={value}>{children}</CarContext.Provider>;
};

export const useCar = () => {
	const context = useContext(CarContext);
	if (!context) throw new Error("useCar must be used within CarProvider");
	return context;
};
