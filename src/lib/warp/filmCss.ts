import type { CSSProperties } from "react";
import type { LandingTheme } from "./theme";

/** CSS custom properties for grain/vignette overlays (SVG filter params live in LandingFilmDefs). */
export function filmCssVariables(film: LandingTheme["film"]): CSSProperties {
	return {
		"--film-grain-opacity": film.grainOpacity,
		"--film-vignette-strength": film.vignetteStrength,
	} as CSSProperties;
}
