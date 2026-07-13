import type { LandingTheme } from "@/lib/warp/theme";
import { effectiveFilmParams } from "@/lib/warp/richColor";

type LandingFilmDefsProps = {
	film: LandingTheme["film"];
	mobile?: boolean;
	reduceMotion?: boolean;
};

/**
 * CapCut "Rich Color" style pass: saturation + contrast + blue depth + highlight glow (光晕).
 * Applied via CSS filter on `.landing-film-source`.
 */
export function LandingFilmDefs({
	film,
	mobile = false,
	reduceMotion = false,
}: LandingFilmDefsProps) {
	const params = effectiveFilmParams(film, { mobile, reduceMotion });

	return (
		<svg className="landing-film-defs" aria-hidden="true">
			<defs>
				<filter
					id="landing-film-pass"
					x="-30%"
					y="-30%"
					width="160%"
					height="160%"
					colorInterpolationFilters="sRGB"
				>
					{/* Rich color grade: saturation → contrast/brightness → blue depth */}
					<feColorMatrix
						in="SourceGraphic"
						type="matrix"
						values={params.saturationMatrix}
						result="saturated"
					/>
					<feComponentTransfer in="saturated" result="contrasted">
						<feFuncR
							type="linear"
							slope={params.contrast.slope}
							intercept={params.contrast.intercept}
						/>
						<feFuncG
							type="linear"
							slope={params.contrast.slope}
							intercept={params.contrast.intercept}
						/>
						<feFuncB
							type="linear"
							slope={params.contrast.slope}
							intercept={params.contrast.intercept}
						/>
						<feFuncA type="identity" />
					</feComponentTransfer>
					<feColorMatrix
						in="contrasted"
						type="matrix"
						values={params.blueGainMatrix}
						result="graded"
					/>

					{/* Highlight glow — soft 光晕 on bright areas (white text, CTA) */}
					<feGaussianBlur in="graded" stdDeviation={params.glowBlur} result="glowBlur" />
					<feComponentTransfer in="glowBlur" result="glowMask">
						<feFuncR type="linear" slope="1.1" intercept="0" />
						<feFuncG type="linear" slope="1.1" intercept="0" />
						<feFuncB type="linear" slope="1.1" intercept="0" />
						<feFuncA
							type="linear"
							slope={params.glowThreshold}
							intercept={params.glowThresholdIntercept}
						/>
					</feComponentTransfer>
					<feComposite
						in="glowMask"
						in2="graded"
						operator="arithmetic"
						k1="0"
						k2="1"
						k3={params.glowStrength}
						k4="0"
						result="withGlow"
					/>
					{/* Pull sharp grade back in — keeps fog but restores letter edges */}
					<feComposite
						in="graded"
						in2="withGlow"
						operator="arithmetic"
						k1="0"
						k2={params.clarityBlend}
						k3={params.clarityRetain}
						k4="0"
					/>
				</filter>
			</defs>
		</svg>
	);
}
