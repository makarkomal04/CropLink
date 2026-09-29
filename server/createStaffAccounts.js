/**
 * Script to create staff accounts (warehouse, shipment_manager, delivery_boy)
 * Run with: node createStaffAccounts.js
 * 
 * Make sure your server is running (npm run dev in /server)
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const staffAccounts = [
    {
        name: 'Warehouse Staff 1',
        email: 'warehouse@croplink.com',
        password: 'warehouse123',
        role: 'warehouse'
    },
    {
        name: 'Shipment Manager',
        email: 'shipment@croplink.com',
        password: 'shipment123',
        role: 'shipment_manager'
    },
    {
        name: 'Delivery Boy 1',
        email: 'delivery1@croplink.com',
        password: 'delivery123',
        role: 'delivery_boy'
    },
    {
        name: 'Delivery Boy 2',
        email: 'delivery2@croplink.com',
        password: 'delivery123',
        role: 'delivery_boy'
    }
];

async function createAccounts() {
    console.log('Creating staff accounts...\n');

    for (const account of staffAccounts) {
        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, account);
            console.log(`✓ Created: ${account.email} [${account.role}]`);
            console.log(`  Token: ${response.data.token.substring(0, 30)}...`);
        } catch (error) {
            if (error.response?.data?.message === 'User already exists') {
                console.log(`⚠ Already exists: ${account.email}`);
            } else {
                console.log(`✗ Failed: ${account.email} - ${error.response?.data?.message}`);
            }
        }
    }

    console.log('\nDone! Login with these credentials to test each dashboard.');
    console.log('\nLogin URLs:');
    console.log('  Warehouse:         http://localhost:5173/login → goes to /admin/warehouse');
    console.log('  Shipment Manager:  http://localhost:5173/login → goes to /shipment');
    console.log('  Delivery Boy:      http://localhost:5173/login → goes to /delivery');
}

createAccounts();
