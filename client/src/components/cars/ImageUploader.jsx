import { useState, useRef } from "react";
import { BsUpload, BsX } from "react-icons/bs";

import {
	uploadImage,
	validateImage,
	deleteImage,
} from "../../utils/imageUtils";

import { useToast } from "../../context/ToastContext";

const ImageUploader = ({ images = [], onImagesChange, maxImages = 8 }) => {
	const [uploading, setUploading] = useState(false);
	const [dragOver, setDragOver] = useState(false);
	const fileInputRef = useRef(null);
	const { toast } = useToast();

	const handleFiles = async (files) => {
		const fileArray = Array.from(files);

		// Validar cantidad
		if (images.length + fileArray.length > maxImages) {
			toast.error(`Máximo ${maxImages} imágenes permitidas`);
			return;
		}

		setUploading(true);
		const newImages = [...images];

		for (const file of fileArray) {
			// Validar archivo
			const validation = validateImage(file);
			if (!validation.valid) {
				toast.error(validation.error);
				continue;
			}

			try {
				const url = await uploadImage(file, "vehicles");
				newImages.push(url);
			} catch (error) {
				toast.error(`Error al subir ${file.name}: ${error.message}`);
			}
		}

		onImagesChange(newImages);
		setUploading(false);
	};

	const handleRemove = async (index) => {
		const urlToRemove = images[index];
		try {
			await deleteImage(urlToRemove);
		} catch (err) {
			console.error("Error deleting image:", err);
		}
		const newImages = images.filter((_, i) => i !== index);
		onImagesChange(newImages);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = () => {
		setDragOver(false);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		setDragOver(false);
		handleFiles(e.dataTransfer.files);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e) => {
		handleFiles(e.target.files);
		e.target.value = "";
	};

	const handleSetPrimary = (index) => {
		if (index === 0) return; // Ya es principal
		const newImages = [...images];
		const [primary] = newImages.splice(index, 1);
		newImages.unshift(primary);
		onImagesChange(newImages);
	};

	return (
		<div className="space-y-3">
			<p className="text-sm font-medium text-first/80">
				Imágenes ({images.length}/{maxImages})
			</p>

			{/* Preview Grid */}
			{images.length > 0 && (
				<div className="grid grid-cols-4 gap-2">
					{images.map((url, index) => (
						<div
							key={index}
							className="relative group aspect-square rounded-lg overflow-hidden bg-first/5"
						>
							<img
								src={url}
								alt={`Imagen ${index + 1}`}
								className="w-full h-full object-cover"
							/>
							<button
								onClick={() => handleRemove(index)}
								className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white 
                         flex items-center justify-center opacity-0 group-hover:opacity-100 
                         transition-opacity hover:bg-error"
								type="button"
							>
								<BsX className="w-4 h-4" />
							</button>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									handleSetPrimary(index);
								}}
								className={`absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded transition-colors ${
									index === 0
										? "bg-second text-white"
										: "bg-black/40 text-white/70 hover:bg-black/60"
								}`}
								title={
									index === 0 ? "Imagen principal" : "Establecer como principal"
								}
							>
								{index === 0 ? "★ Principal" : "☆"}
							</button>
						</div>
					))}
				</div>
			)}

			{/* Upload Area */}
			<div
				onClick={handleClick}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${
						dragOver
							? "border-second bg-second/5"
							: "border-first/20 hover:border-second/50 hover:bg-first/5"
					}
          ${images.length >= maxImages ? "opacity-50 pointer-events-none" : ""}
        `}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/webp,image/png,image/jpg,image/jpeg"
					multiple
					onChange={handleFileChange}
					className="hidden"
				/>

				{uploading ? (
					<div className="flex flex-col items-center gap-2">
						<div className="w-8 h-8 border-2 border-second/20 border-t-second rounded-full animate-spin" />
						<p className="text-sm text-first/50">Subiendo imágenes...</p>
					</div>
				) : (
					<div className="flex flex-col items-center gap-2">
						<div className="w-12 h-12 rounded-full bg-second/10 flex items-center justify-center">
							<BsUpload className="w-6 h-6 text-second" />
						</div>
						<div>
							<p className="text-sm text-first font-medium">
								{images.length === 0
									? "Arrastra imágenes aquí o haz clic para subir"
									: "Agregar más imágenes"}
							</p>
							<p className="text-xs text-first/40 mt-1">
								WebP, PNG, JPG • Máx 5MB cada una
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ImageUploader;
