// Platform polyfill for React Native Web compatibility
export const Platform = {
  OS: 'android', // Default to android for mobile Expo Go
  select: (obj) => {
    if (obj.native) return obj.native;
    if (obj.android) return obj.android;
    if (obj.default) return obj.default;
    return obj.ios || obj.default || {};
  },
  isPad: false,
  isTVOS: false,
  isTV: false,
  Version: 30, // Default Android API level
  constants: {},
};