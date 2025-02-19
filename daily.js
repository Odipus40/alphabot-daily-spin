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

function getCurrentTimestamp() {
    return moment().tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm:ss');
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
        console.error(`❌ [${getCurrentTimestamp()}] Login Gagal:`, error.response ? error.response.data : error.message);
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
            const spinIndex = response.data.index; // Dapatkan index hasil spin

            if (spinIndex !== undefined) {
                // Ambil daftar reward dari API GET sebelumnya
                const rewardResponse = await axios.get(SPIN_API, {
                    headers: {
                        'Cookie': `__Secure-next-auth.session-token=${SESSION_TOKEN}`,
                        'User-Agent': 'Mozilla/5.0',
                        'Referer': 'https://www.alphabot.app/boost',
                        'Origin': 'https://www.alphabot.app'
                    }
                });

                const rewardList = rewardResponse.data.items;
                const reward = rewardList[spinIndex]; // Cocokkan index dengan daftar hadiah

                if (reward) {
                    console.log(`🎡 [${getCurrentTimestamp()}] Spin Wheel Berhasil!`);
                    console.log(`🔹 [${getCurrentTimestamp()}] Hasil: ${reward.option} (${reward.level})`);
                } else {
                    console.log(`⚠️ [${getCurrentTimestamp()}] Gagal mendapatkan detail hadiah dari index: ${spinIndex}`);
                }
            } else {
                console.log(`⚠️ [${getCurrentTimestamp()}] API tidak mengembalikan index yang valid.`);
            }

            await getPoints();
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Spin Wheel mungkin gagal. Status: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error(`❌ [${getCurrentTimestamp()}] Error: Anda sudah melakukan daily spin wheel hari ini. Coba lagi besok!`);
        } else {
            console.error(`❌ [${getCurrentTimestamp()}] Spin Wheel Gagal:`, error.response ? error.response.data : error.message);
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
            console.log(`🏆 [${getCurrentTimestamp()}] Total Points: ${points}`);
            console.log(`📊 [${getCurrentTimestamp()}] Rank Anda: ${rank}`);
        } else {
            console.log(`⚠️ [${getCurrentTimestamp()}] Gagal mendapatkan informasi poin. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ [${getCurrentTimestamp()}] Gagal mendapatkan data poin:`, error.response ? error.response.data : error.message);
    }
}

async function startRoutine() {
    try {
        displayHeader();
        await login();
    } catch (error) {
        console.error(`🚨 [${getCurrentTimestamp()}] Terjadi error dalam eksekusi script:`, error.message);
    }

    const nextRun = moment().tz('Asia/Jakarta').add(24, 'hours').format('DD/MM/YYYY, HH:mm:ss');
    console.log(`\n⏳ [${getCurrentTimestamp()}] Menunggu 24 jam untuk menjalankan ulang pada: ${nextRun} WIB\n`);

    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    await startRoutine();
}

startRoutine();
