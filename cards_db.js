// Función auxiliar para generar una fecha futura aleatoria
function generateFutureDate() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    
    // Generar un año entre este año y +3 años
    const futureYear = currentYear + Math.floor(Math.random() * 4); 
    const futureMonth = Math.floor(Math.random() * 12) + 1;
    
    // Formato MM/YY
    const mm = futureMonth.toString().padStart(2, '0');
    const yy = futureYear.toString().slice(-2);
    
    return { exp: `${mm}/${yy}`, year: futureYear };
}

function generateNewCard(brand) {
    let number = '';
    let prefix = '';
    let length = 16;

    if (brand === 'VISA') {
        prefix = '4';
        length = 16;
    } else if (brand === 'MASTERCARD') {
        prefix = '5'; 
        length = 16;
    } else if (brand === 'AMEX') {
        prefix = '37'; 
        length = 15;
    }

    // Generar dígitos aleatorios
    for (let i = 1; i < length - 1; i++) {
        number += Math.floor(Math.random() * 10);
    }
    
    number = prefix + number;

    // Calcular dígito Luhn
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

    // Generar Fecha FUTURE
    const dateInfo = generateFutureDate();
    const cvvLength = brand === 'AMEX' ? 4 : 3;
    const cvv = Array.from({length: cvvLength}, () => Math.floor(Math.random() * 10)).join('');

    return {
        number: number,
        exp: dateInfo.exp,
        cvv: cvv,
        brand: brand,
        name: `${brand} User`,
        zip: "10001",
        source: "Generada"
    };
}

// Función para obtener una tarjeta estática con fecha CORREGIDA
function getRandomCard() {
    const brands = ['VISA', 'MASTERCARD', 'AMEX'];
    const randomBrand = brands[Math.floor(Math.random() * brands.length)];
    
    // Generamos una tarjeta nueva cada vez en lugar de usar una estática vieja
    return generateNewCard(randomBrand);
}

module.exports = { getRandomCard, generateNewCard };
