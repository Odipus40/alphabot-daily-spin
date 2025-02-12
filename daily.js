require('dotenv').config();
const axios = require('axios');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/wheel';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

// Fungsi untuk melakukan login
async function login() {
    try {
        const response = await axios.get(LOGIN_API, {
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
            await spinWheel(); // Panggil fungsi spin wheel setelah login
        } else {
            console.log("\n⚠️ Login mungkin gagal. Status:", response.status);
        }
    } catch (error) {
        console.error("\n❌ Login Gagal:", error.response ? error.response.data : error.message);
    }
}

// Fungsi untuk melakukan spin wheel dan mencari 2000 points
async function spinWheel() {
    try {
    const response = await axios.get(API_URL, {
        headers: {
            'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        },
        withCredentials: true
    });

    if (response.status === 200) {
        console.log("✅ Spin Wheel Berhasil!");
    } else if (response.status === 304) {
        console.log("⚠️ Spin Wheel tidak berubah (304 Not Modified).");
    } else {
        console.log(`⚠️ Status tidak diketahui: ${response.status}`);
    }
} catch (error) {
    console.error("\n❌ Spin Wheel Gagal:", error.response?.data || error.message);
}
// Jalankan proses login dan spin wheel
login();
