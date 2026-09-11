import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
// rtl
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
// emotion
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
// @mui
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

ThemeRtlLayout.propTypes = {
  children: PropTypes.node,
};

export default function ThemeRtlLayout({ children }) {
  const theme = useTheme();

  useEffect(() => {
    document.dir = theme.direction;
  }, [theme.direction]);

  const cacheRtl = useMemo(
    () =>
      createCache({
        key: 'rtl',
        prepend: true,
        stylisPlugins: [prefixer, rtlPlugin],
      }),
    []
  );

  if (theme.direction === 'rtl') {
    return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
  }

  return <>{children}</>;
}
