require('dotenv').config();
const axios = require('axios');

const API_URL = 'https://www.alphabot.app/api/auth/session';
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
            const user = response.data?.user || {}; // Menghindari error jika user tidak ada

            const filteredData = {
                user: {
                    email: user.email || "Tidak ditemukan",

             const filteredData = {
                address: {
                    address: user.address || "Tidak ditemukan",

                }
            };

            console.log("\n✅ Login Berhasil!");
            console.log("Response Data:", JSON.stringify(filteredData, null, 2));
        } else {
            console.log("\n⚠️ Login mungkin gagal. Status:", response.status);
        }

    } catch (error) {
        console.error("\n❌ Login Gagal:", error.response ? error.response.data : error.message);
    }
}

login();
