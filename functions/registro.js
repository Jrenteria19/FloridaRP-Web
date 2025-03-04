const { pool, testConnection } = require('./db');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  // Habilitar logs detallados
  console.log('Iniciando función de registro');
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    // Probar conexión
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos');
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
    console.error('Error detallado:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Error en el registro'
      })
    };
  }
};