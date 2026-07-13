"use client";

import { useEffect, useRef } from "react";
import { CANVAS_TEXT_FONT, GRID_FONT } from "@/lib/canvasFont";
import {
	computeLogoDisplayWidth,
	loadLogoImage,
	LogoMask,
} from "@/lib/warp/logo";
import {
	clampScroll,
	computeFlowField,
	computeSampleWarp,
} from "@/lib/warp/noise";
import { defaultTheme, type LandingTheme } from "@/lib/warp/theme";
import {
	buildTextField,
	clearTextFieldCache,
	getFieldScrollWidth,
	measureLineMetrics,
	sampleTextField,
	type LineMetrics,
	type TextField,
} from "@/lib/warp/textField";

type WarpedTextCanvasProps = {
	theme?: LandingTheme;
	interactive?: boolean;
	className?: string;
};

function flowInput(
	x: number,
	y: number,
	time: number,
	theme: LandingTheme,
) {
	return {
		x,
		y,
		time,
		marbleScale: theme.canvas.marbleScale,
		marbleWarpStrength: theme.canvas.marbleWarpStrength,
		marbleTimeSpeed: theme.canvas.marbleTimeSpeed,
		marbleCurlStrength: theme.canvas.marbleCurlStrength,
	};
}

function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false;
	if (target.closest("a, button, input, textarea, select, [data-warp-ignore]")) return true;
	let node: Element | null = target;
	while (node) {
		if (node.getAttribute("role") === "dialog") return true;
		node = node.parentElement;
	}
	return false;
}

function getDevicePixelRatio(isMobile: boolean, maxRatio: number): number {
	const ratio = window.devicePixelRatio || 1;
	return isMobile ? Math.min(ratio, maxRatio) : ratio;
}

export function WarpedTextCanvas({
	theme = defaultTheme,
	interactive = true,
	className,
}: WarpedTextCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const themeRef = useRef(theme);
	themeRef.current = theme;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let rafId: number | null = null;
		let scrollTarget = 0;
		let scrollCurrent = 0;
		let scrollPrevious = 0;
		let driftY = 0;
		let warpTarget = 0;
		let warpCurrent = 0;
		let pointerStartX = 0;
		let scrollAtPointerDown = 0;
		let activePointerId: number | null = null;
		let lastFrameTime = 0;
		let idleTime = 0;
		let metrics: LineMetrics | null = null;
		let textField: TextField | null = null;
		let logoImage: HTMLImageElement | null = null;
		let logoMask = new LogoMask();
		let logoDisplayWidth = 0;
		let logoViewportKey = "";
		let logoReady = false;

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const mobileQuery = window.matchMedia("(max-width: 767px)");
		let isMobile = mobileQuery.matches;
		let isReducedMotion = reducedMotion.matches;

		const resolveLogoWidth = (viewportWidth: number, viewportHeight: number) => {
			if (!logoImage) return 0;
			const cap = isMobile
				? themeRef.current.canvas.logoMaxWidthMobile
				: themeRef.current.canvas.logoMaxWidthDesktop;
			return computeLogoDisplayWidth(
				viewportWidth,
				viewportHeight,
				logoImage,
				cap,
				themeRef.current.canvas.logoDisplayScale,
			);
		};

		const resize = () => {
			const currentTheme = themeRef.current;
			const ratio = getDevicePixelRatio(isMobile, currentTheme.canvas.maxDevicePixelRatio);
			const rect = canvas.getBoundingClientRect();
			const width = Math.round(rect.width * ratio);
			const height = Math.round(rect.height * ratio);

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}

			ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
			metrics = measureLineMetrics(
				ctx,
				currentTheme.canvas.fontSize,
				CANVAS_TEXT_FONT,
				currentTheme.canvas.lineHeight,
				GRID_FONT,
			);
			clearTextFieldCache();
			textField = buildTextField(currentTheme, metrics, rect.width, rect.height);
			logoViewportKey = "";
		};

		const ensureLogo = (centerX: number, centerY: number, viewportWidth: number, viewportHeight: number) => {
			if (!logoReady || !logoImage || viewportWidth < 1 || viewportHeight < 1) return;

			const nextWidth = resolveLogoWidth(viewportWidth, viewportHeight);
			const viewportKey = `${Math.round(viewportWidth)}x${Math.round(viewportHeight)}:${Math.round(centerX)}:${Math.round(centerY)}:${Math.round(nextWidth)}`;

			if (logoViewportKey !== viewportKey) {
				logoDisplayWidth = nextWidth;
				try {
					logoMask.rebuild(logoImage, centerX, centerY, viewportWidth, viewportHeight, nextWidth);
				} catch {
					logoViewportKey = "";
					return;
				}
				logoViewportKey = viewportKey;
			}
		};

		const bumpWarp = (delta: number) => {
			const { warpScrollSensitivity, warpIntensityDecay, warpMaxIntensity } =
				themeRef.current.canvas;
			warpTarget = Math.min(
				warpMaxIntensity,
				warpTarget * warpIntensityDecay + (Math.abs(delta) / warpScrollSensitivity) * 1.35,
			);
		};

		const scheduleFrame = () => {
			if (rafId === null) rafId = requestAnimationFrame(render);
		};

		const render = (timestamp: number) => {
			rafId = null;
			const currentTheme = themeRef.current;
			const frameBudget = isMobile ? currentTheme.canvas.mobileFrameIntervalMs : 0;

			if (!isReducedMotion && frameBudget > 0 && lastFrameTime > 0 && timestamp - lastFrameTime < frameBudget) {
				scheduleFrame();
				return;
			}

			const deltaMs = lastFrameTime > 0 ? timestamp - lastFrameTime : 16;
			lastFrameTime = timestamp;

			if (!isReducedMotion) {
				idleTime += deltaMs / 1000;
				driftY += deltaMs * currentTheme.canvas.verticalDriftSpeed;
				const smoothing = currentTheme.canvas.scrollSmoothing;
				scrollCurrent += (scrollTarget - scrollCurrent) * smoothing;

				const scrollDelta = Math.abs(scrollCurrent - scrollPrevious);
				if (scrollDelta > 0.05) bumpWarp(scrollDelta);
				scrollPrevious = scrollCurrent;

				warpTarget *= currentTheme.canvas.warpIntensityDecay;
				warpCurrent += (warpTarget - warpCurrent) * currentTheme.canvas.warpIntensitySmoothing;
			} else {
				scrollCurrent = scrollTarget;
				warpCurrent = 0;
			}

			if (!metrics) resize();
			if (!metrics || !textField) {
				scheduleFrame();
				return;
			}

			const rect = canvas.getBoundingClientRect();
			if (rect.width < 1 || rect.height < 1) {
				scheduleFrame();
				return;
			}
			const scroll = scrollCurrent;

			ctx.clearRect(0, 0, rect.width, rect.height);
			ctx.fillStyle = currentTheme.colors.background;
			ctx.fillRect(0, 0, rect.width, rect.height);

			const viewport = window.visualViewport;
			const center = viewport
				? {
						x: viewport.offsetLeft + viewport.width / 2 - rect.left,
						y: viewport.offsetTop + viewport.height / 2 - rect.top,
					}
				: { x: rect.width / 2, y: rect.height / 2 };

			ensureLogo(center.x, center.y, rect.width, rect.height);

			ctx.save();
			ctx.textBaseline = "top";
			ctx.textAlign = "left";
			ctx.font = metrics.font;
			ctx.fillStyle = currentTheme.colors.text;

			const { charWidth, lineHeight } = metrics;
			const scrollRemainder =
				((scroll % charWidth) + charWidth) % charWidth;
			const rowShiftPad =
				Math.abs(currentTheme.canvas.rowShift * charWidth) + charWidth * 3;

			const topRow = Math.floor(driftY / lineHeight) - 1;
			const rowCount = Math.ceil(rect.height / lineHeight) + 4;

			const flowOpts = (x: number, y: number) =>
				flowInput(x, y, idleTime, currentTheme);

			for (let ri = 0; ri < rowCount; ri += 1) {
				const row = topRow + ri;
				const drawY = row * lineHeight - driftY;
				if (drawY < -lineHeight || drawY > rect.height + lineHeight) continue;

				const worldY = row * lineHeight;
				const [rowFlow] = computeFlowField(flowOpts(rect.width * 0.5, worldY));
				const rowShift = rowFlow * currentTheme.canvas.rowShift * charWidth;

				const startCol =
					Math.floor(scroll / charWidth) -
					Math.ceil((scrollRemainder - rowShift + rowShiftPad) / charWidth) -
					2;
				let col = startCol;

				while (true) {
					const worldX = col * charWidth;
					const drawX = worldX - scrollRemainder + rowShift;
					if (drawX > rect.width + charWidth) break;
					if (drawX >= -charWidth * 2) {
						let sampleX = worldX + scroll;
						let sampleY = worldY + idleTime * 9;

						const warpScale =
							currentTheme.canvas.idleSampleWarp +
							currentTheme.canvas.scrollSampleWarp * warpCurrent;

						const [warpX, warpY] = computeSampleWarp({
							...flowOpts(worldX, worldY),
							scroll,
							warpIntensity: Math.max(warpCurrent, 0.35),
						});
						sampleX += warpX * warpScale * charWidth;
						sampleY += warpY * warpScale * charWidth;

						[sampleX, sampleY] = logoMask.deflectSample(
							drawX + charWidth * 0.5,
							drawY + lineHeight * 0.5,
							sampleX,
							sampleY,
							currentTheme.canvas.logoDeflectStrength,
							currentTheme.canvas.logoDeflectRadius,
						);

						const character = sampleTextField(textField, sampleX, sampleY);
						const inLogo = logoMask.isInside(
							drawX + charWidth * 0.5,
							drawY + lineHeight * 0.5,
						);

						if (!inLogo && character.trim() !== "") {
							ctx.fillText(character, drawX, drawY);
						}
					}
					col += 1;
				}
			}

			ctx.restore();
			scheduleFrame();
		};

		const onWheel = (event: WheelEvent) => {
			if (!interactive || isInteractiveTarget(event.target)) return;
			event.preventDefault();
			const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
			bumpWarp(delta);
			if (!textField) return;
			scrollTarget = clampScroll(
				scrollTarget - delta,
				getFieldScrollWidth(textField),
				canvas.getBoundingClientRect().width,
			);
			scheduleFrame();
		};

		const onPointerDown = (event: PointerEvent) => {
			if (!interactive || isInteractiveTarget(event.target)) return;
			event.preventDefault();
			activePointerId = event.pointerId;
			pointerStartX = event.clientX;
			scrollAtPointerDown = scrollTarget;
			canvas.setPointerCapture(event.pointerId);
			document.documentElement.classList.add("warp-dragging");
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!interactive || activePointerId !== event.pointerId || !textField) return;
			const delta = event.clientX - pointerStartX;
			bumpWarp(delta - (scrollTarget - scrollAtPointerDown));
			scrollTarget = clampScroll(
				scrollAtPointerDown + delta,
				getFieldScrollWidth(textField),
				canvas.getBoundingClientRect().width,
			);
			scheduleFrame();
		};

		const endPointer = (event: PointerEvent) => {
			if (activePointerId !== event.pointerId) return;
			activePointerId = null;
			try {
				canvas.releasePointerCapture(event.pointerId);
			} catch {
				// pointer may already be released
			}
			document.documentElement.classList.remove("warp-dragging");
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (!interactive || isInteractiveTarget(event.target) || !textField) return;
			const step = metrics?.charWidth ? metrics.charWidth * 24 : 120;
			if (event.key === "ArrowRight") {
				bumpWarp(step * 0.35);
				scrollTarget -= step;
			}
			if (event.key === "ArrowLeft") {
				bumpWarp(step * 0.35);
				scrollTarget += step;
			}
			scrollTarget = clampScroll(
				scrollTarget,
				getFieldScrollWidth(textField),
				canvas.getBoundingClientRect().width,
			);
			scheduleFrame();
		};

		const onReducedMotionChange = () => {
			isReducedMotion = reducedMotion.matches;
			scheduleFrame();
		};

		const onMobileChange = () => {
			isMobile = mobileQuery.matches;
			lastFrameTime = 0;
			resize();
			scheduleFrame();
		};

		const onResize = () => {
			resize();
			logoViewportKey = "";
			scheduleFrame();
		};

		let cancelled = false;

		const bootstrap = async () => {
			resize();
			scheduleFrame();

			const fontSize = themeRef.current.canvas.fontSize;
			try {
				await document.fonts.ready;
				await Promise.all([
					document.fonts.load(`${fontSize}px ${CANVAS_TEXT_FONT}`),
					document.fonts.load(`${fontSize}px ${GRID_FONT}`),
				]);
			} catch (error) {
				console.warn("Font preload failed, using fallbacks.", error);
			}
			if (cancelled) return;
			resize();
			scheduleFrame();
		};

		void loadLogoImage()
			.then((image) => {
				logoImage = image;
				logoReady = true;
				logoViewportKey = "";
				scheduleFrame();
			})
			.catch((error) => {
				console.error(error);
				scheduleFrame();
			});

		void bootstrap();
		reducedMotion.addEventListener("change", onReducedMotionChange);
		mobileQuery.addEventListener("change", onMobileChange);
		window.addEventListener("resize", onResize);
		window.addEventListener("wheel", onWheel, { passive: false });
		window.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", endPointer);
		window.addEventListener("pointercancel", endPointer);
		window.addEventListener("keydown", onKeyDown);
		scheduleFrame();

		return () => {
			cancelled = true;
			if (rafId !== null) cancelAnimationFrame(rafId);
			reducedMotion.removeEventListener("change", onReducedMotionChange);
			mobileQuery.removeEventListener("change", onMobileChange);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("wheel", onWheel);
			window.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", endPointer);
			window.removeEventListener("pointercancel", endPointer);
			window.removeEventListener("keydown", onKeyDown);
			document.documentElement.classList.remove("warp-dragging");
		};
	}, [interactive]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={className ?? "warp-canvas"}
		/>
	);
}
