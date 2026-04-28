import { Link } from "react-router-dom";
import { BsCarFront, BsFuelPump, BsGear, BsSpeedometer2 } from "react-icons/bs";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useWhatsApp } from "../../context/WhatsAppContext";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import {
	formatCRC,
	formatMileage,
	getLogisticStatusText,
	getLogisticStatusColor,
	getDetailsTranslation,
} from "../../utils/formatters";

const CarCard = ({ car }) => {
	const { user } = useAuth();
	const { sendWhatsAppInquiry, shareVehicle } = useWhatsApp();
	const isAdmin = user?.role === "admin" || user?.role === "superadmin";

	const displayMileage = car.adjustedMileage || car.actualMileage;

	return (
		<div
			className="group bg-main rounded-2xl border border-first/10 overflow-hidden shadow-sm
                    hover:shadow-xl hover:border-second/20 transition-all duration-300
                    transform hover:-translate-y-1"
		>
			{/* Image */}
			<Link to={`/car/${car._id}`} className="block relative overflow-hidden">
				<div className="aspect-4/3 bg-first/5 relative">
					{car.images?.[0] ? (
						<img
							src={car.images[0]}
							alt={`${car.brand?.name} ${car.carModel?.name}`}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							loading="lazy"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<BsCarFront className="w-16 h-16 text-first/10" />
						</div>
					)}

					{/* Status Badge */}
					<div className="absolute top-3 left-3">
						<Badge
							variant="neutral"
							size="sm"
							className={`${getLogisticStatusColor(car.logisticStatus)}`}
						>
							{getLogisticStatusText(car.logisticStatus)}
						</Badge>
					</div>

					{/* Image Count */}
					{car.images?.length > 1 && (
						<div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
							{car.images.length} fotos
						</div>
					)}
				</div>
			</Link>

			{/* Content */}
			<div className="p-4">
				{/* Title */}
				<Link to={`/car/${car._id}`}>
					<h3 className="text-lg font-semibold text-first group-hover:text-second transition-colors line-clamp-1">
						{car.brand?.name} {car.carModel?.name}
					</h3>
					<p className="text-sm text-first/40 mb-3">{car.year}</p>
				</Link>

				{/* Price */}
				<div className="mb-4">
					<p className="text-2xl font-bold text-second">
						{formatCRC(car.publishedPriceCRC)}
					</p>
				</div>

				{/* Specs */}
				<div className="grid grid-cols-3 gap-2 mb-4">
					<div className="flex flex-col items-center p-2 bg-first/5 rounded-lg">
						<BsSpeedometer2 className="w-4 h-4 text-first/40 mb-1" />
						<span className="text-xs text-first/60">
							{formatMileage(displayMileage)}
						</span>
					</div>
					<div className="flex flex-col items-center p-2 bg-first/5 rounded-lg">
						<BsGear className="w-4 h-4 text-first/40 mb-1" />
						<span className="text-xs text-first/60">
							{getDetailsTranslation("transmission", car.transmission)}
						</span>
					</div>
					<div className="flex flex-col items-center p-2 bg-first/5 rounded-lg">
						<BsFuelPump className="w-4 h-4 text-first/40 mb-1" />
						{getDetailsTranslation("fuelType", car.fuelType)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2">
					{!isAdmin && (
						<Button
							variant="secondary"
							size="sm"
							fullWidth
							icon={<FaWhatsapp className="w-4 h-4" />}
							onClick={() => sendWhatsAppInquiry(car)}
						>
							Consultar
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						iconOnly={isAdmin}
						onClick={() => shareVehicle(car)}
						aria-label="Compartir"
					>
						{!isAdmin && "Compartir"}
					</Button>
					{isAdmin && (
						<Link to={`/car/${car._id}`} className="flex-1">
							<Button variant="outline" size="sm" fullWidth>
								Detalles
							</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};

export default CarCard;
