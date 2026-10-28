import { scale, verticalScale, responsiveFont, TOUCH_TARGET } from '@utils/responsive';

export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#D1FAE5',
  accent: '#F59E0B',
  accentDark: '#D97706',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  success: '#10B981',
  successLight: '#ECFDF5',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: verticalScale(24),
  xl: verticalScale(32),
  xxl: verticalScale(48),
  xxxl: verticalScale(64),
};

export const borderRadius = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(24),
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: responsiveFont(12),
    sm: responsiveFont(14),
    md: responsiveFont(16),
    lg: responsiveFont(18),
    xl: responsiveFont(20),
    xxl: responsiveFont(24),
    xxxl: responsiveFont(32),
    display: responsiveFont(48, 1.15),
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 32,
    xxxl: 40,
    display: 48,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  touchTarget: TOUCH_TARGET,
  // OnePlus Nord 5 safe content width: full-bleed minus 2x page padding,
  // keeps cards inside the punch-hole / curved-edge safe zone.
  maxContentWidth: 560,
};

export type Theme = typeof theme;