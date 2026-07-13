import { landingPalette } from "@/lib/palette";

export type FilmTheme = {
	/** CapCut-style master intensity (0–1, default 1 = 100%). */
	intensity: number;
	/** Contrast multiplier at full intensity. */
	contrast: number;
	/** Saturation multiplier at full intensity. */
	saturation: number;
	/** Brightness multiplier at full intensity. */
	brightness: number;
	/** Blue channel gain for deeper royal blues. */
	blueGain: number;
	/** Highlight glow (光晕) additive strength. */
	glowStrength: number;
	glowBlur: number;
	glowThreshold: number;
	glowThresholdIntercept: number;
	/** Blend sharp graded layer back after glow (0 = full fog, 1 = sharp). */
	clarityBlend: number;
	grainOpacity: number;
	vignetteStrength: number;
	mobileBlurScale: number;
};

export type LandingTheme = {
	colors: {
		background: string;
		text: string;
		cta: string;
	};
	film: FilmTheme;
	canvas: {
		fontSize: number;
		lineHeight: number;
		/** Whole-row horizontal wave (charWidth multiples). */
		rowShift: number;
		idleSampleWarp: number;
		scrollSampleWarp: number;
		warpMaxIntensity: number;
		marbleScale: number;
		marbleWarpStrength: number;
		marbleTimeSpeed: number;
		marbleCurlStrength: number;
		logoDeflectStrength: number;
		logoDeflectRadius: number;
		scrollSmoothing: number;
		warpIntensitySmoothing: number;
		warpIntensityDecay: number;
		warpScrollSensitivity: number;
		logoMaxWidthDesktop: number;
		logoMaxWidthMobile: number;
		logoDisplayScale: number;
		verticalDriftSpeed: number;
		mobileFrameIntervalMs: number;
		maxDevicePixelRatio: number;
	};
	content: {
		manifesto: string;
		ctaText: string;
	};
};

export const defaultTheme: LandingTheme = {
	colors: {
		background: landingPalette.background,
		text: landingPalette.text,
		cta: landingPalette.cta,
	},
	film: {
		intensity: 1,
		contrast: 1.19,
		saturation: 1.28,
		brightness: 0.96,
		blueGain: 0.98,
		glowStrength: 0.17,
		glowBlur: 8,
		glowThreshold: 2.55,
		glowThresholdIntercept: -0.88,
		clarityBlend: 0.2,
		grainOpacity: 0.055,
		vignetteStrength: 0.18,
		mobileBlurScale: 0.7,
	},
	canvas: {
		fontSize: 10,
		lineHeight: 13,
		rowShift: 0.45,
		idleSampleWarp: 1.35,
		scrollSampleWarp: 3.8,
		warpMaxIntensity: 1.35,
		marbleScale: 0.0045,
		marbleWarpStrength: 2.65,
		marbleTimeSpeed: 0.055,
		marbleCurlStrength: 0.42,
		logoDeflectStrength: 88,
		logoDeflectRadius: 128,
		scrollSmoothing: 0.12,
		warpIntensitySmoothing: 0.3,
		warpIntensityDecay: 0.93,
		warpScrollSensitivity: 4.5,
		logoMaxWidthDesktop: 2000,
		logoMaxWidthMobile: 900,
		logoDisplayScale: 0.85,
		verticalDriftSpeed: 0.005,
		mobileFrameIntervalMs: 1000 / 30,
		maxDevicePixelRatio: 1.5,
	},
	content: {
		manifesto: `Counterparty is building at the edge of markets and media. Every new medium reshapes how humans think, learn, and connect. Radio made voices travel beyond geography. Television made culture visual and collective. The internet made information abundant. Social media made everyone both audience and broadcaster. The next shift will make content adaptive, conversational, and co-created. It is early days, but we are witnessing the birth of something genuinely new. Dense text as atmosphere. Motion as invitation. Restraint as design. Scroll to disturb the surface. At rest the language moves like a pool of water. When you scroll the current wakes up and the field bends. The center holds the mark carved out by the text itself. Replace this manifesto with your own language when you are ready. Great landing pages do not explain everything at once. They create a mood, offer one clear next step, and leave room for curiosity. Counterparty is building at the edge of markets and media.`,
		ctaText: "JOIN THE WAITLIST",
	},
};
