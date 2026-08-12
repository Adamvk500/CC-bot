const axios = require('axios');

// Función para verificar el algoritmo de Luhn (Validez matemática)
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

// Función para obtener Info del BIN (Banco, País, Marca)
async function getBinInfo(cardNumber) {
    const bin = cardNumber.substring(0, 6);
    
    // API Gratuita y Estable para Bins
    const url = `https://api.binlist.net/${bin}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        return {
            bank: data.bank?.name || "Desconocido",
            country: data.country?.name || data.country?.iso2 || "Desconocido",
            brand: data.brand || "Desconocido",
            type: data.type || "Desconocido" // DEBIT, CREDIT, PREPAID
        };
    } catch (error) {
        console.log(`Error al obtener BIN ${bin}: ${error.response?.status || error.message}`);
        return {
            bank: "Cargando...",
            country: "Cargando...",
            brand: "Desconocido",
            type: "CREDIT"
        };
    }
}

module.exports = { luhnCheck, getBinInfo };
