import PropTypes from 'prop-types';
import { forwardRef } from 'react';
// @mui
import { Box } from '@mui/material';
import { RefreshCw, X, Sun, Moon, Maximize, Minimize, Settings, Palette, Check } from 'lucide-react';

// ----------------------------------------------------------------------

const Iconify = forwardRef(({ icon, width = 20, sx, ...other }, ref) => {
  const getIcon = () => {
    switch (icon) {
      case 'ic:round-refresh':
      case 'eva:refresh-fill':
        return <RefreshCw size={width} />;
      case 'eva:close-fill':
      case 'ic:round-close':
        return <X size={width} />;
      case 'ic:sun':
        return <Sun size={width} />;
      case 'ic:moon':
        return <Moon size={width} />;
      case 'eva:expand-fill':
      case 'ic:round-fullscreen':
        return <Maximize size={width} />;
      case 'eva:collapse-fill':
      case 'ic:round-fullscreen-exit':
        return <Minimize size={width} />;
      case 'ic:setting':
        return <Settings size={width} />;
      case 'eva:color-palette-fill':
        return <Palette size={width} />;
      case 'eva:checkmark-fill':
        return <Check size={width} />;
      default:
        return <RefreshCw size={width} />;
    }
  };

  return (
    <Box
      ref={ref}
      component="span"
      className="component-iconify"
      sx={{
        width,
        height: width,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
      {...other}
    >
      {getIcon()}
    </Box>
  );
});

Iconify.propTypes = {
  sx: PropTypes.object,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

export default Iconify;
