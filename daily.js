require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://www.alphabot.app/api/auth/session';
const SPIN_URL = 'https://www.alphabot.app/api/platformAirdrops/wheel';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

async function login() {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            },
            withCredentials: true
        });

        if (response.status === 200) {
            console.log("\n✅ Login Berhasil!");
            await spinWheel(); // Jalankan spin setelah login berhasil
        } else {
            console.log("\n⚠️ Login mungkin gagal. Status:", response.status);
        }

    } catch (error) {
        console.error("\n❌ Login Gagal:", error.response ? error.response.data : error.message);
    }
}

async function spinWheel() {
    try {
        console.log("🔍 Debug: Mengirim request ke spin wheel...");

        const response = await axios.get(SPIN_URL, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            },
            withCredentials: true
        });

        if (response.status === 200) {
            console.log("✅ Spin Wheel Berhasil!");
            console.log("🔹 Hasil:", JSON.stringify(response.data, null, 2));
        } else {
            console.log(`⚠️ Spin mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("❌ Spin Wheel Gagal:");
        if (error.response) {
            console.error("🔹 Status Code:", error.response.status);
            console.error("🔹 Response Data:", JSON.stringify(error.response.data, null, 2));
            console.error("🔹 Headers:", JSON.stringify(error.response.headers, null, 2));
        } else if (error.request) {
            console.error("❌ Tidak ada respon dari server.");
            console.error("🔹 Request Data:", error.request);
        } else {
            console.error("❌ Error:", error.message);
        }
    }
}

