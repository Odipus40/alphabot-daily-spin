require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const moment = require('moment-timezone');
require('colors');
const { displayHeader } = require('./helpers');

const LOGIN_API = 'https://www.alphabot.app/api/auth/session';
const SPIN_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/wheel';
const POINTS_API = 'https://www.alphabot.app/api/platformAirdrops/663c16768d466b80012cb656/points';
const SESSION_TOKEN = process.env.SESSION_TOKEN;
const LAST_LOGIN_FILE = 'last_login.txt';

const WAIT_TIME = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

if (!SESSION_TOKEN) {
    console.error("❌ Error: SESSION_TOKEN tidak ditemukan di .env");
    process.exit(1);
}

function getCurrentDate() {
    return moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
}

function getLastLoginDate() {
    if (fs.existsSync(LAST_LOGIN_FILE)) {
        return fs.readFileSync(LAST_LOGIN_FILE, 'utf8').trim();
    }
    return null;
}

function updateLastLoginDate() {
    fs.writeFileSync(LAST_LOGIN_FILE, getCurrentDate(), 'utf8');
}

async function login() {
    console.log(`🕒 [${getCurrentDate()}] Memulai proses login...`);
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
            console.log(`✅ [${getCurrentDate()}] Login Berhasil!`);
            updateLastLoginDate();
        } else {
            console.log(`⚠️ [${getCurrentDate()}] Login mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentDate()}] Login Gagal:`, error.response ? error.response.data : error.message);
    }
}

async function spinWheel() {
    console.log(`🎡 [${getCurrentDate()}] Memulai daily spin wheel...`);
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
            let result = items.length > 0 ? items.map(item => item.option).join(', ') : "Tidak diketahui";

            console.log(`🎉 [${getCurrentDate()}] Spin Wheel Berhasil! Hasil: ${result}`);
            await getPoints();
        } else {
            console.log(`⚠️ [${getCurrentDate()}] Spin Wheel mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentDate()}] Spin Wheel Gagal:`, error.response ? error.response.data : error.message);
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
            console.log(`🏆 [${getCurrentDate()}] Total Points: ${points}`);
            console.log(`📊 [${getCurrentDate()}] Rank Anda: ${rank}`);
        } else {
            console.log(`⚠️ [${getCurrentDate()}] Gagal mendapatkan informasi poin. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentDate()}] Gagal mendapatkan data poin:`, error.response ? error.response.data : error.message);
    }
}

async function startRoutine() {
    displayHeader();
    const lastLogin = getLastLoginDate();
    const today = getCurrentDate();

    if (lastLogin !== today) {
        await login();
    } else {
        console.log(`🔄 [${getCurrentDate()}] Login dilewati. Langsung melakukan daily spin wheel.`);
    }

    await spinWheel();
    
    console.log(`⏳ Menunggu 24 jam untuk eksekusi ulang...");
    setTimeout(startRoutine, WAIT_TIME);
}

startRoutine();
