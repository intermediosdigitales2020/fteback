// Importar los métodos del archivo auth.js
const { paso1, paso2, paso3 } = require("./auth");
const cors = require('cors');
const voluntariosRoutes = require('./voluntarios.js');  // Asegúrate de que la ruta sea correcta

const express = require("express"),
    path = require("path"),
    app = express(),
    puerto = 3000;


const sql = require("mssql");

const config = {
  user: "fte",
  password: "Fundacion20.",
  server: "fte.database.windows.net", // Puede ser una dirección IP o un nombre de host
  database: "elecciones",
  options: {
    encrypt: true, // Si estás usando una conexión segura, establece esta opción en true

},
};

app.use(express.json());
app.use(cors({
  origin: '*'
}));
// Usar los métodos en las rutas de la aplicación
app.post("/registro/paso1", paso1);
app.post("/registro/paso2", paso2);
app.post("/registro/paso3", paso3);
app.use('/api', voluntariosRoutes);  // Esto añade el prefijo '/api' a todas las rutas. Puedes cambiarlo como desees.

app.get('/', (peticion, respuesta) => {
    // Podemos acceder a la petición HTTP
    let agenteDeUsuario = peticion.header("user-agent");
    respuesta.send("La ruta / solicitada con: " + agenteDeUsuario);
});
app.get('/pagina', (peticion, respuesta) => {
    // Servir archivo HTML, o cualquier otro archivo
    let rutaDeArchivo = path.join(__dirname, "plantilla.html");
    respuesta.sendFile(rutaDeArchivo);
});

app.get('/hola', (peticion, respuesta) => {
    let mascota = {
        nombre: "Maggie",
        edad: 2,
    };
    respuesta.json(mascota);
}); 


app.get('/voluntarios', async (req, res) => {
    try {
      // Realizar la consulta a la tabla dbo.Voluntarios
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT * FROM dbo.Voluntarios');
  
      // Enviar la respuesta con los datos obtenidos
      res.json(result.recordset);
    } catch (error) {
      console.error("Error al obtener los datos de la tabla Voluntarios: ", error);
      res.status(500).json({ error: "Error al obtener los datos de la tabla Voluntarios" });
    }
  });

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

// Una vez definidas nuestras rutas podemos iniciar el servidor
app.listen(puerto, async (err) => {
  if (err) {
    // Aquí manejar el error
    console.error("Error escuchando: ", err);
    return;
  }

  try {
    sql.on("error", (err) => {
        console.error("Error en SQL Server:", err);
      });
    // Realizar  la conexión a SQL Server
    await sql.connect(config);
    console.log("Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error en la conexión a la base de datos: ", error);
  }

  console.log(`Escuchando en el puerto :${puerto}`);
});