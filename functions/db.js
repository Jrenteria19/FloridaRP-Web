const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 5,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const createConnection = async () => {
  try {
    console.log('Intentando conectar a TiDB...');
    
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: parseInt(process.env.TIDB_PORT),
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    console.log('Conexión exitosa a TiDB');
    return connection;

  } catch (error) {
    console.error('Error de conexión:', {
      message: error.message,
      code: error.code,
      errno: error.errno
    });
    throw new Error(`Error de conexión a la base de datos: ${error.message}`);
  }
};

// Función para probar la conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Variables de entorno:', {
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      database: process.env.TIDB_DATABASE
    });
    console.log('Conexión exitosa a TiDB');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error de conexión detallado:', {
      message: error.message,
      code: error.code,
      state: error.sqlState
    });
    return false;
  }
};

module.exports = { pool, testConnection, createConnection };