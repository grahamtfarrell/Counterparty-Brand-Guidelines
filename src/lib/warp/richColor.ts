import type { FilmTheme } from "./theme";

/** Rec.709 luminance weights for saturation matrix. */
const LUM_R = 0.2126;
const LUM_G = 0.7152;
const LUM_B = 0.0722;

export function buildSaturationMatrix(saturation: number): string {
	const s = saturation;
	const sr = (1 - s) * LUM_R;
	const sg = (1 - s) * LUM_G;
	const sb = (1 - s) * LUM_B;
	return [
		`${sr + s} ${sg} ${sb} 0 0`,
		`${sr} ${sg + s} ${sb} 0 0`,
		`${sr} ${sg} ${sb + s} 0 0`,
		"0 0 0 1 0",
	].join("  ");
}

export function buildBlueGainMatrix(blueGain: number): string {
	return `1 0 0 0 0  0 1 0 0 0  0 0 ${blueGain} 0 0  0 0 0 1 0`;
}

/** Contrast slope + brightness offset for feComponentTransfer linear funcs. */
export function contrastTransfer(contrast: number, brightness: number): { slope: number; intercept: number } {
	const slope = contrast;
	const intercept = 0.5 * (1 - contrast) + (brightness - 1) * 0.12;
	return { slope, intercept };
}

export function effectiveFilmParams(
	film: FilmTheme,
	options: { mobile?: boolean; reduceMotion?: boolean } = {},
): {
	contrast: { slope: number; intercept: number };
	saturationMatrix: string;
	blueGainMatrix: string;
	glowStrength: number;
	glowBlur: number;
	glowThreshold: number;
	glowThresholdIntercept: number;
	clarityBlend: number;
	clarityRetain: number;
} {
	const intensity = options.reduceMotion ? film.intensity * 0.65 : film.intensity;
	const mobileScale = options.mobile ? film.mobileBlurScale : 1;

	const contrast = 1 + (film.contrast - 1) * intensity;
	const saturation = 1 + (film.saturation - 1) * intensity;
	const brightness = 1 + (film.brightness - 1) * intensity;
	const blueGain = 1 + (film.blueGain - 1) * intensity;

	return {
		contrast: contrastTransfer(contrast, brightness),
		saturationMatrix: buildSaturationMatrix(saturation),
		blueGainMatrix: buildBlueGainMatrix(blueGain),
		glowStrength: film.glowStrength * intensity,
		glowBlur: film.glowBlur * mobileScale,
		glowThreshold: film.glowThreshold,
		glowThresholdIntercept: film.glowThresholdIntercept,
		clarityBlend: film.clarityBlend * intensity,
		clarityRetain: 1 - film.clarityBlend * intensity,
	};
}
