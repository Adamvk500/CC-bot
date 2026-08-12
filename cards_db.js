// validator.js
const axios = require('axios');

// Verificación matemática (Luhn)
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

// Obtener información del BIN
async function getBinInfo(cardNumber) {
    const bin = cardNumber.substring(0, 6);
    
    // Intentamos con la API de binlist.net
    try {
        const response = await axios.get(`https://api.binlist.net/${bin}`, { timeout: 3000 });
        const data = response.data;
        
        return {
            bank: data.bank?.name || "Banco Desconocido",
            country: data.country?.name || "País Desconocido",
            brand: data.brand || detectBrandByFirstDigit(cardNumber[0])
        };
    } catch (error) {
        console.log(`Error API BIN para ${bin}: ${error.message}`);
        // Si falla la API, devolvemos datos basados en el primer dígito
        return {
            bank: "Banco Estándar",
            country: "Mundo",
            brand: detectBrandByFirstDigit(cardNumber[0])
        };
    }
}

// Función auxiliar para detectar marca si falla la API
function detectBrandByFirstDigit(firstDigit) {
    if (firstDigit === '4') return 'VISA';
    if (firstDigit === '5') return 'MASTERCARD';
    if (firstDigit === '3') return 'AMEX';
    if (firstDigit === '6') return 'DISCOVER';
    return 'OTRO';
}

module.exports = { luhnCheck, getBinInfo };
