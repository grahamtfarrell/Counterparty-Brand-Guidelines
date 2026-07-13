export const LOGO_ASSET_PATH = "/counterparty-logo.png";

export type LogoBounds = {
	left: number;
	right: number;
	top: number;
	bottom: number;
	centerX: number;
	centerY: number;
};

export type LogoPlacement = {
	left: number;
	top: number;
	width: number;
	height: number;
	bounds: LogoBounds;
};

let logoImagePromise: Promise<HTMLImageElement> | null = null;

export function loadLogoImage(src: string = LOGO_ASSET_PATH): Promise<HTMLImageElement> {
	if (logoImagePromise) return logoImagePromise;

	logoImagePromise = new Promise((resolve, reject) => {
		const image = new Image();
		image.decoding = "async";
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load logo image: ${src}`));
		image.src = src;
	});

	return logoImagePromise;
}

export function computeLogoDisplayWidth(
	viewportWidth: number,
	viewportHeight: number,
	image: HTMLImageElement,
	maxWidthCap: number,
	scale = 1,
): number {
	const aspect = image.width / Math.max(image.height, 1);
	const widthFromViewport = viewportWidth * 0.98;
	const widthFromHeight = viewportHeight * 0.34 * aspect;
	const fit = Math.min(widthFromViewport, widthFromHeight);
	return Math.max(280, Math.min(maxWidthCap, fit)) * scale;
}

function buildPlacement(
	image: HTMLImageElement,
	centerX: number,
	centerY: number,
	displayWidth: number,
): LogoPlacement {
	const aspect = image.width / Math.max(image.height, 1);
	const width = displayWidth;
	const height = width / aspect;
	const left = centerX - width / 2;
	const top = centerY - height / 2;

	return {
		left,
		top,
		width,
		height,
		bounds: {
			left,
			right: left + width,
			top,
			bottom: top + height,
			centerX,
			centerY,
		},
	};
}

/** Pixel-accurate mask from the official logo artwork. */
export class LogoMask {
	private width = 0;
	private height = 0;
	private mask: Uint8ClampedArray | null = null;
	private bounds: LogoBounds | null = null;
	private placement: LogoPlacement | null = null;

	rebuild(
		image: HTMLImageElement,
		centerX: number,
		centerY: number,
		viewportWidth: number,
		viewportHeight: number,
		displayWidth: number,
	) {
		this.width = Math.ceil(viewportWidth);
		this.height = Math.ceil(viewportHeight);
		this.placement = buildPlacement(image, centerX, centerY, displayWidth);

		const maskCanvas = document.createElement("canvas");
		maskCanvas.width = this.width;
		maskCanvas.height = this.height;
		const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
		if (!maskCtx) return;

		maskCtx.clearRect(0, 0, this.width, this.height);
		maskCtx.drawImage(
			image,
			this.placement.left,
			this.placement.top,
			this.placement.width,
			this.placement.height,
		);

		const { data } = maskCtx.getImageData(0, 0, this.width, this.height);
		const mask = new Uint8ClampedArray(this.width * this.height);

		for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
			const r = data[i] ?? 0;
			const g = data[i + 1] ?? 0;
			const b = data[i + 2] ?? 0;
			const a = data[i + 3] ?? 0;
			const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			mask[p] = a > 12 && luminance > 36 ? 255 : 0;
		}

		this.mask = mask;
		this.bounds = this.placement.bounds;
	}

	isInside(x: number, y: number): boolean {
		if (!this.mask) return false;
		const ix = Math.floor(x);
		const iy = Math.floor(y);
		if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return false;
		return (this.mask[iy * this.width + ix] ?? 0) > 127;
	}

	deflectSample(
		screenX: number,
		screenY: number,
		sampleX: number,
		sampleY: number,
		strength: number,
		radius: number,
	): [number, number] {
		if (!this.bounds || this.isInside(screenX, screenY)) return [sampleX, sampleY];

		const box = this.bounds;
		const pad = radius;
		const left = box.left - pad;
		const right = box.right + pad;
		const top = box.top - pad;
		const bottom = box.bottom + pad;

		if (screenX < left || screenX > right || screenY < top || screenY > bottom) {
			return [sampleX, sampleY];
		}

		const dx = screenX - box.centerX;
		const dy = screenY - box.centerY;
		const dist = Math.hypot(dx, dy) || 1;
		const influence = Math.max(0, 1 - dist / (radius * 1.35));
		const falloff = influence * influence;

		return [
			sampleX + (dx / dist) * falloff * strength,
			sampleY + (dy / dist) * falloff * strength,
		];
	}

	get placementRef(): LogoPlacement | null {
		return this.placement;
	}
}
