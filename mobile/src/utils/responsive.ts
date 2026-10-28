import { Dimensions, PixelRatio } from 'react-native';

/**
 * Responsive helpers tuned for OnePlus Nord 5 as the reference device.
 *
 * Nord 5 specs (portrait):
 *  - Panel: 6.83" AMOLED, 1272 x 2800 px, ~450 ppi, ~19.8:9
 *  - CSS baseline: ~424 dp wide x ~933 dp tall (@ ~2.99x density)
 *  - Punch-hole camera + in-display fingerprint + gesture nav bar
 *
 * All scaling is proportional so smaller phones shrink gracefully and
 * tablets / landscape don't blow up.
 */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference: Nord 5 usable portrait area in dp
export const NORD5_WIDTH = 424;
export const NORD5_HEIGHT = 933;

const widthScale = SCREEN_WIDTH / NORD5_WIDTH;
const heightScale = SCREEN_HEIGHT / NORD5_HEIGHT;

export const isSmallDevice = SCREEN_WIDTH < 360;
export const isTallDevice = SCREEN_HEIGHT / SCREEN_WIDTH > 2.0; // Nord 5 ≈ 2.2
export const isTablet = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) >= 600;

/** Horizontal scaling (widths, paddings, margins, radii). */
export function scale(size: number): number {
  const s = isTablet ? Math.min(widthScale, 1.25) : widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(size * s));
}

/** Vertical scaling (heights, vertical padding). Clamped so tall screens don't stretch too much. */
export function verticalScale(size: number): number {
  const s = isTablet ? Math.min(heightScale, 1.25) : Math.min(heightScale, 1.15);
  return Math.round(PixelRatio.roundToNearestPixel(size * s));
}

/** Font scaling — gentler than full width scale, respects system font scale. */
export function responsiveFont(size: number, maxScale = 1.2): number {
  const fontScale = PixelRatio.getFontScale();
  const s = Math.min(Math.max(widthScale, 0.85), maxScale);
  return Math.round(size * s * Math.min(fontScale, 1.3));
}

/** Moderate scaling: mix of original + scaled, good for icons and radii. */
export function moderateScale(size: number, factor = 0.5): number {
  return Math.round(size + (scale(size) - size) * factor);
}

export const device = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice,
  isTallDevice,
  isTablet,
};

/** Minimum accessible touch target (Material: 48x48 dp). */
export const TOUCH_TARGET = 48;

/** Responsive card width for horizontal carousels: ~2 visible on phones, more on tablets. */
export function carouselCardWidth(visibleRatio = 0.52, gap = 12): number {
  if (isTablet) return Math.round(SCREEN_WIDTH * 0.32);
  return Math.round(SCREEN_WIDTH * visibleRatio - gap);
}
