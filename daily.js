require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

const API_URL = 'https://www.alphabot.app/api/platformAirdrops/';

async function login() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const message = "Login to Alphabot";
        const signature = await signer.signMessage(message);

        const response = await axios.post(API_URL, {
            address: address,
            signature: signature
        });

        console.log('Login Success:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

login();
