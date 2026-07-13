import type { FilmTheme } from "./theme";
import { effectiveFilmParams } from "./richColor";

export type FilmPassScratch = {
	source: HTMLCanvasElement;
	glow: HTMLCanvasElement;
};

export function createFilmPassScratch(width: number, height: number): FilmPassScratch {
	const source = document.createElement("canvas");
	const glow = document.createElement("canvas");
	for (const canvas of [source, glow]) {
		canvas.width = width;
		canvas.height = height;
	}
	return { source, glow };
}

export function resizeFilmPassScratch(scratch: FilmPassScratch, width: number, height: number): void {
	for (const canvas of [scratch.source, scratch.glow]) {
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}
	}
}

/**
 * Canvas highlight glow for Rich Color — use if SVG filter glow is insufficient on text.
 */
export function applyRichColorGlow(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	film: FilmTheme,
	scratch: FilmPassScratch,
	options: { mobile?: boolean; reduceMotion?: boolean } = {},
): void {
	const params = effectiveFilmParams(film, options);
	resizeFilmPassScratch(scratch, width, height);

	const sourceCtx = scratch.source.getContext("2d");
	const glowCtx = scratch.glow.getContext("2d");
	if (!sourceCtx || !glowCtx) return;

	sourceCtx.clearRect(0, 0, width, height);
	sourceCtx.drawImage(ctx.canvas, 0, 0, width, height);

	glowCtx.clearRect(0, 0, width, height);
	glowCtx.filter = `blur(${params.glowBlur}px)`;
	glowCtx.drawImage(scratch.source, 0, 0);
	glowCtx.filter = "none";

	ctx.globalCompositeOperation = "lighter";
	ctx.globalAlpha = params.glowStrength;
	ctx.drawImage(scratch.glow, 0, 0);
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = "source-over";
}
