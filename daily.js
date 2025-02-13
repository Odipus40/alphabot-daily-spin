require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');
require('colors');
const { displayHeader } = require('./helpers');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const POINTS_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/points';
const SESSION_TOKEN = process.env.SESSION_TOKEN;

const RESET_HOUR = 7; // Alphabot reset daily spin jam 07:00 WIB
const RETRY_INTERVAL = 60 * 60 * 1000; // Coba lagi dalam 1 jam jika spin gagal sebelum reset

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

// Fungsi untuk mendapatkan timestamp lengkap
function getCurrentTimestamp() {
    return moment().tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm:ss');
}

// Cek apakah saat ini sebelum jam reset
function isBeforeReset() {
    return moment().tz('Asia/Jakarta').hour() < RESET_HOUR;
}

async function login() {
    console.log(`🕒 [${getCurrentTimestamp()}] Memulai proses login...`);

    try {
        const response = await axios.get(LOGIN_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            }
        });

        if (response.status === 200) {
            console.log(`✅ [${getCurrentTimestamp()}] Login Berhasil!`);
            console.log(`🔄 [${getCurrentTimestamp()}] Memulai claim daily spin wheel...`);
            await spinWheel();
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Login mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentTimestamp()}] Login Gagal:`, error.response?.data || error.message);
        process.exit(1);
    }
}

async function spinWheel() {
    try {
        console.log(`🎡 [${getCurrentTimestamp()}] Melakukan request daily spin...`);
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
            let result = items.length > 0 ? items.map(item => item.option).join(', ') : "Tidak diketahui";

            console.log(`🎉 [${getCurrentTimestamp()}] Spin Wheel Berhasil!`);
            console.log(`🔹 [${getCurrentTimestamp()}] Hasil: ${result}`);
            return;
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Spin Wheel mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            if (isBeforeReset()) {
                console.warn(`🚫 [${getCurrentTimestamp()}] Spin gagal, tapi belum reset harian. Coba lagi dalam 1 jam.`);
                setTimeout(spinWheel, RETRY_INTERVAL);
                return;
            } else {
                console.warn(`🚫 [${getCurrentTimestamp()}] Anda sudah melakukan daily spin hari ini. Coba lagi setelah reset jam 07:00 WIB.`);
            }
        } else {
            console.error(`❌ [${getCurrentTimestamp()}] Spin Wheel Gagal:`, error.response?.data || error.message);
        }
    }

    await getPoints();
}

async function getPoints() {
    try {
        console.log(`💰 [${getCurrentTimestamp()}] Mengambil data total poin...`);
        const response = await axios.get(POINTS_API, {
            headers: {
                'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                'User-Agent': 'Mozilla/5.0',
                'Referer': 'https://www.alphabot.app/boost',
                'Origin': 'https://www.alphabot.app'
            }
        });

        if (response.status === 200 && response.data?.points !== undefined && response.data?.rank !== undefined) {
            console.log(`🏆 [${getCurrentTimestamp()}] Total Points: ${response.data.points}`);
            console.log(`📊 [${getCurrentTimestamp()}] Rank Anda: ${response.data.rank}`);
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Gagal mendapatkan informasi poin. Data tidak valid.`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentTimestamp()}] Gagal mendapatkan data poin:`, error.response?.data || error.message);
    }
}

async function startRoutine() {
    try {
        displayHeader();
        await login();
    } catch (error) {
        console.error(`🚨 [${getCurrentTimestamp()}] Terjadi error dalam eksekusi script:`, error);
    }

    const nextRun = moment().tz('Asia/Jakarta').add(24, 'hours').format('DD/MM/YYYY, HH:mm:ss');
    console.log(`\n⏳ [${getCurrentTimestamp()}] Menunggu 24 jam untuk menjalankan ulang pada: ${nextRun} WIB\n`);

    await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));

    await startRoutine();
}

// Jalankan pertama kali
startRoutine();
