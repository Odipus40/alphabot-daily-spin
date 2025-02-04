require("dotenv").config();
const axios = require("axios");
const ethers = require("ethers");

// URL API untuk klaim wheel, cek poin, dan cek rank
const API_WHEEL_CLAIM = "https://www.alphabot.app/api/auth/session";
const API_POINTS = "https://www.alphabot.app/api/points";  // Endpoint untuk cek poin
const API_RANK = "https://www.alphabot.app/api/leaderboard";  // Endpoint untuk cek rank

// Mengambil private key dari file .env
const PRIVATE_KEYS = process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(",") : [];

if (PRIVATE_KEYS.length === 0) {
  console.error("❌ No private keys found in .env file! Please add PRIVATE_KEYS.");
  process.exit(1);
}

// Fungsi untuk mendapatkan poin
const getPoints = async (address) => {
  try {
    const response = await axios.get(`${API_POINTS}${address}`);
    return response.data.points; // Anggap API mengembalikan poin yang diperoleh
  } catch (error) {
    console.error("Terjadi kesalahan saat memeriksa poin:", error.message);
    return null;
  }
};

// Fungsi untuk mendapatkan rank
const getRank = async (address) => {
  try {
    const response = await axios.get(`${API_RANK}${address}`);
    return response.data.rank; // Anggap API mengembalikan rank pengguna
  } catch (error) {
    console.error("Terjadi kesalahan saat memeriksa rank:", error.message);
    return null;
  }
};

// Fungsi klaim dan memeriksa poin serta rank
const claimWheel = async () => {
  try {
    // Kirim permintaan klaim ke API
    const response = await axios.post(API_WHEEL_CLAIM);

    if (response.data && response.data.success) {
      console.log("Klaim berhasil:", response.data.message);

      // Mendapatkan alamat wallet dari private key (menggunakan wallet untuk mendapatkan address jika perlu)
      const wallet = new ethers.Wallet(PRIVATE_KEYS[0]); // Hanya contoh, menggunakan private key pertama
      const address = await wallet.getAddress();
      console.log(`Memeriksa poin dan rank untuk wallet: ${address}`);

      // Memeriksa jumlah poin yang didapat
      const points = await getPoints(address);
      const rank = await getRank(address);

      if (points >= 1000 && points <= 2000) {
        console.log(`✅ Berhasil mendapatkan ${points} poin!`);
      } else {
        console.log(`❌ Poin saat ini: ${points}. Anda perlu mendapatkan antara 1000 hingga 2000 poin.`);
      }

      // Menampilkan rank pengguna
      if (rank) {
        console.log(`🏅 Rank Anda saat ini: ${rank}`);
      } else {
        console.log("❌ Gagal mendapatkan rank.");
      }

      // Menampilkan total poin
      if (points !== null) {
        console.log(`💎 Total poin saat ini: ${points}`);
      } else {
        console.log("❌ Gagal memeriksa total poin.");
      }
    } else {
      console.log("Klaim gagal:", response.data.message);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat klaim:", error.message);
  }
};

// Loop untuk mencoba setiap private key di .env
PRIVATE_KEYS.forEach((privateKey, index) => {
  console.log(`🔑 Menggunakan private key ke-${index + 1}`);
  claimWheel(); // Menjalankan klaim
});
