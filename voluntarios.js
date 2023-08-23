const sql = require("mssql");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const express = require('express');
const router = express.Router();
    path = require("path"),
    app = express(),
    puerto = 3000;


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
  
// Ruta para obtener todos los voluntarios
app.get("/voluntarios", async (req, res) => {
console.log("ingreso")
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT * FROM dbo.Voluntarios");
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los voluntarios" });
    }
  });
  
  // Ruta para obtener un voluntario por ID
  app.get("/voluntarios/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM dbo.Voluntarios WHERE ID = @id");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Voluntario no encontrado" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el voluntario" });
    }
  });
  
 // Eliminar un voluntario:
app.delete("/voluntarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM dbo.Voluntarios WHERE ID = @id");
    res.json({ message: "Voluntario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el voluntario" });
  }
});

// 2. Obtener Voluntarios basados en su aprobación

// Aprobados:
app.get("/voluntarios/aprobados", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query("SELECT * FROM dbo.Voluntarios WHERE Voluntario_Aprobado = 1");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los voluntarios aprobados" });
  }
});

// No Aprobados:
app.get("/voluntarios/noaprobados", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query("SELECT * FROM dbo.Voluntarios WHERE Voluntario_Aprobado = 0");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los voluntarios no aprobados" });
  }
});

// 3. Cambiar estado de aprobación de un voluntario
app.put("/voluntarios/cambiarAprobacion/:id", async (req, res) => {
  const { id } = req.params;
  const { Voluntario_Aprobado } = req.body; 

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("id", sql.Int, id)
      .input("Voluntario_Aprobado", sql.Bit, Voluntario_Aprobado)
      .query("UPDATE dbo.Voluntarios SET Voluntario_Aprobado = @Voluntario_Aprobado WHERE ID = @id");
    res.json({ message: "Estado de aprobación actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado de aprobación" });
  }
});

// Crear un nuevo voluntario:
app.post("/voluntarios", async (req, res) => {
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

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("Voluntario_CC", sql.NVarChar, Voluntario_CC)
      .input("Voluntario_Nombre", sql.NVarChar, Voluntario_Nombre)
      .input("Voluntario_Telefono", sql.NVarChar, Voluntario_Telefono)
      .input("Voluntario_Direccion", sql.NVarChar, Voluntario_Direccion)
      .input("Voluntario_Ciudad_ID", sql.Int, Voluntario_Ciudad_ID)
      .input("Voluntario_Email", sql.NVarChar, Voluntario_Email)
      .input("Voluntario_Partido_ID", sql.Int, Voluntario_Partido_ID)
      .input("Voluntario_Miembro_ID", sql.Int, Voluntario_Miembro_ID)
      .input("Voluntario_Token", sql.NVarChar, Voluntario_Token)
      .input("Voluntario_Aprobado", sql.Bit, Voluntario_Aprobado)
      .input("Voluntario_Activo", sql.Bit, Voluntario_Activo)
      .input("Voluntario_Tipo_ID", sql.Int, Voluntario_Tipo_ID)
      .input("Voluntario_Commentarios", sql.NVarChar, Voluntario_Commentarios)
      .input("Voluntario_Estatus_ID", sql.Int, Voluntario_Estatus_ID)
      .query(`INSERT INTO dbo.Voluntarios 
              (Voluntario_CC, Voluntario_Nombre, Voluntario_Telefono, Voluntario_Direccion, Voluntario_Ciudad_ID, Voluntario_Email, Voluntario_Partido_ID, Voluntario_Miembro_ID, Voluntario_Token, Voluntario_Aprobado, Voluntario_Activo, Voluntario_Tipo_ID, Voluntario_Commentarios, Voluntario_Estatus_ID) 
              VALUES (@Voluntario_CC, @Voluntario_Nombre, @Voluntario_Telefono, @Voluntario_Direccion, @Voluntario_Ciudad_ID, @Voluntario_Email, @Voluntario_Partido_ID, @Voluntario_Miembro_ID, @Voluntario_Token, @Voluntario_Aprobado, @Voluntario_Activo, @Voluntario_Tipo_ID, @Voluntario_Commentarios, @Voluntario_Estatus_ID)`);
    
    res.status(201).json({ message: "Voluntario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el voluntario" });
  }
});
// Actualizar un voluntario:
app.put("/voluntarios/:id", async (req, res) => {
  const { id } = req.params;
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

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input("id", sql.Int, id)
      .input("Voluntario_CC", sql.NVarChar, Voluntario_CC)
      .input("Voluntario_Nombre", sql.NVarChar, Voluntario_Nombre)
      .input("Voluntario_Telefono", sql.NVarChar, Voluntario_Telefono)
      .input("Voluntario_Direccion", sql.NVarChar, Voluntario_Direccion)
      .input("Voluntario_Ciudad_ID", sql.Int, Voluntario_Ciudad_ID)
      .input("Voluntario_Email", sql.NVarChar, Voluntario_Email)
      .input("Voluntario_Partido_ID", sql.Int, Voluntario_Partido_ID)
      .input("Voluntario_Miembro_ID", sql.Int, Voluntario_Miembro_ID)
      .input("Voluntario_Token", sql.NVarChar, Voluntario_Token)
      .input("Voluntario_Aprobado", sql.Bit, Voluntario_Aprobado)
      .input("Voluntario_Activo", sql.Bit, Voluntario_Activo)
      .input("Voluntario_Tipo_ID", sql.Int, Voluntario_Tipo_ID)
      .input("Voluntario_Commentarios", sql.NVarChar, Voluntario_Commentarios)
      .input("Voluntario_Estatus_ID", sql.Int, Voluntario_Estatus_ID)
      .query(`UPDATE dbo.Voluntarios SET 
              Voluntario_CC = @Voluntario_CC, 
              Voluntario_Nombre = @Voluntario_Nombre, 
              Voluntario_Telefono = @Voluntario_Telefono, 
              Voluntario_Direccion = @Voluntario_Direccion, 
              Voluntario_Ciudad_ID = @Voluntario_Ciudad_ID, 
              Voluntario_Email = @Voluntario_Email, 
              Voluntario_Partido_ID = @Voluntario_Partido_ID, 
              Voluntario_Miembro_ID = @Voluntario_Miembro_ID, 
              Voluntario_Token = @Voluntario_Token, 
              Voluntario_Aprobado = @Voluntario_Aprobado, 
              Voluntario_Activo = @Voluntario_Activo, 
              Voluntario_Tipo_ID = @Voluntario_Tipo_ID, 
              Voluntario_Commentarios = @Voluntario_Commentarios, 
              Voluntario_Estatus_ID = @Voluntario_Estatus_ID 
              WHERE ID = @id`);
    
    res.json({ message: "Voluntario actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el voluntario" });
  }
});

module.exports = router;
