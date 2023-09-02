import { Pool } from 'pg';

export const pool = new Pool({
    user: 'fulltime',
    host: '186.4.226.49',
    password: 'fulltime',
    database: 'fulltime4',
    port: 9192

    /*user: 'postgres',
    host: 'localhost',
    password: '123456',
    database: 'fulltime4',
    port: 5432*/
});

pool.query('Select now()', (err, res) => {
    if (err) {
        console.log('Error durante la conexion', err);
    } else {
        console.log('Conexion exitosa BDD');
    }
})