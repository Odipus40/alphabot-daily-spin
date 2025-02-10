require('dotenv').config();
const axios = require('axios');

const loginUrl = 'https://www.alphabot.app/api/auth/session';

// Ambil cookie dari .env
const sessionCookie = process.env.SESSION_COOKIE;

if (!sessionCookie) {
    console.error("❌ Cookie sesi tidak ditemukan. Pastikan file .env telah diisi dengan SESSION_COOKIE.");
    process.exit(1);
}

// Fungsi untuk login ke AlphaBot
const login = async () => {
    console.log("\n⏳ Memulai proses login ke AlphaBot menggunakan cookie...");

    try {
        const response = await axios.get(loginUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Cookie': `__Secure-next-auth.session-token=${sessionCookie}`
            }
        });

        console.log("✅ Login berhasil!");

        // Preview user jika tersedia
        if (response.data?.user) {
            console.log("\n👤 **User Info:**");
            console.log(`   🔹 Email: ${response.data.user.email || "Tidak tersedia"}`);
            console.log(`   🔹 ID: ${response.data.user._id || "Tidak tersedia"}`);
        } else {
            console.log("⚠️ Data user tidak ditemukan dalam response.");
        }

    } catch (error) {
        console.error("❌ Terjadi kesalahan saat login:", JSON.stringify(error.response?.data || error.message, null, 2));
    }
};

// Jalankan fungsi login
login();
