import gql from "graphql-tag";

export const GET_EXPENSES = gql`
	query Expenses($carId: ID, $isFromJuanCarlos: Boolean, $type: String) {
		expenses(carId: $carId, isFromJuanCarlos: $isFromJuanCarlos, type: $type) {
			_id
			car {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				color
				year
				vin
			}
			type
			description
			amount
			currency
			expenseDate
			receipt
			isFromJuanCarlos
			createdAt
		}
	}
`;

export const GET_EXPENSE = gql`
	query Expense($id: ID!) {
		expense(id: $id) {
			_id
			car {
				_id
				brand {
					name
				}
				carModel {
					name
				}
				year
			}
			type
			description
			amount
			currency
			expenseDate
			receipt
			isFromJuanCarlos
			createdAt
		}
	}
`;

export const GET_CAR_EXPENSES_SUMMARY = gql`
	query CarExpensesSummary($carId: ID!) {
		carExpensesSummary(carId: $carId) {
			totalUSD
			totalCRC
			expenses {
				_id
				type
				amount
				currency
				expenseDate
				isFromJuanCarlos
			}
		}
	}
`;
