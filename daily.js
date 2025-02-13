require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');
require('colors');
const { displayHeader } = require('./helpers');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const POINTS_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/points';
const SESSION_TOKEN = process.env.SESSION_TOKEN;
const LOG_FILE = 'daily_log.json'; // File penyimpanan log harian

const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

// Fungsi untuk mendapatkan timestamp lengkap
function getCurrentTimestamp() {
    return moment().tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm:ss');
}

// Fungsi untuk membaca log hari sebelumnya
function readPreviousLog() {
    if (fs.existsSync(LOG_FILE)) {
        const data = fs.readFileSync(LOG_FILE, 'utf8');
        try {
            const logs = JSON.parse(data);
            console.log(`📜 [${getCurrentTimestamp()}] Log Hari Sebelumnya:\n`);
            logs.forEach(log => console.log(log));
            console.log('\n');
        } catch (error) {
            console.error(`⚠️ Gagal membaca log sebelumnya: ${error.message}`);
        }
    } else {
        console.log(`📜 [${getCurrentTimestamp()}] Tidak ada log hari sebelumnya.\n`);
    }
}

// Fungsi untuk menyimpan log ke dalam file
function saveLog(logMessage) {
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
        const data = fs.readFileSync(LOG_FILE, 'utf8');
        try {
            logs = JSON.parse(data);
        } catch (error) {
            logs = [];
        }
    }
    logs.push(logMessage);
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
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

            const successLog = `🎉 [${getCurrentTimestamp()}] Spin Wheel Berhasil! Hasil: ${result}`;
            console.log(successLog);
            saveLog(successLog);
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Spin Wheel mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        const errorMsg = `❌ [${getCurrentTimestamp()}] Spin Wheel Gagal: ${error.response?.data || error.message}`;
        console.error(errorMsg);
        saveLog(errorMsg);
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
            const pointsLog = `🏆 [${getCurrentTimestamp()}] Total Points: ${response.data.points} | Rank: ${response.data.rank}`;
            console.log(pointsLog);
            saveLog(pointsLog);
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Gagal mendapatkan informasi poin.`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentTimestamp()}] Gagal mendapatkan data poin:`, error.response?.data || error.message);
    }
}

async function startRoutine() {
    try {
        displayHeader();
        readPreviousLog(); // Tampilkan log hari sebelumnya
        await login();
    } catch (error) {
        console.error(`🚨 [${getCurrentTimestamp()}] Terjadi error dalam eksekusi script:`, error);
    }

    const nextRun = moment().tz('Asia/Jakarta').add(24, 'hours').format('DD/MM/YYYY, HH:mm:ss');
    console.log(`\n⏳ [${getCurrentTimestamp()}] Menunggu 24 jam untuk menjalankan ulang pada: ${nextRun} WIB\n`);

    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));

    await startRoutine();
}

// Jalankan pertama kali
startRoutine();
