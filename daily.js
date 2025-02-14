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

const HEADERS = {
    'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
    'User-Agent': 'Mozilla/5.0',
    'Referer': 'https://www.alphabot.app/boost',
    'Origin': 'https://www.alphabot.app'
};

function getCurrentTimestamp() {
    return moment().tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm:ss');
}

async function login() {
    console.log(`🕒 [${getCurrentTimestamp()}] Memulai proses login...`);
    try {
        const response = await axios.get(LOGIN_API, { headers: HEADERS });
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
        const response = await axios.post(SPIN_API, {}, { headers: HEADERS });
        if (response.status === 200) {
            const items = response.data?.items || [];
            let result = items.length > 0 ? items.map(item => item.option.trim()).join(', ') : "Tidak diketahui";
            console.log(`🎉 [${getCurrentTimestamp()}] Spin Wheel Berhasil!`);
            console.log(`🔹 [${getCurrentTimestamp()}] Hasil: ${result}`);
            await autoClaimPoints(items);
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Spin Wheel mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.warn(`🚫 [${getCurrentTimestamp()}] Anda sudah melakukan daily spin hari ini. Coba lagi besok!`);
        } else {
            console.error(`❌ [${getCurrentTimestamp()}] Spin Wheel Gagal:`, error.response?.data || error.message);
        }
    }
    await getPoints();
}

async function autoClaimPoints(items) {
    const validPoints = ["500 points", "1000 points", "2000 points"];
    const earnedPoints = items.map(item => item.option.trim());
    for (const point of validPoints) {
        if (earnedPoints.includes(point)) {
            console.log(`✅ [${getCurrentTimestamp()}] Anda mendapatkan ${point}!`);
        }
    }
}

async function getPoints() {
    try {
        console.log(`💰 [${getCurrentTimestamp()}] Mengambil data total poin...`);
        const response = await axios.get(POINTS_API, { headers: HEADERS });
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
    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    await startRoutine();
}

startRoutine();
