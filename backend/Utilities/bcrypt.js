const bcrypt = require('bcrypt');

const miPassword = 'prueba';

bcrypt.hash(miPassword, 10, (err, hash) => {
    if (err) {
        console.error("Error al generar:", err);
    } else {
        console.log("ESTE ES TU HASH:");
        console.log(hash);
    }
});