require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');
require('colors');
const { displayHeader } = require('./helpers');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const POINTS_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/points';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

function getCurrentTime() {
    return moment().tz('Asia/Jakarta').format('HH:mm:ss');
}

function getCurrentDate() {
    return moment().tz('Asia/Jakarta').format('dddd, DD MMMM YYYY');
}

async function login() {
    console.log(`📅 Tanggal: ${getCurrentDate()}`);
    console.log(`🕒 Waktu: ${getCurrentTime()}`);

    try {
        console.log(`\n🔑 Memulai proses login...`);
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
        const response = await axios.post(SPIN_API, {}, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            }
        });

        if (response.status === 200) {
            const items = response.data?.items || [];
            let result = "Tidak diketahui";
            
            if (items.length > 0) {
                result = items.map(item => item.option).join(', ');
            }

            console.log(`\n🎡 Spin Wheel Berhasil!`);
            console.log(`🔹 Hasil: ${result}`);
            
            await getPoints();
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

// Fungsi utama untuk menjalankan bot secara otomatis setiap hari
async function startRoutine() {
    try {
        displayHeader();
        await login();
    } catch (error) {
        console.error("🚨 Terjadi error dalam eksekusi script:", error.message);
    }

    // Menampilkan waktu eksekusi berikutnya dalam format lengkap
    const nextRun = moment().tz('Asia/Jakarta').add(24, 'hours').format('dddd, DD MMMM YYYY [pukul] HH:mm:ss');
    console.log(`\n⏳ Menunggu 24 jam untuk menjalankan ulang pada: ${nextRun} WIB\n`);

    // Tunggu 24 jam sebelum menjalankan ulang
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));

    // Jalankan ulang
    await startRoutine();
}
