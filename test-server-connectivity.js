const http = require('http');

function testServerHealth() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '192.168.1.55',
            port: 3001,
            path: '/api/v1/auth/health',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('✅ Server is responding!');
                console.log('Status Code:', res.statusCode);
                console.log('Response:', data);
                resolve({ status: res.statusCode, data });
            });
        });

        req.on('error', (err) => {
            console.log('❌ Server connection failed:', err.message);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('❌ Server request timed out');
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.setTimeout(5000);
        req.end();
    });
}

async function main() {
    console.log('🔍 Testing NestJS server connectivity...');
    console.log('Server URL: http://192.168.1.55:3001/api/v1/auth/health');
    
    try {
        await testServerHealth();
        console.log('🎉 Server test passed! The app should be able to connect now.');
    } catch (error) {
        console.log('\n🚨 Server connectivity issue detected.');
        console.log('Please ensure the NestJS server is running with: npm run start:dev');
        console.log('Server should be accessible at: http://192.168.1.55:3001');
    }
}

main();