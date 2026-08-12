const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http');
const { getRandomCard, generateNewCard } = require('./cards_db');
const { luhnCheck, getBinInfo } = require('./validator');

// CONFIGURACIÓN
const BOT_TOKEN = '8634267612:AAH3hOHRzwXaV5KBHzUo6QefOSyGwx3G3Sw';
const CHANNEL_ID = '5203992513'; // CAMBIA ESTO POR TU CANAL O TU ID DE USUARIO
const PORT = process.env.PORT || 3000;

// Inicializar Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Variables globales para estadísticas
let totalSent = 0;
let lastSentTime = new Date();

// Función principal: Buscar y Enviar Tarjetas
async function buscarYEnviarTarjetas() {
    try {
        // Estrategia: 50% de la base de datos conocida, 50% generadas nuevas
        let card;
        const useGenerator = Math.random() > 0.5;
        
        if (useGenerator) {
            // Generar una tarjeta nueva (Visa o Mastercard)
            const brand = Math.random() > 0.5 ? 'VISA' : 'MASTERCARD';
            card = generateNewCard(brand);
        } else {
            // Tomar una de la base de datos conocida
            card = getRandomCard();
        }

        // Validar con Luhn
        if (!luhnCheck(card.number)) {
            console.log(`Tarjeta descartada (Luhn fallido): ${card.number}`);
            return;
        }

        // Obtener info del BIN (Banco, País)
        const binInfo = await getBinInfo(card.number);

        // Formatear mensaje bonito
        let mensaje = `🔥 **NUEVA CC ENCONTRADA** 🔥\n\n`;
        mensaje += `💳 **Nº:** \`${card.number}\`\n`;
        mensaje += `📅 **Exp:** ${card.exp}\n`;
        mensaje += `🔑 **CVV:** ${card.cvv}\n`;
        mensaje += `👤 **Name:** ${card.name}\n`;
        mensaje += `📍 **Zip:** ${card.zip}\n`;
        mensaje += `🏦 **Banco:** ${binInfo.bank}\n`;
        mensaje += `🌍 **País:** ${binInfo.country}\n`;
        mensaje += `🏷️ **Marca:** ${binInfo.brand}\n`;
        mensaje += `📊 **Fuente:** ${card.source}\n\n`;
        mensaje += `⚠️ *Validada matemáticamente. Prueba en Amazon/Spotify.*`;

        // Enviar a Telegram
        await bot.sendMessage(CHANNEL_ID, mensaje, { parse_mode: 'Markdown' });
        
        totalSent++;
        lastSentTime = new Date();
        console.log(`✅ Enviada CC #${totalSent}: ${card.number} (${card.brand})`);

    } catch (error) {
        console.error('❌ Error al buscar/enviar:', error.message);
    }
}

// Comandos del Bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "🚀 **Super CC Bot Iniciado** 🚀\n\nComandos:\n/start - Iniciar\n/stats - Ver estadísticas\n/visa - Generar Visa\n/mc - Generar Mastercard\n/amex - Generar Amex", { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const statsMsg = `📊 **Estadísticas:**\n\n📦 Total Enviadas: ${totalSent}\n⏱️ Última Envío: ${lastSentTime.toLocaleTimeString()}\n🌐 Estado: *EN VIVO*`;
    bot.sendMessage(chatId, statsMsg, { parse_mode: 'Markdown' });
});

bot.onText(/\/(visa|mc|amex)/, async (msg) => {
    const chatId = msg.chat.id;
    const match = msg.text.match(/\/(visa|mc|amex)/i);
    const brand = match[1].toUpperCase();
    
    let card;
    if (brand === 'VISA') card = generateNewCard('VISA');
    else if (brand === 'MC') card = generateNewCard('MASTERCARD');
    else if (brand === 'AMEX') card = generateNewCard('AMEX');

    const binInfo = await getBinInfo(card.number);
    
    let mensaje = `🎯 **Tarjeta Solicitada:**\n\n`;
    mensaje += `💳 **Nº:** \`${card.number}\`\n`;
    mensaje += `📅 **Exp:** ${card.exp}\n`;
    mensaje += `🔑 **CVV:** ${card.cvv}\n`;
    mensaje += `🏦 **Banco:** ${binInfo.bank}\n`;
    mensaje += `🌍 **País:** ${binInfo.country}`;

    bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
});

// Ejecutar búsqueda cada 2 minutos (120,000 ms)
setInterval(buscarYEnviarTarjetas, 120000);
// Enviar una inmediatamente al arrancar
buscarYEnviarTarjetas();

// INICIAR SERVIDOR WEB PARA RENDER
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Super CC Bot está vivo!');
});

server.listen(PORT, () => {
    console.log(`✅ Super Bot corriendo en el puerto ${PORT}...`);
    console.log(`✅ Canal objetivo: ${CHANNEL_ID}`);
    console.log(`✅ Base de datos cargada.`);
});
