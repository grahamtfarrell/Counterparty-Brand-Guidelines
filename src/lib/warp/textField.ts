import type { LandingTheme } from "./theme";

export type LineMetrics = {
	font: string;
	charWidth: number;
	lineHeight: number;
};

export type TextField = {
	flat: string;
	charsPerLine: number;
	charWidth: number;
	lineHeight: number;
	width: number;
	height: number;
};

let fieldCacheKey = "";
let fieldCache: TextField | null = null;

export function measureLineMetrics(
	ctx: CanvasRenderingContext2D,
	fontSize: number,
	fontFamily: string,
	lineHeight: number,
	gridFontFamily: string,
): LineMetrics {
	const font = `${fontSize}px ${fontFamily}`;
	const gridFont = `${fontSize}px ${gridFontFamily}`;
	ctx.font = gridFont;
	const probe = "MMMMMMMMMMMMMMMMMMMM";
	const charWidth = Math.max(1, ctx.measureText(probe).width / probe.length);
	return { font, charWidth, lineHeight };
}

export function buildTextField(
	theme: LandingTheme,
	metrics: LineMetrics,
	viewportWidth: number,
	viewportHeight: number,
): TextField {
	const charsPerLine = Math.max(64, Math.ceil(viewportWidth / metrics.charWidth) + 24);
	const rowCount = Math.max(128, Math.ceil((viewportHeight * 8) / metrics.lineHeight));
	const cacheKey = `${charsPerLine}:${rowCount}:${theme.content.manifesto.length}`;

	if (fieldCache && fieldCacheKey === cacheKey) return fieldCache;

	const normalized = theme.content.manifesto.replace(/\s+/g, " ").trim() + " ";
	const minLength = charsPerLine * rowCount;
	let flat = normalized;
	while (flat.length < minLength) {
		flat += normalized;
	}

	fieldCache = {
		flat,
		charsPerLine,
		charWidth: metrics.charWidth,
		lineHeight: metrics.lineHeight,
		width: charsPerLine * metrics.charWidth,
		height: rowCount * metrics.lineHeight,
	};
	fieldCacheKey = cacheKey;
	return fieldCache;
}

export function clearTextFieldCache(): void {
	fieldCache = null;
	fieldCacheKey = "";
}

export function sampleTextField(field: TextField, worldX: number, worldY: number): string {
	const wrappedX = ((worldX % field.width) + field.width) % field.width;
	const wrappedY = ((worldY % field.height) + field.height) % field.height;

	const col = Math.floor(wrappedX / field.charWidth);
	const row = Math.floor(wrappedY / field.lineHeight);
	const index = row * field.charsPerLine + col;

	return field.flat[index % field.flat.length] ?? " ";
}

export function getFieldScrollWidth(field: TextField): number {
	return field.width;
}
