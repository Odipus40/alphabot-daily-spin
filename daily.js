require('dotenv').config();
const axios = require('axios');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

// Fungsi untuk mendapatkan tanggal dan waktu saat ini
function getCurrentDateTime() {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

// Fungsi untuk melakukan login
async function login() {
    try {
        console.log(`\n⏳ Menjalankan daily spin pada: ${getCurrentDateTime()}`);
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
            console.log("🔄 Memulai claim daily spin wheel...");
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
            const items = response.data?.items || [];
            const jackpot = items.find(item => item.option.includes("2000 points") && item.level === "best");

            if (jackpot) {
                console.log("\n🎉 Jackpot! Anda mendapatkan 2000 points! 🔥🔥🔥");
                console.log("🔹 Hasil: 2000 points (best)");
            } else {
                console.log("\n🎡 Spin Wheel Berhasil, tapi tidak mendapatkan jackpot.");
            }
        } else if (response.status === 304) {
            console.log("\n⚠️ Tidak ada perubahan. Spin Wheel tidak tersedia saat ini.");
        } else {
            console.log("\n⚠️ Spin Wheel mungkin gagal. Status:", response.status);
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error("\n❌ Error: Anda sudah melakukan daily spin wheel hari ini. Coba lagi besok!");
        } else {
            console.error("\n❌ Spin Wheel Gagal:", error.response ? error.response.data : error.message);
        }
    }
}

// Loop agar script berjalan otomatis setiap 24 jam
async function startLoop() {
    while (true) {
        await login();
        console.log("\n🕒 Menunggu 24 jam untuk menjalankan ulang...");
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000)); // Tunggu 24 jam
    }
}

startLoop();
