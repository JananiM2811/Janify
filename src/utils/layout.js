import { useWindowDimensions } from 'react-native';

// Screen-size breakpoints shared by all screens:
// phone < 600 <= tablet < 900 <= laptop/desktop
export const WIDE_BREAKPOINT = 900;

export const useLayout = () => {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  let productColumns = 2;
  if (width >= 1400) productColumns = 5;
  else if (width >= 1100) productColumns = 4;
  else if (width >= 600) productColumns = 3;

  return { width, isWide, productColumns };
};

// Keeps forms / lists at a readable width on laptops (no effect on phones)
export const readableWidth = {
  width: '100%',
  maxWidth: 820,
  alignSelf: 'center',
};
