import { Link } from "react-router-dom";

import { BsInstagram, BsFacebook, BsTiktok } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";

import logoHorizontal from "../../assets/mbv_horizontal_negativo.svg";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	const socialLinks = [
		{
			icon: <BsInstagram className="w-4 h-4" />,
			url: import.meta.env.VITE_INSTAGRAM_URL || "#",
			label: "Instagram",
		},
		{
			icon: <FaWhatsapp className="w-4 h-4" />,
			url: import.meta.env.VITE_WHATSAPP_NUMBER
				? `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`
				: "#",
			label: "WhatsApp",
		},
		{
			icon: <BsFacebook className="w-4 h-4" />,
			url: import.meta.env.VITE_FACEBOOK_URL || "#",
			label: "Facebook",
		},
		{
			icon: <BsTiktok className="w-4 h-4" />,
			url: import.meta.env.VITE_TIKTOK_URL || "#",
			label: "TikTok",
		},
	];

	const quickLinks = [
		{ to: "/", label: "Inicio" },
		{ to: "/brands", label: "Marcas" },
		{ to: "/models", label: "Modelos" },
	];

	return (
		<footer className="bg-second text-main mt-20">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Main Footer Content */}
				<div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Brand */}
					<div className="space-y-4">
						<img
							src={logoHorizontal}
							alt="MBV Logo"
							className="h-12 w-auto"
						/>
						<p className="text-first/70 text-sm leading-relaxed">
							Importaciones MBV - Vehículos importados desde Florida, USA.
							Calidad y confianza en cada auto que traemos para ti.
						</p>
						{/* Social Links */}
						<div className="flex items-center gap-2">
							{socialLinks.map((social) => (
								<a
									key={social.label}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className="w-9 h-9 flex items-center justify-center rounded-full bg-main/10 hover:bg-main/20 text-first transition-all duration-200"
									aria-label={social.label}
								>
									{social.icon}
								</a>
							))}
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="font-semibold text-first mb-4">Enlaces rápidos</h3>
						<ul className="space-y-2">
							{quickLinks.map((link) => (
								<li key={link.to}>
									<Link
										to={link.to}
										className="text-first/70 hover:text-first text-sm transition-colors duration-200"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h3 className="font-semibold text-first mb-4">Contacto</h3>
						<ul className="space-y-2 text-sm text-first/70">
							<li>
								<span className="font-medium text-first/90">WhatsApp:</span>{" "}
								<a
									href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ""}`}
									target="_blank"
									rel="noopener noreferrer"
									className="hover:text-first transition-colors"
								>
									{import.meta.env.VITE_WHATSAPP_NUMBER || "Contáctanos"}
								</a>
							</li>
							<li>
								<span className="font-medium text-first/90">Email:</span>{" "}
								<a
									href={`mailto:${import.meta.env.VITE_EMAIL || "info@importacionesmbv.com"}`}
									className="hover:text-first transition-colors"
								>
									{import.meta.env.VITE_EMAIL || "info@importacionesmbv.com"}
								</a>
							</li>
							<li>
								<span className="font-medium text-first/90">Ubicación:</span>{" "}
								Costa Rica
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-first/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="text-first/50 text-xs">
						© {currentYear} Importaciones MBV. Todos los derechos reservados.
					</p>
					<p className="text-first/40 text-xs">
						Desarrollado con ❤️ por MBV Team
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
