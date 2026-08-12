
// cards_db.js
// Base de datos gratuita de tarjetas de prueba conocidas
// Nota: Estas son tarjetas de "Sandbox" o de prueba. No siempre tienen saldo real, pero pasan validaciones.

const KNOWN_TEST_CARDS = [
    {
        number: "4111111111111111",
        exp: "12/27",
        cvv: "123",
        name: "John Doe",
        zip: "10001",
        brand: "VISA",
        source: "Stripe Test"
    },
    {
        number: "5555555555554444",
        exp: "12/27",
        cvv: "123",
        name: "Jane Doe",
        zip: "90210",
        brand: "MASTERCARD",
        source: "Stripe Test"
    },
    {
        number: "378282246310005",
        exp: "12/27",
        cvv: "1234",
        name: "Amex User",
        zip: "10001",
        brand: "AMEX",
        source: "Stripe Test"
    },
    {
        number: "4532015112830306",
        exp: "12/27",
        cvv: "333",
        name: "Visa Gold",
        zip: "10001",
        brand: "VISA",
        source: "Generic Live"
    },
    {
        number: "5425233430109903",
        exp: "12/27",
        cvv: "444",
        name: "Mastercard Silver",
        zip: "10001",
        brand: "MASTERCARD",
        source: "Generic Live"
    }
];

// Función para obtener una tarjeta aleatoria de la base de datos
function getRandomCard() {
    const randomIndex = Math.floor(Math.random() * KNOWN_TEST_CARDS.length);
    return KNOWN_TEST_CARDS[randomIndex];
}

// Función para generar una tarjeta nueva (Algoritmo de Luhn)
function generateNewCard(brand = 'VISA') {
    let prefix;
    let length;
    
    if (brand === 'VISA') {
        prefix = '4';
        length = 16;
    } else if (brand === 'MASTERCARD') {
        prefix = '55';
        length = 16;
    } else if (brand === 'AMEX') {
        prefix = '37';
        length = 15;
    } else {
        prefix = '4'; // Default Visa
        length = 16;
    }

    let number = prefix;
    for (let i = prefix.length; i < length - 1; i++) {
        number += Math.floor(Math.random() * 10);
    }

    // Calcular dígito de verificación (Luhn)
    let sum = 0;
    let isEven = false;
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

    // Fecha aleatoria
    const year = new Date().getFullYear() + 1;
    const month = Math.floor(Math.random() * 12) + 1;
    const monthStr = month.toString().padStart(2, '0');
    const day = Math.floor(Math.random() * 28) + 1;
    const dayStr = day.toString().padStart(2, '0');
    const cvv = Math.floor(Math.random() * 999) + 1;

    return {
        number: number,
        exp: `${monthStr}/${year.toString().slice(-2)}`,
        cvv: cvv.toString(),
        name: "Generated User",
        zip: "10001",
        brand: brand,
        source: "Generator"
    };
}

module.exports = { getRandomCard, generateNewCard };
