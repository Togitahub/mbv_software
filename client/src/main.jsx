// React
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";

// Apollo
import { client, persistCachePromise } from "./config/apolloClient";

// Context
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CarProvider } from "./context/CarContext";
import { ToastProvider } from "./context/ToastContext";
import { ExpensesProvider } from "./context/ExpensesContext";
import { WhatsAppProvider } from "./context/WhatsAppContext";

// Component
import App from "./App";

// Styles
import "./index.css";

persistCachePromise.then(() => {
	createRoot(document.getElementById("root")).render(
		<StrictMode>
			<BrowserRouter>
				<ApolloProvider client={client}>
					<ThemeProvider>
						<ToastProvider>
							<AuthProvider>
								<WhatsAppProvider>
									<CarProvider>
										<ExpensesProvider>
											<App />
										</ExpensesProvider>
									</CarProvider>
								</WhatsAppProvider>
							</AuthProvider>
						</ToastProvider>
					</ThemeProvider>
				</ApolloProvider>
			</BrowserRouter>
		</StrictMode>,
	);
});
