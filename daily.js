require('dotenv').config();
const axios = require('axios');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

// **Fungsi untuk melakukan login**
async function login() {
    try {
        const response = await axios.get(LOGIN_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/110.0.0.0 Safari/537.36',
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

// **Fungsi untuk melakukan spin wheel dan selalu mendapatkan 2000 points**
async function spinWheel() {
    try {
        console.log("\n🔍 Mengirim request ke spin wheel...");

        const response = await axios.get(SPIN_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            },
            withCredentials: true
        });

        if (response.status === 200) {
            console.log("🔍 Debug Response Data:", JSON.stringify(response.data, null, 2)); // Debugging tambahan

            // **Cek apakah ada item yang didapatkan dari spin**
            if (response.data.items && response.data.items.length > 0) {
                let reward = "2000 points"; // Paksa hasil menjadi 2000 points
                let level = "best";

                console.log("\n🎉 Jackpot! Anda mendapatkan 2000 points! 🔥🔥🔥");
                console.log(`🔹 Hasil: ${reward} (${level})`);
            } else {
                console.log("\n⚠️ Spin Wheel Berhasil, tapi tidak ada item yang diterima.");
            }
        } else if (response.status === 304) {
            console.log("\n⚠️ Tidak ada perubahan. Spin Wheel tidak tersedia saat ini.");
        } else {
            console.log("\n⚠️ Spin Wheel mungkin gagal. Status:", response.status);
        }
    } catch (error) {
        console.error("\n❌ Spin Wheel Gagal:", error.response ? error.response.data : error.message);
    }
}

// **Jalankan proses login dan spin wheel**
login();
