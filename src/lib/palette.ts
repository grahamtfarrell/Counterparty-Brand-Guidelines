/**
 * Single source of truth for landing colors.
 * Wired into theme (canvas), layout (CSS vars), and film grade tuning.
 */
export const landingPalette = {
	/** Deep navy — darker than the original electric #000495. */
	background: "#001238",
	text: "#ffffff",
	textMuted: "rgb(245 245 240 / 0.72)",
	cta: "#f5f5f0",
	ctaInk: "#001238",
} as const;

export type LandingPalette = typeof landingPalette;

/** CSS custom properties for the document root. */
export function landingPaletteCssVars(): Record<string, string> {
	return {
		"--landing-bg": landingPalette.background,
		"--landing-text": landingPalette.text,
		"--landing-cta": landingPalette.cta,
		"--landing-cta-ink": landingPalette.ctaInk,
		"--landing-overlay-muted": landingPalette.textMuted,
	};
}
