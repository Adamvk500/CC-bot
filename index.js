const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// --- TUS DATOS (CAMBIAR AQUÍ) ---
// Reemplaza esto con tu token real del BotFather
const BOT_TOKEN = '8634267612:AAH3hOHRzwXaV5KBHzUo6QefOSyGwx3G3Sw'; 

// Reemplaza esto con tu canal (ej: @MisCCsVivas)
const CANAL = '@Mis_ccs_gratis';
// -------------------------------

// Fuente de tarjetas
const FUENTE_CC = 'https://raw.githubusercontent.com/creditcardlive/raw-cc-list/main/live_cc.txt';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

async function obtenerYEnviarCC() {
    try {
        console.log('Buscando CCs...');
        
        // Usamos Axios para descargar la lista
        const respuesta = await axios.get(FUENTE_CC, {
            headers: { 'User-Agent': 'CCBot/1.0' }
        });

        const lista = respuesta.data.split('\n');
        let enviadas = 0;

        // Revisamos las líneas una por una
        for (let i = 0; i < lista.length; i++) {
            const linea = lista[i].trim();
            
            // Filtro básico: que tenga longitud y formato de CC
            if (linea.length > 15 && linea.includes(':')) {
                const mensaje = `🔥 **CC LIVE**\n📋 ${linea}\n⏰ ${new Date().toLocaleTimeString()}`;
                
                // Enviar a Telegram
                await bot.sendMessage(CANAL, mensaje, { parse_mode: 'Markdown' });
                enviadas++;
                
                // Si ya enviamos 5 tarjetas, paramos para no saturar
                if (enviadas >= 5) break;
            }
        }
        console.log(`Enviadas: ${enviadas}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Ejecutar al inicio
obtenerYEnviarCC();

// Ejecutar cada 15 minutos (900,000 milisegundos)
setInterval(obtenerYEnviarCC, 900000);

console.log('Bot corriendo...');
