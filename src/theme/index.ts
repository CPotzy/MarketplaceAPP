export const Colors = {
  light: {
    primary: '#1877F2', // Facebook blue
    secondary: '#42B72A',
    background: '#FFFFFF',
    surface: '#F0F2F5',
    text: '#050505',
    textSecondary: '#65676B',
    border: '#CCD0D5',
    error: '#E41E3F',
    success: '#42B72A',
    warning: '#F7B928',
    priceUp: '#E41E3F',
    priceDown: '#42B72A',
    priceNeutral: '#65676B',
  },
  dark: {
    primary: '#2D88FF',
    secondary: '#42B72A',
    background: '#18191A',
    surface: '#242526',
    text: '#E4E6EB',
    textSecondary: '#B0B3B8',
    border: '#3E4042',
    error: '#F02849',
    success: '#42B72A',
    warning: '#F7B928',
    priceUp: '#F02849',
    priceDown: '#42B72A',
    priceNeutral: '#B0B3B8',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as '400',
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as '600',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as '400',
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as '400',
    lineHeight: 16,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};
