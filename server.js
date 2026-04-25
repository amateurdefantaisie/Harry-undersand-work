const express = require("express");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

/* =========================
   🔐 CONFIG (depuis Render)
========================= */
const TOKEN = process.env.TOKEN;
const CHANNEL = process.env.CHANNEL;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

/* =========================
   🔥 FIREBASE CONFIG VIA ENV
========================= */
if (!process.env.FIREBASE_KEY) {
  throw new Error("FIREBASE_KEY manquant dans les variables d'environnement");
}

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

// Corrige le problème des \n dans Render
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/* =========================
   🔗 SET WEBHOOK (IMPORTANT)
========================= */
app.get("/set-webhook", async (req, res) => {
  try {
    const url = `https://api.telegram.org/bot${TOKEN}/setWebhook?url=${WEBHOOK_URL}/webhook`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("Webhook set:", data);
    res.json(data);

  } catch (err) {
    console.error("❌ Erreur webhook :", err);
    res.status(500).send("Erreur webhook");
  }
});

/* =========================
   📥 WEBHOOK TELEGRAM
========================= */
app.post("/webhook", async (req, res) => {

  try {
    const message = req.body.channel_post;

    if (!message) return res.sendStatus(200);

    if (message.video) {

      const fileId = message.video.file_id;

      // 🔥 récupérer chemin fichier
      const fileRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();

      if (!fileData.ok) {
        console.error("❌ getFile error:", fileData);
        return res.sendStatus(200);
      }

      const filePath = fileData.result.file_path;

      // 🔗 URL DIRECTE
      const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

      await db.collection("videos").add({
        url: fileUrl,
        likes: 0,
        telegram_post_id: message.message_id,
        created: Date.now(),
        source: "telegram"
      });

      console.log("✅ Vidéo Telegram ajoutée :", fileUrl);
    }

  } catch (err) {
    console.error("❌ Erreur webhook :", err);
  }

  res.sendStatus(200);
});

/* =========================
   📤 ENVOI VERS TELEGRAM
========================= */
app.post("/send-to-telegram", async (req, res) => {

  try {
    const { video } = req.body;

    if (!video) {
      return res.status(400).json({ error: "video manquante" });
    }

    const url = `https://api.telegram.org/bot${TOKEN}/sendVideo`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHANNEL,
        video: video,
        caption: "🔥 Nouvelle vidéo"
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("❌ Telegram error:", data);
      return res.status(500).json(data);
    }

    console.log("✅ Envoyé sur Telegram");
    res.json(data);

  } catch (err) {
    console.error("❌ Erreur Telegram :", err);
    res.sendStatus(500);
  }
});

/* =========================
   🧪 ROUTE TEST
========================= */
app.get("/", (req, res) => {
  res.send("✅ Serveur + Bot OK");
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});

/* =========================
   📥 GET VIDEOS (API)
========================= */
app.get("/videos", async (req, res) => {
  try {
    const snapshot = await db.collection("videos")
      .orderBy("created", "desc")
      .limit(20)
      .get();

    const videos = [];

    snapshot.forEach(doc => {
      videos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(videos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération vidéos" });
  }
});
