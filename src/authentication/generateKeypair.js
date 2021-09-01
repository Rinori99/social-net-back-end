const crypto = require('crypto');
const fs = require('fs');
const path = require('path');


function generateKeyPair() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, // bits - standard for RSA keys
        publicKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1" 
            format: 'pem' // Most common formatting choice
        },
        privateKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1"
            format: 'pem' // Most common formatting choice
        }
    });

    fs.writeFileSync(path.join(__dirname, 'id_rsa_pub.pem'), keyPair.publicKey);

    fs.writeFileSync(path.join(__dirname, '/id_rsa_priv.pem'), keyPair.privateKey);
}

generateKeyPair();