import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import { Box, IconButton } from '@mui/material';

// ----------------------------------------------------------------------

export const IconButtonAnimate = forwardRef(
  ({ children, size = 'medium', sx, ...other }, ref) => (
    <Box
      sx={{
        display: 'inline-flex !important',
        transition: 'transform 0.15s ease-in-out',
        '&:hover': {
          transform: 'scale(1.09)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
    >
      <IconButton ref={ref} size={size} sx={sx} {...other}>
        {children}
      </IconButton>
    </Box>
  )
);

IconButtonAnimate.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  sx: PropTypes.object,
};

export function MotionContainer({ children, ...other }) {
  return <Box {...other}>{children}</Box>;
}

MotionContainer.propTypes = {
  children: PropTypes.node,
};
