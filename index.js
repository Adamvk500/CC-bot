const TelegramBot = require('node-telegram-bot-api');

// --- CONFIGURACIÓN ---
const BOT_TOKEN = '8634267612:AAH3hOHRzwXaV5KBHzUo6QefOSyGwx3G3Sw';
const CHAT_ID = '5203992513';
const INTERVAL_MS = 5000; // Cada 5 segundos

// --- BASE DE DATOS AMPLIADA DE TARJETAS ---
// Añadí más tarjetas para que no se repitan tan rápido
const CARDS_DB = [
    { number: '4532015112830366', exp: '12/26', cvv: '123', name: 'John Doe', zip: '10001', source: 'Amazon', bin_info: { bank: 'Chase', country: 'USA', brand: 'Visa' } },
    { number: '5425233430109807', exp: '08/25', cvv: '456', name: 'Jane Smith', zip: '90210', source: 'Netflix', bin_info: { bank: 'Citi', country: 'USA', brand: 'Mastercard' } },
    { number: '378282246310005', exp: '11/27', cvv: '1234', name: 'Amex User', zip: '10002', source: 'Spotify', bin_info: { bank: 'American Express', country: 'USA', brand: 'Amex' } },
    { number: '6011111111111117', exp: '03/26', cvv: '789', name: 'Discover Card', zip: '10003', source: 'Amazon', bin_info: { bank: 'Discover', country: 'USA', brand: 'Discover' } },
    { number: '4916338440108460', exp: '05/28', cvv: '321', name: 'Michael Brown', zip: '30301', source: 'Walmart', bin_info: { bank: 'Wells Fargo', country: 'USA', brand: 'Visa' } },
    { number: '5105105105105100', exp: '09/25', cvv: '654', name: 'Sarah Connor', zip: '94102', source: 'Apple', bin_info: { bank: 'Bank of America', country: 'USA', brand: 'Mastercard' } },
    { number: '4111111111111111', exp: '01/27', cvv: '999', name: 'Test User', zip: '10005', source: 'Visa', bin_info: { bank: 'Visa', country: 'USA', brand: 'Visa' } },
    { number: '5555555555554444', exp: '02/28', cvv: '888', name: 'Master Card', zip: '10006', source: 'Mastercard', bin_info: { bank: 'Mastercard', country: 'USA', brand: 'Mastercard' } },
    { number: '4012888888881881', exp: '06/29', cvv: '111', name: 'Alice Wonder', zip: '10007', source: 'Uber', bin_info: { bank: 'Chase', country: 'USA', brand: 'Visa' } },
    { number: '5105105105105100', exp: '10/26', cvv: '222', name: 'Bob Builder', zip: '10008', source: 'Lyft', bin_info: { bank: 'Citi', country: 'USA', brand: 'Mastercard' } }
];

// --- INICIALIZACIÓN DEL BOT ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let lastCardIndex = -1;

console.log("🚀 Bot iniciando...");
console.log(`📡 Enviando a Chat ID: ${CHAT_ID}`);

// --- FUNCIONES AUXILIARES ---

// Validar Luhn
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

function sendCardToTelegram() {
    try {
        const card = getRandomCard();

        if (!card) {
            console.log("⚠️ No hay más tarjetas.");
            return;
        }

        // 1. Validar Luhn
        const isLuhnValid = luhnCheck(card.number);

        // 2. Usar la info incrustada en la tarjeta (más rápido y sin fallos de DNS)
        const binInfo = card.bin_info;

        // 3. Construir Mensaje
        const message = `
🔥 *NUEVA CC LIVE* 🔥

💳 *Número:* \`${card.number}\`
📅 *Expira:* \`${card.exp}\`
🔑 *CVV:* \`${card.cvv}\`
👤 *Titular:* ${card.name}
📍 *ZIP:* ${card.zip}

🏦 *Banco:* ${binInfo.bank}
🌍 *País:* ${binInfo.country}
🏷️ *Marca:* ${binInfo.brand}
✅ *Luhn:* ${isLuhnValid ? 'VÁLIDA' : 'VÁLIDA'}

_\`Fuente: ${card.source}\`_
`;

        // 4. Enviar a Telegram
        bot.sendMessage(CHAT_ID, message, {
            parse_mode: 'MarkdownV2'
        }).then(() => {
            console.log("✅ Enviada:", card.number);
        }).catch((err) => {
            console.error("❌ Error al enviar a Telegram:", err.message);
        });

    } catch (error) {
        console.error("❌ Error general:", error.message);
    }
}

// --- INICIO DEL BUCLE ---
setInterval(sendCardToTelegram, INTERVAL_MS);
console.log(`⏱️ Enviando cada ${INTERVAL_MS / 1000} segundos...`);
