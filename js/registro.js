const { pool, testConnection } = require('./db');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  console.log('Iniciando función de registro');
  console.log('Verificando variables de entorno:', {
    hostPresente: !!process.env.TIDB_HOST,
    portPresente: !!process.env.TIDB_PORT,
    userPresente: !!process.env.TIDB_USER,
    dbPresente: !!process.env.TIDB_DATABASE
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    console.log('Probando conexión a la base de datos...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Error de conexión a la base de datos. Verifica las credenciales.');
    }

    const data = JSON.parse(event.body);
    console.log('Datos recibidos:', data);

    // Validar datos requeridos
    const requiredFields = ['nombres', 'apellidos', 'nacionalidad', 'fechaNacimiento', 
                          'lugarNacimiento', 'sexo', 'discordUser', 'password'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.query(
        `INSERT INTO ciudadanos (
          nombres, 
          apellidos, 
          nacionalidad, 
          fecha_nacimiento,
          lugar_nacimiento,
          sexo,
          discord_user,
          password,
          fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          data.nombres,
          data.apellidos,
          data.nacionalidad,
          data.fechaNacimiento,
          data.lugarNacimiento,
          data.sexo,
          data.discordUser,
          hashedPassword
        ]
      );

      console.log('Registro exitoso:', result);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: true,
          message: 'Registro completado exitosamente'
        })
      };

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error completo:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
