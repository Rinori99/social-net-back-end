const Pool = require('pg').Pool

const pool = new Pool({
    user: 'YOUR_USER',
    host: 'localhost',
    password: 'YOUR_PASSWORD',
    port: 5432,
    database: 'social',
});

export default pool;