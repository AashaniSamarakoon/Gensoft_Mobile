// Quick test script to verify backend connectivity
import nestjsApiService from '../services/nestjsApiService';

export const testBackendConnection = async () => {
  console.log('🧪 Testing NestJS Backend Connection...');
  
  try {
    // Test 1: Ping
    console.log('1️⃣ Testing ping...');
    const pingResult = await nestjsApiService.ping();
    console.log('✅ Ping success:', pingResult);
    
    // Test 2: CORS
    console.log('2️⃣ Testing CORS...');
    const corsResult = await nestjsApiService.corsTest();
    console.log('✅ CORS success:', corsResult);
    
    // Test 3: Echo
    console.log('3️⃣ Testing echo...');
    const echoResult = await nestjsApiService.echo({ test: 'Hello from React Native!' });
    console.log('✅ Echo success:', echoResult);
    
    console.log('🎉 All backend tests passed!');
    return { success: true, message: 'Backend connection working perfectly!' };
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default testBackendConnection;