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
    console.error("❌ Error: SESSION_TOKEN not found .env");
    process.exit(1);
}

function getCurrentTimestamp() {
    return moment().tz('Asia/Jakarta').format('DD/MM/YYYY, HH:mm:ss');
}

async function login() {
    console.log(`[${getCurrentTimestamp()}] 🕒 Starting login your account...`);

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
            console.log(`[${getCurrentTimestamp()}] ✅ Login successfull...`);
            console.log(`[${getCurrentTimestamp()}] 🔄 Start claiming daily spin wheel...`);
            await spinWheel();
        } else {
            console.log(`[${getCurrentTimestamp()}] ⚠️ Login maybe failed. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`[${getCurrentTimestamp()}] ❌ Login failed!!!:`, error.response ? error.response.data : error.message);
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
                    console.log(`[${getCurrentTimestamp()}] 🎡 Spin Wheel Successful...`);
                    console.log(`[${getCurrentTimestamp()}] 🔹 Result: ${reward.option} (${reward.level})`);
                } else {
                    console.log(`[${getCurrentTimestamp()}] ⚠️ Failed to get reward details from index: ${spinIndex}`);
                }
            } else {
                console.log(`[${getCurrentTimestamp()}] ⚠️ API did not return a valid index`);
            }

            await getPoints();
        } else {
            console.log(`[${getCurrentTimestamp()}] ⚠️ Spin Wheel may failed. Status: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.error(`[${getCurrentTimestamp()}] ❌ Error: You have already done claim daily spin wheel today, Try again tomorrow!!!`);
        } else {
            console.error(`[${getCurrentTimestamp()}] ❌ Spin Wheel Failed!!!:`, error.response ? error.response.data : error.message);
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
            console.log(`[${getCurrentTimestamp()}] 🏆 Total Your Points: ${points}`);
            console.log(`[${getCurrentTimestamp()}] 📊 Rank: ${rank}`);
        } else {
            console.log(`[${getCurrentTimestamp()}] ⚠️ Failed to get points information. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`[${getCurrentTimestamp()}] ❌ Failed to get point data:`, error.response ? error.response.data : error.message);
    }
}

async function startRoutine() {
    try {
        displayHeader();
        await login();
    } catch (error) {
        console.error(`[${getCurrentTimestamp()}] 🚨 Error occurred in the execution of the script:`, error.message);
    }

    const nextRun = moment().tz('Asia/Jakarta').add(24, 'hours').format('DD/MM/YYYY, HH:mm:ss');
    console.log(`\n[${getCurrentTimestamp()}] ⏳ Daily spin wheel complete waiting 24 hours to rerun on: ${nextRun} WIB\n`);

    await new Promise(resolve => setTimeout(resolve, WAIT_TIME));
    await startRoutine();
}

startRoutine();
