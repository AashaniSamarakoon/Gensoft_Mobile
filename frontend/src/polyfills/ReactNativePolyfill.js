/**
 * React Native polyfill for missing modules
 */
import { Platform as PlatformPolyfill } from './PlatformGlobal.js';

// Export all the common React Native modules with polyfills
export const Platform = PlatformPolyfill;

export const Dimensions = {
  get: (dim) => {
    if (dim === 'window') {
      return {
        width: typeof window !== 'undefined' ? window.innerWidth : 390,
        height: typeof window !== 'undefined' ? window.innerHeight : 844,
        scale: 1,
        fontScale: 1,
      };
    }
    return {
      width: typeof window !== 'undefined' ? window.screen?.width || 390 : 390,
      height: typeof window !== 'undefined' ? window.screen?.height || 844 : 844,
      scale: 1,
      fontScale: 1,
    };
  },
  addEventListener: () => {},
  removeEventListener: () => {},
};

export const StyleSheet = {
  create: (styles) => styles,
  hairlineWidth: 0.5,
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
};

// Re-export everything that should be available from react-native
export * from 'react-native-web';