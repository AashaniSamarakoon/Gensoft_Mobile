/**
 * Global Platform polyfill for React Native compatibility
 * This file provides a Platform object that works across all React Native environments
 */

// Define Platform object with all required properties
const Platform = {
  OS: 'android', // Default to android for mobile
  Version: 30,
  isPad: false,
  isTVOS: false,
  isTV: false,
  constants: {},
  
  select: function(obj) {
    if (!obj) return undefined;
    
    // Priority order: native > android > ios > default
    if (obj.native !== undefined) return obj.native;
    if (obj.android !== undefined && this.OS === 'android') return obj.android;
    if (obj.ios !== undefined && this.OS === 'ios') return obj.ios;
    if (obj.default !== undefined) return obj.default;
    
    // Fallback to first available value
    return obj.android || obj.ios || obj.default || undefined;
  }
};

// Make Platform globally available
if (typeof global !== 'undefined') {
  global.Platform = Platform;
}

if (typeof window !== 'undefined') {
  window.Platform = Platform;
}

export { Platform };
export default Platform;