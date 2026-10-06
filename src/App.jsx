import { CalculationMethod, Coordinates, PrayerTimes } from "adhan";
import { useEffect, useState } from "react";
import { sendUdpMessage } from "./services/udpService";
import "./App.css";

function App() {
  const [waktu, setWaktu] = useState(new Date().toLocaleTimeString("id-ID"));
  const [runningText, setRunningText] = useState(
    "Selamat Datang di Masjid At-Tahkim Yogyakarta",
  );
  const [inputText, setInputText] = useState("");
  const [lat, setLat] = useState(-7.7956);
  const [lng, setLng] = useState(110.3695);
  const [jadwal, setJadwal] = useState({
    shubuh: "--:--",
    dzuhur: "--:--",
    ashar: "--:--",
    maghrib: "--:--",
    isya: "--:--",
  });

  // Untuk update jam tiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setWaktu(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  //Hitung jam sholatnya
  useEffect(() => {
    try {
      const coordinates = new Coordinates(parseFloat(lat), parseFloat(lng));
      const params = CalculationMethod.Singapore();
      params.fajrAngle = 20;
      params.ishaAngle = 18;

      const prayerTimes = new PrayerTimes(coordinates, new Date(), params);
      const fmt = (d) =>
        d
          ? d.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "--:--";

      setJadwal({
        shubuh: fmt(prayerTimes.fajr),
        dzuhur: fmt(prayerTimes.dhuhr),
        ashar: fmt(prayerTimes.asr),
        maghrib: fmt(prayerTimes.maghrib),
        isya: fmt(prayerTimes.isha),
      });
    } catch (e) {
      console.error("Gagal menghitung jadwal:", e);
    }
  }, [lat, lng]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(4));
          setLng(position.coords.longitude.toFixed(4));
        },
        (error) => {
          alert("Gagal mengambil lokasi GPS. Pastikan izin lokasi aktif.");
        },
      );
    } else {
      alert("Browser/HP tidak mendukung fitur Geolocation");
    }
  };

  const handleSyncTime = async () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    const commands = [
      `*${hh}${mm}${ss}#`,
      `SETTIME=${hh}:${mm}:${ss}\n`,
      `JAM:${hh}:${mm}:${ss}`,
    ];

    for (const cmd of commands) {
      await sendUdpMessage(cmd);
    }
    alert("Perintah waktu terkirim ke jam!");
  };

  const handleUpdateText = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setRunningText(inputText);

    const commands = [
      `TEXT=${inputText}\n`,
      `*TEXT:${inputText}#`,
      `RUNNING=${inputText}`,
    ];

    for (const cmd of commands) {
      await sendUdpMessage(cmd);
    }

    setInputText("");
    alert("Running text terkirim ke jam!");
  };
  return (
    <div className="container">
      {/* Header Website */}
      <header className="header">
        <h1>WEBSITE JAM DIGITAL</h1>
        <p>WiFi terhubung = Bismillah-JwsRGB-Udp</p>
      </header>

      {/* Box jam utama */}
      <div className="jam-card">
        <div className="jam-display">{waktu}</div>
      </div>

      {/* Grid jadwal sholat */}
      <div className="grid-jadwal">
        <div className="card-jadwal">
          <h3>Shubuh</h3>
          <p>{jadwal.shubuh}</p>
        </div>
        <div className="card-jadwal">
          <h3>Dzuhur</h3>
          <p>{jadwal.dzuhur}</p>
        </div>
        <div className="card-jadwal">
          <h3>Ashar</h3>
          <p>{jadwal.ashar}</p>
        </div>
        <div className="card-jadwal">
          <h3>Maghrib</h3>
          <p>{jadwal.maghrib}</p>
        </div>
        <div className="card-jadwal">
          <h3>Isya</h3>
          <p>{jadwal.isya}</p>
        </div>
      </div>

      {/* Tombol aksi waktu */}
      <div className="section-box">
        <button onClick={handleSyncTime} className="btn-primary">
          Sinkronkan Waktu Sekarang
        </button>
      </div>

      {/* Form running text */}
      <div className="section-box">
        <h2>Atur Running Text</h2>
        <form onSubmit={handleUpdateText} className="form-group">
          <input
            type="text"
            className="input-text"
            placeholder="Ketik Teks Baru"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-secondary">
            Kirim
          </button>
        </form>
        <div className="preview-text">
          <strong>Teks Aktif: </strong> {runningText}
        </div>
      </div>

      {/* Form pengaturan lokasi / koordinat */}
      <div className="section-box">
        <h2>Lokasi Masjid</h2>
        <div className="form-row">
          <label>
            Latitude:
            <input
              type="number"
              step="any"
              className="input-num"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </label>
          <label>
            Longitude:
            <input
              type="number"
              step="any"
              className="input-num"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </label>
        </div>
        <button onClick={handleGetLocation} className="btn-gps">
          Ambil Lokasi Saya
        </button>
      </div>
    </div>
  );
}

export default App;
