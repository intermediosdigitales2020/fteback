// Ruta para obtener todas las ciudades
app.get("/ciudades", async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT * FROM dbo.Ciudades");
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las ciudades" });
    }
  });
  
  // Ruta para obtener una ciudad por ID
  app.get("/ciudades/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM dbo.Ciudades WHERE ID = @id");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Ciudad no encontrada" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la ciudad" });
    }
  });
  
  // Ruta para crear una nueva ciudad
  app.post("/ciudades", async (req, res) => {
    const { nombre, codigoPostal } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("nombre", sql.VarChar, nombre)
        .input("codigoPostal", sql.VarChar, codigoPostal)
        .query(
          "INSERT INTO dbo.Ciudades (Nombre, CodigoPostal) VALUES (@nombre, @codigoPostal)"
        );
  
      res.json({ message: "Ciudad creada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al crear la ciudad" });
    }
  });
  
  // Ruta para actualizar una ciudad por ID
  app.put("/ciudades/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, codigoPostal } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.VarChar, nombre)
        .input("codigoPostal", sql.VarChar, codigoPostal)
        .query(
          "UPDATE dbo.Ciudades SET Nombre = @nombre, CodigoPostal = @codigoPostal WHERE ID = @id"
        );
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Ciudad no encontrada" });
      }
  
      res.json({ message: "Ciudad actualizada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la ciudad" });
    }
  });
  
  // Ruta para eliminar una ciudad por ID
  app.delete("/ciudades/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM dbo.Ciudades WHERE ID = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Ciudad no encontrada" });
      }
  
      res.json({ message: "Ciudad eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar la ciudad" });
    }
  });
  