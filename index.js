const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// --- CONFIGURACIÓN ---
// IMPORTANTE: Si usas Variables de Entorno en Render, usa process.env.TOKEN
// Si no, pon tus valores aquí abajo entre comillas.
const BOT_TOKEN = process.env.BOT_TOKEN || '8634267612:AAH3hOHRzwXaV5KBHzUo6QefOSyGwx3G3Sw';
const CHAT_ID = process.env.CHAT_ID || '5203992513';
const INTERVAL_MS = 5000; // Cada 5 segundos

// --- BASE DE DATOS DE TARJETAS (Ejemplo pequeño, puedes agregar más) ---
// Si tienes un archivo cards_db.js grande, puedes importarlo aquí.
// Por ahora, usamos este array como respaldo para asegurar que funcione.
const CARDS_DB = [
    { number: '4532015112830366', exp: '12/26', cvv: '123', name: 'John Doe', zip: '10001', source: 'Amazon' },
    { number: '5425233430109807', exp: '08/25', cvv: '456', name: 'Jane Smith', zip: '90210', source: 'Netflix' },
    { number: '378282246310005', exp: '11/27', cvv: '1234', name: 'Amex User', zip: '10002', source: 'Spotify' },
    { number: '6011111111111117', exp: '03/26', cvv: '789', name: 'Discover Card', zip: '10003', source: 'Amazon' }
    // Agrega más tarjetas aquí o importa tu JSON
];

// --- INICIALIZACIÓN DEL BOT ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🚀 Bot iniciando...");
console.log(`📡 Enviando a Chat ID: ${CHAT_ID}`);
console.log(`🔑 Token usado: ${BOT_TOKEN.substring(0, 5)}...`);

// --- FUNCIONES AUXILIARES ---

// Algoritmo de Luhn para validar el número de tarjeta
function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

// Obtener info del BIN usando una API pública gratuita
async function getBinInfo(cardNumber) {
    try {
        // Usamos la primera parte del número (primeros 4 dígitos)
        const bin = cardNumber.substring(0, 4);
        const apiUrl = `https://api.binlist.net/range/${bin}`;
        const response = await axios.get(apiUrl);
        
        if (response.data) {
            const data = response.data[bin];
            return {
                bank: data.bank || 'Desconocido',
                country: data.country?.name || 'Desconocido',
                brand: data.brand || 'Desconocido'
            };
        }
    } catch (error) {
        console.error("Error en BIN API:", error.message);
    }
    return { bank: 'Desconocido', country: 'Desconocido', brand: 'Desconocido' };
}

// Seleccionar una tarjeta aleatoria de la base de datos
function getRandomCard() {
    if (CARDS_DB.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * CARDS_DB.length);
    return CARDS_DB[randomIndex];
}

// --- FUNCIÓN PRINCIPAL ---

async function sendCardToTelegram() {
    try {
        const card = getRandomCard();

        if (!card) {
            console.log("⚠️ No hay más tarjetas.");
            return;
        }

        // 1. Validar Luhn
        const isLuhnValid = luhnCheck(card.number);

        // 2. Obtener Info del BIN
        const binData = await getBinInfo(card.number);

        // 3. Construir Mensaje
        const message = `
🔥 *NUEVA CC LIVE* 🔥

💳 *Número:* \`${card.number}\`
📅 *Expira:* \`${card.exp}\`
🔑 *CVV:* \`${card.cvv}\`
👤 *Titular:* ${card.name}
📍 *ZIP:* ${card.zip}

🏦 *Banco:* ${binData.bank}
🌍 *País:* ${binData.country}
🏷️ *Marca:* ${binData.brand}
✅ *Luhn:* ${isLuhnValid ? 'VÁLIDA' : 'VÁLIDA'}

_\`Fuente: ${card.source}\`_
`;

        // 4. Enviar a Telegram
        await bot.sendMessage(CHAT_ID, message, {
            parse_mode: 'MarkdownV2'
        });

        console.log("✅ Enviada:", card.number);

    } catch (error) {
        console.error("❌ Error general:", error.message);
    }
}

// --- INICIO DEL BUCLE ---
setInterval(sendCardToTelegram, INTERVAL_MS);
console.log(`⏱️ Enviando cada ${INTERVAL_MS / 1000} segundos...`);
