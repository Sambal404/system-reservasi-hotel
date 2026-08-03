// /src/utils/generateReservationCode.js

const crypto = require('crypto');

function generateReservationCode(prefix = "RES") {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();

    return `${prefix}-${date}-${random}`;
}

module.exports = generateReservationCode; 
