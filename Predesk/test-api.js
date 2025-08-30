#!/usr/bin/env node

/**
 * Simple API Test Script
 * Run this to test if your Portfolio API is working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ENDPOINTS = [
    '/health',
    '/api/profile',
    '/api/projects',
    '/api/skills',
    '/api/search?q=javascript'
];

function testEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        endpoint,
                        status: res.statusCode,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        endpoint,
                        status: res.statusCode,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        data: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject({
                endpoint,
                error: error.message
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject({
                endpoint,
                error: 'Request timeout'
            });
        });
    });
}

async function runTests() {
    console.log('🚀 Testing Portfolio API...\n');
    console.log(`Base URL: ${BASE_URL}\n`);
    
    const results = [];
    
    for (const endpoint of ENDPOINTS) {
        try {
            console.log(`Testing ${endpoint}...`);
            const result = await testEndpoint(endpoint);
            results.push(result);
            
            if (result.success) {
                console.log(`✅ ${endpoint} - Status: ${result.status}`);
            } else {
                console.log(`❌ ${endpoint} - Status: ${result.status}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint} - Error: ${error.error}`);
            results.push(error);
        }
        
        console.log('');
    }
    
    // Summary
    console.log('📊 Test Results Summary:');
    console.log('========================');
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${results.length}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your API is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the details above.');
    }
    
    // Detailed results
    console.log('\n📋 Detailed Results:');
    console.log('==================');
    
    results.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.endpoint}`);
        if (result.success) {
            console.log(`   Status: ${result.status}`);
            if (result.data && typeof result.data === 'object') {
                if (result.data.message) {
                    console.log(`   Message: ${result.data.message}`);
                }
                if (result.data.total_results !== undefined) {
                    console.log(`   Results: ${result.data.total_results}`);
                }
            }
        } else {
            console.log(`   Status: ${result.status || 'N/A'}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
            if (result.data && result.data.error) {
                console.log(`   API Error: ${result.data.error}`);
            }
        }
    });
}

// Check if server is running
function checkServer() {
    return new Promise((resolve) => {
        const req = http.get(`${BASE_URL}/health`, (res) => {
            resolve(true);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    console.log('🔍 Checking if server is running...');
    
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('❌ Server is not running!');
        console.log('Please start the server first:');
        console.log('  npm start');
        console.log('  or');
        console.log('  npm run dev');
        console.log('\nThen run this test script again.');
        process.exit(1);
    }
    
    console.log('✅ Server is running!\n');
    
    await runTests();
}

// Run tests
main().catch(error => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
});
