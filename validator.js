// validator.js
const axios = require('axios');

// Verifica si la tarjeta es válida matemáticamente
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

// Obtiene info del Banco y País
async function getBinInfo(cardNumber) {
    const bin = cardNumber.substring(0, 6);
    // Usamos una API rápida y estable
    const url = `https://api.binlist.net/${bin}`;

    try {
        const response = await axios.get(url, { timeout: 3000 }); // 3 segundos de espera
        const data = response.data;
        
        return {
            bank: data.bank?.name || "Banco Desconocido",
            country: data.country?.name || "País Desconocido",
            brand: data.brand || "Desconocido"
        };
    } catch (error) {
        // Si falla, devolvemos datos genéricos para que no salga "Cargando..."
        return {
            bank: "Verificando...",
            country: "Mundo",
            brand: "Visa/MC/Amex"
        };
    }
}

module.exports = { luhnCheck, getBinInfo };
