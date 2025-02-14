require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

const API_URL = 'https://www.alphabot.app/api/platformAirdrops/';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = new ethers.Wallet(PRIVATE_KEY);

async function login() {
    try {
        const message = "Login to Alphabot";
        const signature = await WALLET.signMessage(message);

        const response = await axios.post(API_URL, {
            address: WALLET.address,
            signature: signature
        });

        console.log('Login Success:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

login();
