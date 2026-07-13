export function smoothstep(t: number): number {
	return t * t * (3 - 2 * t);
}

function grad(x: number, y: number, z: number): number {
	const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
	return (n - Math.floor(n)) * 2 - 1;
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function noise3D(x: number, y: number, z: number): number {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const iz = Math.floor(z);
	const fx = smoothstep(x - ix);
	const fy = smoothstep(y - iy);
	const fz = smoothstep(z - iz);

	const x0 = lerp(grad(ix, iy, iz), grad(ix + 1, iy, iz), fx);
	const x1 = lerp(grad(ix, iy + 1, iz), grad(ix + 1, iy + 1, iz), fx);
	const x2 = lerp(grad(ix, iy, iz + 1), grad(ix + 1, iy, iz + 1), fx);
	const x3 = lerp(grad(ix, iy + 1, iz + 1), grad(ix + 1, iy + 1, iz + 1), fx);

	const y0 = lerp(x0, x1, fy);
	const y1 = lerp(x2, x3, fy);
	return lerp(y0, y1, fz);
}

function fbm(x: number, y: number, z: number, octaves = 3): number {
	let sum = 0;
	let amp = 0.5;
	let freq = 1;
	for (let i = 0; i < octaves; i++) {
		sum += amp * noise3D(x * freq, y * freq, z);
		amp *= 0.5;
		freq *= 2;
	}
	return sum;
}

function softClamp(value: number, gain = 1): number {
	return Math.tanh(value * gain);
}

export type FlowFieldInput = {
	x: number;
	y: number;
	time: number;
	marbleScale: number;
	marbleWarpStrength: number;
	marbleTimeSpeed: number;
	marbleCurlStrength: number;
};

/** Domain-warped flow — always-on liquid motion. */
export function computeFlowField(input: FlowFieldInput): [number, number] {
	const { x, y, time, marbleScale, marbleWarpStrength, marbleTimeSpeed, marbleCurlStrength } =
		input;

	const wx = x * marbleScale;
	const wy = y * marbleScale;
	const t = time * marbleTimeSpeed;

	const qx = fbm(wx * 0.58, wy * 0.58, t);
	const qy = fbm(wx * 0.58 + 5.2, wy * 0.58 + 1.3, t + 2.1);
	const sx = fbm(wx + marbleWarpStrength * qx, wy + marbleWarpStrength * qy, t * 0.62 + 1.4);
	const sy = fbm(
		wx + marbleWarpStrength * qx + 8.3,
		wy + marbleWarpStrength * qy + 2.8,
		t * 0.62 + 3.2,
	);

	const eps = 0.11;
	const cx = (fbm(wx + eps, wy, t + 4.7, 2) - fbm(wx - eps, wy, t + 4.7, 2)) / (2 * eps);
	const cy = (fbm(wx, wy + eps, t + 4.7, 2) - fbm(wx, wy - eps, t + 4.7, 2)) / (2 * eps);

	const rippleX = fbm(wx * 1.35 + t * 0.8, wy * 1.35, t * 1.1 + 6.2, 2) * 0.35;
	const rippleY = fbm(wx * 1.35, wy * 1.35 + t * 0.8, t * 1.1 + 9.4, 2) * 0.35;

	const dx = sx + marbleCurlStrength * -cy + rippleX;
	const dy = sy + marbleCurlStrength * cx + rippleY;

	return [softClamp(dx, 1.05), softClamp(dy, 1.05)];
}

export type ScrollWarpInput = FlowFieldInput & {
	scroll: number;
	warpIntensity: number;
};

/** Displaced read coords — draw grid stays fixed; texture flows through it. */
export function computeSampleWarp(input: ScrollWarpInput): [number, number] {
	const [fx, fy] = computeFlowField(input);
	const { scroll, warpIntensity, time, marbleTimeSpeed } = input;

	const scrollPhase = scroll * 0.005 + time * marbleTimeSpeed * 1.6;
	const splash =
		fbm(input.x * 0.0038 + scrollPhase, input.y * 0.0038, scrollPhase * 1.4, 2) * 0.55;

	const scrollBoost = 1 + warpIntensity * 1.8;

	return [
		(fx + splash) * scrollBoost,
		(fy + splash * 0.75) * scrollBoost,
	];
}

export function clampScroll(scroll: number, contentWidth: number, viewportWidth: number): number {
	const min = -(contentWidth - viewportWidth);
	return Math.min(0, Math.max(scroll, min));
}
