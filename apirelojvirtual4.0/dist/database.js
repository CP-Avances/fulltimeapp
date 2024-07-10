"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    /*
    user: 'fulltime',
    host: '186.4.226.49', //'186.4.226.49',
    port: 9192,
    database: 'fulltime4_juan',
    password: 'fulltime'
    */
    user: 'fulltime',
    host: '192.168.0.156',
    password: 'fulltime',
    database: 'fulltime4_empresa1',
    port: 5432
    /*user: 'postgres',
    host: 'localhost',
    password: '123456',
    database: 'fulltime4',
    port: 5432*/
});
exports.pool.query('Select now()', (err, res) => {
    if (err) {
        console.log('Error durante la conexion', err);
    }
    else {
        console.log('Conexion exitosa BDD');
    }
});
