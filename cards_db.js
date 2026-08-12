function generateNewCard(brand) {
    let number = '';
    let prefix = '';
    let length = 16;

    if (brand === 'VISA') {
        prefix = '4';
        length = 16;
    } else if (brand === 'MASTERCARD') {
        prefix = '5'; // O '2' para las nuevas MC
        length = 16;
    } else if (brand === 'AMEX') {
        prefix = '37'; // O '34'
        length = 15;
    }

    // Generar dígitos aleatorios hasta llegar al tamaño
    for (let i = 1; i < length - 1; i++) {
        number += Math.floor(Math.random() * 10);
    }
    
    number = prefix + number;

    // Añadir dígito final de Luhn
    let sum = 0;
    let isEven = true; // Empieza en True porque el último dígito aún no está
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

    // Generar Fecha y CVV aleatorios
    const year = new Date().getFullYear() + 1;
    const month = Math.floor(Math.random() * 12) + 1;
    const exp = `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
    
    const cvvLength = brand === 'AMEX' ? 4 : 3;
    const cvv = Array.from({length: cvvLength}, () => Math.floor(Math.random() * 10)).join('');

    return {
        number: number,
        exp: exp,
        cvv: cvv,
        brand: brand,
        name: `${brand} User`,
        zip: "10001",
        source: "Generada"
    };
}

// Función para obtener una tarjeta aleatoria de una base de datos "estática" si quieres
function getRandomCard() {
    const cards = [
        { number: '4532015112830366', exp: '12/27', cvv: '123', brand: 'VISA', name: 'John Doe', zip: '90210', source: 'DB' },
        { number: '5425233430109903', exp: '05/26', cvv: '456', brand: 'MASTERCARD', name: 'Jane Smith', zip: '30301', source: 'DB' },
        { number: '378282246310005', exp: '11/28', cvv: '1234', brand: 'AMEX', name: 'Amex User', zip: '10001', source: 'DB' }
    ];
    return cards[Math.floor(Math.random() * cards.length)];
}

module.exports = { getRandomCard, generateNewCard };
