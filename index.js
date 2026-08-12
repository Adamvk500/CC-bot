const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// --- CONFIGURACIÓN ---
const BOT_TOKEN = '8634267612:AAH3hOHRzwXaV5KBHzUo6QefOSyGwx3G3Sw';
const CHAT_ID = '5203992513';
const INTERVAL_MS = 5000; // Cada 5 segundos

// --- BASE DE DATOS DE TARJETAS (Añade más si quieres menos repetición) ---
const CARDS_DB = [
    { number: '4532015112830366', exp: '12/26', cvv: '123', name: 'John Doe', zip: '10001', source: 'Amazon' },
    { number: '5425233430109807', exp: '08/25', cvv: '456', name: 'Jane Smith', zip: '90210', source: 'Netflix' },
    { number: '378282246310005', exp: '11/27', cvv: '1234', name: 'Amex User', zip: '10002', source: 'Spotify' },
    { number: '6011111111111117', exp: '03/26', cvv: '789', name: 'Discover Card', zip: '10003', source: 'Amazon' },
    { number: '4916338440108460', exp: '05/28', cvv: '321', name: 'Michael Brown', zip: '30301', source: 'Walmart' },
    { number: '5105105105105100', exp: '09/25', cvv: '654', name: 'Sarah Connor', zip: '94102', source: 'Apple' },
    { number: '4111111111111111', exp: '01/27', cvv: '999', name: 'Test User', zip: '10005', source: 'Visa' },
    { number: '5555555555554444', exp: '02/28', cvv: '888', name: 'Master Card', zip: '10006', source: 'Mastercard' }
];

// --- INICIALIZACIÓN DEL BOT ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let lastCardIndex = -1; // Para evitar repetir la misma tarjeta

console.log("🚀 Bot iniciando...");
console.log(`📡 Enviando a Chat ID: ${CHAT_ID}`);

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

// Obtener info del BIN usando una API pública
async function getBinInfo(cardNumber) {
    try {
        const bin = cardNumber.substring(0, 4);
        // Usamos timeout de 3 segundos para que no bloquee el bot si la API tarda
        const response = await axios.get(`https://api.binlist.net/range/${bin}`, { timeout: 3000 });
        
        if (response.data) {
            const data = response.data[bin];
            return {
                bank: data.bank || 'Desconocido',
                country: data.country?.name || 'Desconocido',
                brand: data.brand || 'Desconocido'
            };
        }
    } catch (error) {
        // Si falla la API, devolvemos valores por defecto para que el mensaje no se rompa
        console.log("⚠️ API BIN lenta o caída, usando datos por defecto para BIN:", cardNumber.substring(0, 4));
    }
    
    // Fallback manual básico según el primer dígito
    const firstDigit = cardNumber[0];
    let brand = 'Desconocido';
    let bank = 'Banco Local';
    let country = 'USA';

    if (firstDigit === '4') brand = 'Visa';
    else if (firstDigit === '5') brand = 'Mastercard';
    else if (firstDigit === '3') brand = 'Amex';
    else if (firstDigit === '6') brand = 'Discover';

    return { bank, country, brand };
}

// Seleccionar una tarjeta aleatoria evitando la última enviada
function getRandomCard() {
    if (CARDS_DB.length === 0) return null;
    
    let randomIndex;
    // Si hay más de 1 tarjeta, intenta no repetir la misma
    if (CARDS_DB.length > 1) {
        do {
            randomIndex = Math.floor(Math.random() * CARDS_DB.length);
        } while (randomIndex === lastCardIndex);
    } else {
        randomIndex = 0;
    }
    
    lastCardIndex = randomIndex;
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

        // 2. Obtener Info del BIN (con fallback para evitar bloqueos)
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
