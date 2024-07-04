"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: 'fulltime',
    host: 'localhost',
    password: 'fulltime',
    database: 'fulltime4_juan',
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
