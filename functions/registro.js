const pool = require('./db');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    const data = JSON.parse(event.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const connection = await pool.getConnection();
    
    try {
      await connection.query(
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

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Registro completado' })
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Error en el registro' })
    };
  }
};