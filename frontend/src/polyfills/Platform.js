// Platform polyfill for React Native compatibility
import { Platform as RNPlatform } from 'react-native';

// Ensure Platform exists with all required properties
const Platform = RNPlatform || {
  OS: 'android',
  select: (obj) => {
    if (obj.native) return obj.native;
    if (obj.android) return obj.android;
    if (obj.default) return obj.default;
    return obj.ios || obj.default || {};
  },
  isPad: false,
  isTVOS: false,
  isTV: false,
  Version: 30,
  constants: {},
};

export { Platform };
export default Platform;