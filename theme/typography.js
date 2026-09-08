// ----------------------------------------------------------------------

import { fontSize } from "@mui/system";

export function remToPx(value) {
  return Math.round(parseFloat(value) * 16);
}

export function pxToRem(value) {
  return `${value / 16}rem`;
}

export function responsiveFontSizes({ sm, md, lg }) {
  return {
    '@media (min-width:600px)': {
      fontSize: pxToRem(sm),
    },
    '@media (min-width:900px)': {
      fontSize: pxToRem(md),
    },
    '@media (min-width:1200px)': {
      fontSize: pxToRem(lg),
    },
  };
}

// ----------------------------------------------------------------------

const FONT_PRIMARY = 'Source Sans Pro'; // Google Font
// const FONT_SECONDARY = 'CircularStd, sans-serif'; // Local Font

const typography = {
  fontFamily: FONT_PRIMARY,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: {
    fontWeight: 700,
    lineHeight: 80 / 64,
    fontSize: pxToRem(40),
    letterSpacing: 2,
    ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }),
  },
  h2: {
    fontWeight: 700,
    lineHeight: 64 / 48,
    fontSize: pxToRem(32),
    ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
  },
  h3: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ sm: 24, md: 26, lg: 28 }),
  },
  h5: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(24),
    ...responsiveFontSizes({ sm: 20, md: 22, lg: 24 }),
  },
  h6: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(22),
    ...responsiveFontSizes({ sm: 18, md: 20, lg: 22 }),
  },
  h7: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ sm: 16, md: 18, lg: 20 }),
  },
  h8: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 15, md: 17, lg: 18 }),
  },
  h9: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    ...responsiveFontSizes({ sm: 14, md: 15, lg: 16 }),
  },
  primaryClr: {
    color: '#04919d', 
  },
  secondaryClr: {
    color: '#D88212', 
  },
  primaryHeading: {
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    color: '#00AB55', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  primaryHeading1: {
    fontSize: pxToRem(14),
    color: '#00AB55', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  secondaryHeading: {
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    color: '#D88212', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  secondaryHeading1: {
    fontSize: pxToRem(14),
    color: '#D88212', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  primaryTitle: {
    lineHeight: 2,
    fontSize: pxToRem(14),
    color: '#04919d', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  
  primarySubtitle: {
    fontSize: pxToRem(14),
    color: '#04919d', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  primarySubtitle1: {
    fontSize: pxToRem(14),
    color: '#04919d', 
    fontName: 'Source Sans Pro', 
  },
  secondaryTitle: {
    lineHeight: 2,
    fontSize: pxToRem(16),
    color: '#D88212', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  secondaryTitleOverflow: {
    lineHeight: 2,
    fontSize: pxToRem(16),
    color: '#D88212', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold', 
    maxWidth: '800px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flow',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    textAlign: 'left',
  },
  secondaryTitle1: {
    fontSize: pxToRem(14),
    color: '#D88212', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  secondaryTitle2: {
    fontSize: pxToRem(12),
    color: '#D88212', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  subtitle1: {
    lineHeight: 2,
    fontSize: pxToRem(16),
    color: '#04919d', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  subtitle2Light: {
    color: '#637381',
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  subtitle3: {
    lineHeight: 0.5,
    fontSize: pxToRem(12),
    color: '#464647', 
    fontName: 'Source Sans Pro', 
  },  
  subtitle4: {
    fontWeight: 300,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
    display: 'block',
    color: '#464647', 
  },
  subtitle5: {
    lineHeight: 1,
    fontSize: pxToRem(12),
    color: '#04919d', 
    fontName: 'Source Sans Pro', 
    fontWeight: 'bold',
  }, 
  subtitle6: {
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
    color: '#04919d', 
  },   
  subtitle7: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  subtitle8: {
    fontWeight: 600,
    lineHeight: 2,
    fontSize: pxToRem(11),
  },
  subtitle9: {
    display: 'block',
    lineHeight: 22 / 12,
    fontSize: pxToRem(12),
    fontWeight: 'bold',
    fontFamily: 'Source Sans Pro',
    textTransform: 'capitalize',
  },
  specMenu: {
    fontFamily: 'Source Sans Pro', 
    fontWeight: '400',
    paddingLeft: '4px',
      fontSize: '14px',
  },
  body1: {
    lineHeight: 1.5,
    fontSize: pxToRem(16),
  },
  body2: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  body3: {
    lineHeight: 22 / 13,
    fontSize: '0.875rem',
    color: 'text.secondary'
  },
  body4: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(10),
    color: 'text.secondary'
  },
  body5: {
    fontSize: pxToRem(12),
    color: 'text.secondary'
  },

  body6: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(11),
    color: 'text.secondary'
  },
  body7: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(10),
    color: 'text.secondary'
  },
  body8: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(9),
    color: 'text.secondary'
  },
  body9: {
    fontSize: pxToRem(14),
    color: 'text.secondary'
  },
  bodyTextPrimary: {
    lineHeight: 22 / 13,
    fontSize: "0.8rem",
    color: 'primary',
    display: 'block',
    whiteSpace: 'nowrap'
  },
  bodyTextSecondary: {
    lineHeight: 22 / 13,
    fontSize: "0.8rem",
    display: 'block',
    color: '#637381',
    whiteSpace: 'nowrap',
    fontWeight: 'normal',
  },  
  shortName: {
    maxWidth: '80px',
    minWidth: '80px',
    overflow: 'hidden',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    display: 'flow',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    textAlign: 'left',
  },
  mediumShortName: {
    maxWidth: '160px',
    minWidth: '160px',
    overflow: 'hidden',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    display: 'flow',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    textAlign: 'left',
  },
  largeName: {
    maxWidth: '220px',
    minWidth: '220px',
    overflow: 'hidden',
    fontSize: '14px',
    textOverflow: 'ellipsis',
    display: 'flow',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    textAlign: 'left',
  },
  body10: {
    lineHeight: 22 / 13,
    fontSize: pxToRem(13),
    color: '#637381'
  },
  body11: {
    fontSize: pxToRem(13),
    color: '#637381',
    width: '120px',
    textOverflow: 'ellipsis'
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  captionEllipsis: {
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    width: '150px',
    marginBottom: '0px !important',
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: 700,
    lineHeight: 24 / 14,
    fontSize: pxToRem(14),
    textTransform: 'capitalize',
  },
  title: {
    fontFamily: 'Avenir LT Std',
    fontWeight: 900,
    fontSize: '24px',
    lineHeight: 1.5,
    color: '#000000',
  },
  
  grayText: {
    fontSize: pxToRem(14),
    color: '#464647', 
    fontName: 'Source Sans Pro', 
  },
  formSubTitle: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
  },
  formFieldTitle: {
    lineHeight: 1.5,
    fontSize: pxToRem(14),
  },
  shotLabel: {   
    mt: 0.5,
    display: 'flex',
    alignItems: 'center',
    color: 'text.secondary',
    textTransform: 'upperCase',
    fontSize: pxToRem(10),
    fontWeight: 300,
    whiteSpace: 'nowrap',
  },
  gridHeading: {
    lineHeight: 2,
    fontSize: pxToRem(14),
    color: '#464647', 
    fontName: 'Source Sans Pro', 
  },
  gridValue: {
    lineHeight: 2,
    fontSize: pxToRem(14),
    color: '#000000', 
    fontName: 'Source Sans Pro',
  },
  textHeading1: {
    fontSize: pxToRem(14),
    color: '#637381', 
  },
  tableCell: {
    lineHeight: '1.5714285714285714',
    fontSize: '0.875rem',
    fontFamily: 'Source Sans Pro',
    fontWeight: 400,
    color: "text.secondary",
  },
};

export default typography;
