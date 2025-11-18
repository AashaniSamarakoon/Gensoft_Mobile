// Test script to verify QR functionality
// Run this in your browser console when testing the mobile app

const testQRFunctionality = () => {
  console.log('🧪 Testing QR Scanner Functionality...');
  
  // Test QR Data (same as your terminal generates)
  const testQRData = 'eyJlbXBfaWQiOjEsImVtcF91bmFtZSI6ImRlbW91IiwiZW1wX3B3ZCI6IjEyMzQ1NiIsImVtcF9lbWFpbCI6ImRlbW9AZ21haWwuY29tIiwiZW1wX21vYmlsZV9ubyI6IjA3MTIzNDU2NzgifQ==';
  
  // Decode and verify
  try {
    const decoded = atob(testQRData);
    const employeeData = JSON.parse(decoded);
    
    console.log('✅ QR Data Successfully Decoded:');
    console.log('📋 Employee ID:', employeeData.emp_id);
    console.log('👤 Username:', employeeData.emp_uname);
    console.log('📧 Email:', employeeData.emp_email);
    console.log('📱 Mobile:', employeeData.emp_mobile_no);
    
    // Test company generation
    const domain = employeeData.emp_email.split('@')[1];
    let companyName = 'Logistics ERP';
    
    if (domain && domain !== 'gmail.com' && domain !== 'yahoo.com') {
      companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } else {
      companyName = `${employeeData.emp_uname.charAt(0).toUpperCase()}${employeeData.emp_uname.slice(1)} Logistics`;
    }
    
    console.log('🏢 Generated Company:', companyName);
    console.log('');
    console.log('🎯 Expected Flow:');
    console.log('1. QR Scanner detects this data');
    console.log('2. Saves employee to local user table');
    console.log('3. Creates company info');
    console.log('4. Updates AuthContext');
    console.log('5. Navigates to Dashboard');
    console.log('6. Shows dynamic company name in header');
    
    return { success: true, employeeData, companyName };
    
  } catch (error) {
    console.error('❌ QR Test Failed:', error);
    return { success: false, error: error.message };
  }
};

// Run test
const testResult = testQRFunctionality();
console.log('\n🏁 Test Result:', testResult.success ? 'PASSED ✅' : 'FAILED ❌');
