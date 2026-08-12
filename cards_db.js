// cards_db.js

// Genera una fecha futura aleatoria (para que no estén expiradas)
function getFutureDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Generar una fecha entre 1 y 3 años en el futuro
    const randomYear = year + Math.floor(Math.random() * 3);
    const randomMonth = Math.floor(Math.random() * 12) + 1;
    
    const mm = randomMonth.toString().padStart(2, '0');
    const yy = randomYear.toString().slice(-2);
    
    return `${mm}/${yy}`;
}

// Genera una tarjeta válida matemáticamente (Algoritmo de Luhn)
function generateValidCard(brand) {
    let prefix = '';
    let length = 16;
    let name = '';
    let zip = '';

    if (brand === 'VISA') {
        prefix = '4';
        name = 'John Doe';
        zip = '90210'; // Beverly Hills
    } else if (brand === 'MASTERCARD') {
        prefix = '5';
        name = 'Jane Smith';
        zip = '10001'; // New York
    } else if (brand === 'AMEX') {
        prefix = '37';
        length = 15;
        name = 'Amex Holder';
        zip = '94102'; // San Francisco
    }

    // Generar números aleatorios
    let number = prefix;
    for (let i = 1; i < length - 1; i++) {
        number += Math.floor(Math.random() * 10);
    }

    // Calcular dígito final (Luhn)
    let sum = 0;
    let isEven = true;
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    number += checkDigit;

    // Generar CVV
    const cvvLength = brand === 'AMEX' ? 4 : 3;
    const cvv = Array.from({length: cvvLength}, () => Math.floor(Math.random() * 10)).join('');

    return {
        number: number,
        exp: getFutureDate(),
        cvv: cvv,
        brand: brand,
        name: name,
        zip: zip,
        source: "Generada (Luhn)"
    };
}

// Función principal para obtener una tarjeta aleatoria
function getRandomCard() {
    const brands = ['VISA', 'MASTERCARD', 'AMEX'];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    return generateValidCard(randomBrand);
}

module.exports = { getRandomCard };
