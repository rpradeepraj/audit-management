import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

const Scrollbar = forwardRef(({ children, sx, ...other }, ref) => (
  <Box
    ref={ref}
    sx={{
      flexGrow: 1,
      height: '100%',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        width: 6,
        height: 6,
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(145, 158, 171, 0.32)',
        borderRadius: 3,
        '&:hover': {
          backgroundColor: 'rgba(145, 158, 171, 0.48)',
        },
      },
      ...sx,
    }}
    {...other}
  >
    {children}
  </Box>
));

Scrollbar.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default Scrollbar;
