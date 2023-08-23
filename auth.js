const sql = require("mssql");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const config = {
    user: "sa",
    password: "imdsas2018",
    server: "MSI", // Puede ser una dirección IP o un nombre de host
    database: "elecciones",
    options: {
      encrypt: false, // Si estás usando una conexión segura, establece esta opción en true
  
  },
  };

  const transporter = nodemailer.createTransport({
    // Configuración para el envío de correos simulado con Ethereal
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: "fte@intermediosdigitales.com.co",
      pass: "Fte2023.*",
    },
  });
  
  // Función para generar el código OTP
  function generateOTP() {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
  
  let otpCodes = {}; // Almacenar códigos OTP para cada correo electrónico
  
  // Paso 1: Enviar código OTP al correo electrónico
  async function paso1(req, res) {
    console.log(req.body)
    const { correoElectronico } = req.body;
  
    try {
      const pool = await sql.connect(config);
  
      // Verificar si el correo electrónico ya está registrado
      const checkEmailResult = await pool
        .request()
        .input("correoElectronico", sql.VarChar, correoElectronico)
        .query("SELECT COUNT(*) AS count FROM dbo.Voluntarios WHERE Voluntario_Email = @correoElectronico");
  
      const emailExists = checkEmailResult.recordset[0].count > 0;
  
      if (emailExists) {
        return res.status(409).json({ error: "El correo electrónico ya está registrado" });
      }
  
      // Generar el código OTP
      const otp = generateOTP();
  
      // Enviar el código OTP por correo electrónico
      const mailOptions = {
        from: "fte@intermediosdigitales.com.co", // Remitente (tu dirección simulada)
        to: correoElectronico, // Destinatario (el correo proporcionado por el usuario)
        subject: "Confirmación de registro en Fundación de Transparencia Electoral",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1e3a8a;">Fundación de Transparencia Electoral</h2>
            <p>Tu código de confirmación es:</p>
            <p style="font-size: 24px; font-weight: bold; background-color: #f1f1f1; padding: 10px;">${otp}</p>
            <p>Ingresa este código en la página de registro para completar tu registro en nuestra plataforma.</p>
            <p>Visita nuestra página web: <a href="http://www.fte.com.co" target="_blank" style="color: #1e3a8a; text-decoration: none;">www.fte.com.co</a></p>
            <p>Gracias por registrarte en Fundación de Transparencia Electoral.</p>
          </div>
        `,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error al enviar el correo: ", error);
          return res.status(500).json({ error: "Error al enviar el código de verificación" });
        }
        console.log("Código de verificación enviado: ", info.messageId);
  
        // Almacenar el código OTP junto con el correo electrónico en la memoria del servidor
        otpCodes[correoElectronico] = otp;
        res.json({ message: "Código de verificación enviado exitosamente" });
      });
    } catch (error) {
      console.log("Error en el registro del usuario: ", error);
      res.status(500).json({ error: "Error en el registro del usuario" });
    }
  }
  
  // Paso 2: Verificar código OTP
  function paso2(req, res) {
    const { correoElectronico, codigoOTP } = req.body;
  
    // Verificar si el código OTP coincide con el código almacenado en la memoria del servidor
    if (otpCodes[correoElectronico] && otpCodes[correoElectronico] === codigoOTP) {
      // Código correcto
      delete otpCodes[correoElectronico]; // Eliminar el código almacenado para evitar reutilizaciones
      res.json({ message: "Código de verificación válido" });
    } else {
      // Código incorrecto
      res.status(401).json({ error: "Código de verificación inválido" });
    }
  }
  
  // Paso 3: Registro completo
  async function paso3(req, res) {
    const { 
        Voluntario_CC,
        Voluntario_Nombre,
        Voluntario_Telefono,
        Voluntario_Direccion,
        Voluntario_Ciudad_ID,
        Voluntario_Email,
        Voluntario_Partido_ID,
        Voluntario_Miembro_ID,
        Voluntario_Token,
        Voluntario_Aprobado,
        Voluntario_Activo,
        Voluntario_Tipo_ID,
        Voluntario_Commentarios,
        Voluntario_Estatus_ID
    } = req.body;

    // Convertir Voluntario_CC a int
    const Voluntario_ID = parseInt(Voluntario_CC);

    // Validación para asegurarse de que Voluntario_CC es convertible a int
    if (isNaN(Voluntario_ID)) {
        return res.status(400).json({ error: "El Voluntario_CC no es válido o no es convertible a número." });
    }

    try {
        const pool = await sql.connect(config);
    
        // Verificar si el correo electrónico ya está registrado
        const checkEmailResult = await pool
            .request()
            .input("Voluntario_Email", sql.VarChar, Voluntario_Email)
            .query("SELECT COUNT(*) AS count FROM dbo.Voluntarios WHERE Voluntario_Email = @Voluntario_Email");
    
        const emailExists = checkEmailResult.recordset[0].count > 0;
    
        if (emailExists) {
            return res.status(409).json({ error: "El correo electrónico ya está registrado" });
        }
    
        // Insertar el registro del usuario en la base de datos
        const insertResult = await pool
            .request()
            .input("Voluntario_ID", sql.Int, Voluntario_ID)
            .input("Voluntario_CC", sql.VarChar, Voluntario_CC)
            .input("Voluntario_Nombre", sql.VarChar, Voluntario_Nombre)
            .input("Voluntario_Telefono", sql.VarChar, Voluntario_Telefono)
            .input("Voluntario_Direccion", sql.VarChar, Voluntario_Direccion)
            .input("Voluntario_Ciudad_ID", sql.Int, Voluntario_Ciudad_ID)
            .input("Voluntario_Email", sql.VarChar, Voluntario_Email)
            .input("Voluntario_Partido_ID", sql.Int, Voluntario_Partido_ID)
            .input("Voluntario_Miembro_ID", sql.Int, Voluntario_Miembro_ID)
            .input("Voluntario_Token", sql.VarChar, Voluntario_Token)
            .input("Voluntario_Aprobado", sql.Bit, Voluntario_Aprobado)
            .input("Voluntario_Activo", sql.Bit, Voluntario_Activo)
            .input("Voluntario_Tipo_ID", sql.Int, Voluntario_Tipo_ID)
            .input("Voluntario_Commentarios", sql.VarChar, Voluntario_Commentarios)
            .input("Voluntario_Estatus_ID", sql.Int, Voluntario_Estatus_ID)
            .query(`
                INSERT INTO dbo.Voluntarios (
                  Voluntario_ID, Voluntario_CC, Voluntario_Nombre, Voluntario_Telefono, Voluntario_Direccion,
                  Voluntario_Ciudad_ID, Voluntario_Email, Voluntario_Partido_ID,
                  Voluntario_Miembro_ID, Voluntario_Token, Voluntario_Aprobado,
                  Voluntario_Activo, Voluntario_Tipo_ID, Voluntario_Commentarios, 
                  Voluntario_Estatus_ID
                ) VALUES (
                    @Voluntario_ID, @Voluntario_CC, @Voluntario_Nombre, @Voluntario_Telefono, @Voluntario_Direccion,
                    @Voluntario_Ciudad_ID, @Voluntario_Email, @Voluntario_Partido_ID,
                    @Voluntario_Miembro_ID, @Voluntario_Token, @Voluntario_Aprobado,
                    @Voluntario_Activo, @Voluntario_Tipo_ID, @Voluntario_Commentarios, 
                    @Voluntario_Estatus_ID
                )
            `);
    
        res.json({ message: "Voluntario registrado exitosamente" });
    } catch (error) {
        console.log("Error en el registro del voluntario: ", error);
        res.status(500).json({ error: "Error en el registro del voluntario" });
    }
}
  
  module.exports = {
    paso1,
    paso2,
    paso3,
  };