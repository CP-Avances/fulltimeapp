import { Pool } from 'pg';

export const pool = new Pool({
    user: 'fulltime',
    host: '192.168.0.156',
    password: 'fulltime',
    database: 'fulltime4.0',
    port: 5432
});

pool.query('Select now()', (err, res) => {
    if (err) {
        console.log('Error durante la conexion', err);
    } else {
        console.log('Conexion exitosa BDD');
    }
})