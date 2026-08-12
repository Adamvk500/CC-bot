// validator.js
const axios = require('axios');

// Verificar algoritmo de Luhn (Matemática básica de tarjetas)
function luhnCheck(num) {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i]);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return (sum % 10) === 0;
}

// Obtener info del BIN (Banco, País, Marca)
async function getBinInfo(cardNumber) {
    const bin = cardNumber.slice(0, 6); // Primeros 6 dígitos
    try {
        // Usamos una API pública gratuita de Bins
        const response = await axios.get(`https://api.binlist.net/${bin}`);
        const data = response.data;
        return {
            bank: data.bank?.name || "Desconocido",
            country: data.country?.name || "Desconocido",
            brand: data.scheme || "Desconocido",
            type: data.type || "Desconocido"
        };
    } catch (error) {
        return {
            bank: "Error",
            country: "Error",
            brand: "Visa/MC",
            type: "Error"
        };
    }
}

module.exports = { luhnCheck, getBinInfo };
