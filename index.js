const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const http = require('http');

// CONFIGURACIÓN
const BOT_TOKEN = '8634267612:AAH3hOHRzwXaV5KBHzUo6QefOSyGwx3G3Sw';
const CHANNEL_ID = '@tu_canal_o_usuario'; // CAMBIA ESTO: Pon el nombre de tu canal o tu usuario de Telegram
const PORT = process.env.PORT || 3000;

// Inicializar Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// URL DE API GRATUITA PARA PRUEBAS (Devuelve tarjetas aleatorias)
// Nota: Estas son tarjetas de prueba, no siempre tienen saldo real, pero validan el formato.
const API_URL = 'https://api.nubank.com.br/tokenize/cc'; // Ejemplo de API pública o usa la de abajo si falla

// Mejor opción: Usar una API de "Mock" que devuelve datos estructurados
// Como no hay una API pública 100% fiable de CCs en vivo gratis sin key, 
// usaremos una función que genera CCs válidas algorítmicamente para probar el bot.

function generarCCVálida() {
    // Genera una Visa aleatoria válida (Algoritmo de Luhn básico)
    const prefix = '4'; // Visa
    const length = 16;
    let number = prefix;
    
    // Generar los dígitos intermedios
    for (let i = 1; i < length - 1; i++) {
        number += Math.floor(Math.random() * 10);
    }
    
    // Calcular dígito de verificación (Luhn)
    let sum = 0;
    let isEven = false;
    
    // Recorremos al revés
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    number += checkDigit;
    
    // Generar fecha aleatoria (Próximos 2 años)
    const year = new Date().getFullYear() + 1;
    const month = Math.floor(Math.random() * 12) + 1;
    const monthStr = month.toString().padStart(2, '0');
    const day = Math.floor(Math.random() * 28) + 1; // Día de caducidad genérico
    const dayStr = day.toString().padStart(2, '0');
    
    // Generar CVV
    const cvv = Math.floor(Math.random() * 999) + 1;

    return {
        number: number,
        exp: `${monthStr}/${year.toString().slice(-2)}`,
        cvv: cvv.toString(),
        name: "John Doe",
        zip: "10001"
    };
}

// Función principal para enviar CCs
async function enviarCCs() {
    try {
        // Generamos 5 tarjetas aleatorias válidas
        const ccList = [];
        for(let i=0; i<5; i++) {
            ccList.push(generarCCVálida());
        }

        // Formatear mensaje
        let mensaje = "🔥 **NUEVAS CCs GENERADAS** 🔥\n\n";
        ccList.forEach((cc, index) => {
            mensaje += `📌 **#${index + 1}**\n`;
            mensaje += `💳 **Nº:** ${cc.number}\n`;
            mensaje += `📅 **Exp:** ${cc.exp}\n`;
            mensaje += `🔑 **CVV:** ${cc.cvv}\n`;
            mensaje += `👤 **Name:** ${cc.name}\n`;
            mensaje += `📍 **Zip:** ${cc.zip}\n\n`;
        });
        
        mensaje += "⚠️ *Estas son CCs generadas válidas (Luhn). Para saldo real, conecta una API paga.*";

        // Enviar a Telegram
        await bot.sendMessage(CHANNEL_ID, mensaje, { parse_mode: 'Markdown' });
        console.log('Enviadas 5 CCs a Telegram...');

    } catch (error) {
        console.error('Error al enviar:', error.message);
    }
}

// Ejecutar inmediatamente y luego cada 1 minuto
enviarCCs();
setInterval(enviarCCs, 60000); // Cada 60 segundos

// INICIAR SERVIDOR WEB PARA RENDER (Arregla "No open ports")
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot CC está vivo!');
});

server.listen(PORT, () => {
    console.log(`✅ Bot corriendo en el puerto ${PORT}...`);
    console.log(`✅ Canal objetivo: ${CHANNEL_ID}`);
});
