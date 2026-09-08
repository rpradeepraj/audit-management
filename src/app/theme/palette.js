import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// SETUP COLORS

const GREY = {
  main: '#454F5B',
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
  500_8: alpha('#919EAB', 0.08),
  500_12: alpha('#919EAB', 0.12),
  500_16: alpha('#919EAB', 0.16),
  500_24: alpha('#919EAB', 0.24),
  500_32: alpha('#919EAB', 0.32),
  500_48: alpha('#919EAB', 0.48),
  500_56: alpha('#919EAB', 0.56),
  500_80: alpha('#919EAB', 0.8),
};

const PRIMARY_GREEN = {
  lighter: '#C8FACD',
  light: '#5BE584',
  main: '#008081',
  dark: '#007B55',
  darker: '#005249',
  contrastText: '#FFFFFF',
};

const PRIMARY = {
  lighter: '#C8FACD',
  light: '#6CC9D1',
  main: '#04919d',
  dark: '#036F79',
  darker: '#024E55',
  contrastText: '#FFFFFF',
};

const SECONDARY = {
  lighter: '#FFE8CC',
  light: '#F4B740',
  main: '#D88212',
  dark: '#A25E00',
  darker: '#663C00',
  contrastText: '#FFFFFF',
};

const INFO = {
  lighter: '#CAFDF5',
  light: '#61F3F3',
  main: '#1890FF',
  dark: '#006C9C',
  darker: '#003768',
  contrastText: '#FFFFFF',
};

const SUCCESS = {
  lighter: '#D8FBDE',
  light: '#86E8AB',
  main: '#54D62C',
  dark: '#1B806A',
  darker: '#0A5554',
  contrastText: '#FFFFFF',
};

const WARNING = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#FF5630',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#FFFFFF',
};

const greyText = {
  lighter: '#FFE7D9',
  light: '#FFA48D',
  main: '#FF4842',
  dark: '#B72136',
  darker: '#7A0C2E',
};
const GREY_BTN = {
  main: '#637381',
  // dark: '#637381',
  // lighter: '#637381',
  // light: '#637381',
  // main: '#637381',
  // dark: '#637381',
  // darker: '#637381',
  // contrastText: '#637381',
}
const COMMON = {
  common: { black: '#000000', white: '#FFFFFF' },
  primary: PRIMARY,
  secondary: SECONDARY,
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  buttongrey: GREY_BTN,
  divider: alpha(GREY[500], 0.24),
  alternative: PRIMARY_GREEN,
  action: {
    hover: '#BFE4E8',
    selected: alpha(GREY[500], 0.16),
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
    tableRowHover: 'red',
  },
};

const CHART_COLORS = {
  violet: ['#826AF9', '#9E86FF', '#D0AEFF', '#F7D2FF'],
  blue: ['#2D99FF', '#83CFFF', '#A5F3FF', '#CCFAFF'],
  green: ['#2CD9C5', '#60F1C8', '#A4F7CC', '#C0F2DC'],
  yellow: ['#FFE700', '#FFEF5A', '#FFF7AE', '#FFF3D6'],
  red: ['#FF6C40', '#FF8F6D', '#FFBD98', '#FFF2D4'],
};

export default function palette(themeMode) {
  const light = {
    ...COMMON,
    mode: 'light',
    text: {
      primaryTitle: PRIMARY.main,
      secondaryTitle: SECONDARY.main,
      primary: GREY[800],
      secondary: GREY[600],
      disabled: GREY[500],
      alternative: PRIMARY_GREEN.main,
    },
    background: { paper: '#FFFFFF', default: '#FFFFFF', neutral: GREY[200], success: SUCCESS.main },
    action: {
      ...COMMON.action,
      active: GREY[600],
    },
  };

  const dark = {
    ...COMMON,
    mode: 'dark',
    text: {
      primary: '#FFFFFF',
      secondary: GREY[500],
      disabled: GREY[600],
      alternative: PRIMARY_GREEN.main,

    },
    background: {
      paper: GREY[800],
      default: GREY[900],
      neutral: alpha(GREY[500], 0.16),
    },
    action: {
      ...COMMON.action,
      active: GREY[500],
    },
  };

  return themeMode === 'light' ? light : dark;
}
