import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { BsList, BsX, BsInstagram, BsFacebook, BsTiktok } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import ThemeChanger from "../ui/ThemeChanger";
import Button from "../ui/Button";

import logoHorizontalNegativo from "../../assets/mbv_horizontal_negativo.svg";
import logoVerticalNegativo from "../../assets/mbv_vertical_negativo.png";

import logoHorizontalPositivo from "../../assets/mbv_horizontal_positivo.svg";
import logoVerticalPositivo from "../../assets/mbv_vertical_positivo.png";

const Navbar = () => {
	const { theme } = useTheme();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();

	const socialLinks = {
		instagram: import.meta.env.VITE_INSTAGRAM || "#",
		whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER
			? `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`
			: "#",
		facebook: import.meta.env.VITE_FACEBOOK || "#",
		tiktok: import.meta.env.VITE_TIKTOK || "#",
	};

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleLogout = async () => {
		await logout();
		navigate("/");
		setIsMenuOpen(false);
	};

	const closeMenu = () => setIsMenuOpen(false);

	const navLinks = [
		{ to: "/", label: "Inicio", end: true },
		{ to: "/#catalog", label: "Catálogo", hash: true },
		{ to: "/brands", label: "Marcas" },
		{ to: "/models", label: "Modelos" },
	];

	const authLinks = isAuthenticated
		? [
				...(user?.role === "admin" || user?.role === "superadmin"
					? [{ to: "/admin/dashboard", label: "Panel Admin" }]
					: []),
				...(user?.commissionedCars?.length > 0
					? [{ to: "/my-cars", label: "Mis Autos" }]
					: []),
				{ to: "/my-account", label: "Mi Cuenta" },
			]
		: [];

	const linkClass = ({ isActive }) =>
		`bg-first rounded-full shadow-lg px-2 py-1 text-sm font-medium transition-colors duration-200 hover:bg-second hover:text-first ${
			isActive ? "bg-second  text-first" : "text-main"
		}`;

	const socialLinkClass = `p-2 bg-first rounded text-main hover:bg-second hover:text-first transition-colors duration-200`;

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? "bg-main/95 backdrop-blur-md shadow-lg border-b border-first/5"
					: "bg-transparent"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link to="/" className="hidden lg:flex items-center gap-2 shrink-0">
						<img
							src={
								theme === "dark-theme"
									? logoHorizontalNegativo
									: logoHorizontalPositivo
							}
							alt="MBV Logo"
							className="h-15 w-auto"
						/>
					</Link>
					{/* Logo */}
					<Link to="/" className="flex lg:hidden items-center gap-2 shrink-0">
						<img
							src={
								theme === "dark-theme"
									? logoVerticalNegativo
									: logoVerticalPositivo
							}
							alt="MBV Logo"
							className="h-10 w-auto"
						/>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden lg:flex items-center gap-6">
						{navLinks.map((link) =>
							link.hash ? (
								<a
									key={link.label}
									href={link.to}
									className="bg-first rounded-full shadow-lg px-2 py-1 text-main text-sm font-medium transition-colors duration-200 hover:bg-second hover:text-first"
								>
									{link.label}
								</a>
							) : (
								<NavLink
									key={link.to}
									to={link.to}
									end={link.end}
									className={linkClass}
								>
									{link.label}
								</NavLink>
							),
						)}
					</div>

					{/* Right Side */}
					<div className="hidden lg:flex items-center gap-3">
						{/* Social Icons */}
						<div className="flex items-center gap-2 mr-2">
							<a
								href={socialLinks.instagram}
								target="_blank"
								rel="noopener noreferrer"
								className={socialLinkClass}
								aria-label="Instagram"
							>
								<BsInstagram className="w-4 h-4" />
							</a>
							<a
								href={socialLinks.whatsapp}
								target="_blank"
								rel="noopener noreferrer"
								className={socialLinkClass}
								aria-label="WhatsApp"
							>
								<FaWhatsapp className="w-4 h-4" />
							</a>
							<a
								href={socialLinks.facebook}
								target="_blank"
								rel="noopener noreferrer"
								className={socialLinkClass}
								aria-label="Facebook"
							>
								<BsFacebook className="w-4 h-4" />
							</a>
							<a
								href={socialLinks.tiktok}
								target="_blank"
								rel="noopener noreferrer"
								className={socialLinkClass}
								aria-label="TikTok"
							>
								<BsTiktok className="w-4 h-4" />
							</a>
						</div>

						<ThemeChanger />

						{isAuthenticated ? (
							<>
								{authLinks.map((link) => (
									<NavLink key={link.to} to={link.to} className={linkClass}>
										{link.label}
									</NavLink>
								))}
								<Button variant="ghost" size="sm" onClick={handleLogout}>
									Cerrar sesión
								</Button>
							</>
						) : (
							<NavLink to="/auth">
								<Button variant="secondary" size="sm">
									Iniciar sesión
								</Button>
							</NavLink>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center gap-2 lg:hidden">
						<ThemeChanger />
						<Button
							iconOnly
							variant="secondary"
							size="sm"
							icon={
								isMenuOpen ? (
									<BsX className="w-5 h-5" />
								) : (
									<BsList className="w-5 h-5" />
								)
							}
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label="Toggle menu"
						/>
					</div>
				</div>
			</div>

			{/* Mobile Navigation */}
			<div
				className={`lg:hidden transition-all duration-300 overflow-hidden ${
					isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="bg-main/95 backdrop-blur-md border-t border-first/5 px-4 py-4 space-y-3">
					{navLinks.map((link) => (
						<div key={link.label}>
							{link.hash ? (
								<a
									href={link.to}
									onClick={closeMenu}
									className="block py-2 text-first/70 hover:text-second transition-colors"
								>
									{link.label}
								</a>
							) : (
								<NavLink
									to={link.to}
									end={link.end}
									onClick={closeMenu}
									className={({ isActive }) =>
										`block py-2 transition-colors ${isActive ? "text-second" : "text-first/70"}`
									}
								>
									{link.label}
								</NavLink>
							)}
						</div>
					))}

					<div className="border-t border-first/5 pt-3">
						{isAuthenticated ? (
							<>
								{authLinks.map((link) => (
									<NavLink
										key={link.to}
										to={link.to}
										onClick={closeMenu}
										className="block py-2 text-first/70 hover:text-second transition-colors"
									>
										{link.label}
									</NavLink>
								))}
								<button
									onClick={handleLogout}
									className="block py-2 text-first/70 hover:text-second transition-colors w-full text-left"
								>
									Cerrar sesión
								</button>
							</>
						) : (
							<NavLink to="/auth" onClick={closeMenu} className="block">
								<Button variant="primary" size="sm" fullWidth>
									Iniciar sesión
								</Button>
							</NavLink>
						)}
					</div>

					{/* Mobile Social Icons */}
					<div className="flex items-center gap-3 pt-3 border-t border-first/5">
						<a
							href={socialLinks.instagram}
							target="_blank"
							rel="noopener noreferrer"
							className="text-first/50 hover:text-second"
						>
							<BsInstagram className="w-4 h-4" />
						</a>
						<a
							href={socialLinks.whatsapp}
							target="_blank"
							rel="noopener noreferrer"
							className="text-first/50 hover:text-second"
						>
							<FaWhatsapp className="w-4 h-4" />
						</a>
						<a
							href={socialLinks.facebook}
							target="_blank"
							rel="noopener noreferrer"
							className="text-first/50 hover:text-second"
						>
							<BsFacebook className="w-4 h-4" />
						</a>
						<a
							href={socialLinks.tiktok}
							target="_blank"
							rel="noopener noreferrer"
							className="text-first/50 hover:text-second"
						>
							<BsTiktok className="w-4 h-4" />
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
