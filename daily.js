require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const POINTS_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/points';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

function getCurrentTime() {
    return moment().tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm:ss');
}

async function login() {
    try {
        console.log(`\n🕒 [${getCurrentTime()}] Memulai proses login...`);
        const response = await axios.get(LOGIN_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            }
        });

        if (response.status === 200) {
            console.log("✅ Login Berhasil!");
            console.log("🔄 Memulai claim daily spin wheel...");
            await spinWheel();
        } else {
            console.log("⚠️ Login mungkin gagal. Status:", response.status);
        }
    } catch (error) {
        console.error("❌ Login Gagal:", error.response ? error.response.data : error.message);
    }
}

async function spinWheel() {
    try {
        const response = await axios.get(SPIN_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            }
        });

        if (response.status === 200) {
            const items = response.data?.items || [];
            const jackpot = items.find(item => item.option.includes("2000 points") && item.level === "best");

            if (jackpot) {
                console.log("\n🎉 Jackpot! Anda mendapatkan 2000 points! 🔥🔥🔥");
                console.log("🔹 Hasil: 2000 points (best)");
            } else {
                console.log("\n🎡 Spin Wheel Berhasil!");
            }
            
            await getPoints();
        } else if (response.status === 200) {
            console.log("⚠️ Tidak ada perubahan. Spin Wheel tidak tersedia saat ini.");
        } else {
            console.log("⚠️ Spin Wheel mungkin gagal. Status:", response.status);
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error("❌ Error: Anda sudah melakukan daily spin wheel hari ini. Coba lagi besok!");
        } else {
            console.error("❌ Spin Wheel Gagal:", error.response ? error.response.data : error.message);
        }
    }
}

async function getPoints() {
    try {
        const response = await axios.get(POINTS_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            }
        });

        if (response.status === 200) {
            const { points, rank } = response.data;
            console.log(`🏆 Total Points: ${points}`);
            console.log(`📊 Rank Anda: ${rank}`);
        } else {
            console.log("⚠️ Gagal mendapatkan informasi poin. Status:", response.status);
        }
    } catch (error) {
        console.error("❌ Gagal mendapatkan data poin:", error.response ? error.response.data : error.message);
    }
}

async function startLoop() {
    while (true) {
        await login();
        console.log("\n🕒 Menunggu 24 jam untuk menjalankan ulang...");
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000)); // Tunggu 24 jam
    }
}

startLoop();
