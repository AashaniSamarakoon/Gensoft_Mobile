console.log('Starting QR Data Test...');
const qrData = 'eyJlbXBfaWQiOjEsImVtcF91bmFtZSI6ImRlbW91IiwiZW1wX3B3ZCI6IjEyMzQ1NiIsImVtcF9lbWFpbCI6ImFzaGFuaXNhbWFyYWtvb24zNkBnbWFpbC5jb20iLCJlbXBfbW9iaWxlX25vIjoiMDcwMzEwMTI0NCJ9';

// Decode the QR data
const decodedData = Buffer.from(qrData, 'base64').toString('utf-8');
console.log('Decoded QR Data:', decodedData);

const parsedData = JSON.parse(decodedData);
console.log('Parsed QR Data:', parsedData);
console.log('Test completed successfully!');