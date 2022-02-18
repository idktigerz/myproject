var pg = require('pg');

const connectionString = process.env.DATABASE_URL
const Pool = pg.Pool
const pool = (() => {
    if (process.env.NODE_ENV !== 'production') {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: false
        });
    } else {
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
              }
        });
} })();
module.exports = pool