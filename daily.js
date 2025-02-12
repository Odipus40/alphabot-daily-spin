require('dotenv').config(); // Load variabel lingkungan dari .env
const axios = require('axios');

const API_URL = 'https://www.alphabot.app/api/platformAirdrops/';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
    console.error("Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

async function login() {
    try {
        const response = await axios.get(API_URL, {
    headers: {
        'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    },
    withCredentials: true
});

        const data = response.data.data;
        
        if (!data) {
            console.log("Data tidak ditemukan!");
            return;
        }

        console.log("\n=== Preview Data ===");
        console.log(`ID: ${data._id}`);
        console.log(`Platform Airdrop ID: ${data.platformAirdropId}`);
        console.log(`Rank: ${data.rank}`);
        console.log(`Total Points: ${data.totalPoints}`);
        console.log(`User ID: ${data.userId}`);

    } catch (error) {
        console.error("Login Gagal:", error.response ? error.response.data : error.message);
    }
}

login();
