const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'rinori123',
    port: 5432,
    database: 'social',
});

export default pool;