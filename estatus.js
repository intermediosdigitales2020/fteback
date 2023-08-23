// Obtener todos los estatus
app.get("/estatus", async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT * FROM dbo.Estatus");
      res.json(result.recordset);
    } catch (error) {
      console.log("Error al obtener los estatus: ", error);
      res.status(500).json({ error: "Error al obtener los estatus" });
    }
  });
  
  // Obtener un estatus por su ID
  app.get("/estatus/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM dbo.Estatus WHERE Id = @id");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Estatus no encontrado" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      console.log("Error al obtener el estatus: ", error);
      res.status(500).json({ error: "Error al obtener el estatus" });
    }
  });
  
  // Agregar un nuevo estatus
  app.post("/estatus", async (req, res) => {
    const { Name } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("Name", sql.VarChar, Name)
        .query("INSERT INTO dbo.Estatus (Name) VALUES (@Name)");
  
      res.json({ message: "Estatus agregado exitosamente" });
    } catch (error) {
      console.log("Error al agregar el estatus: ", error);
      res.status(500).json({ error: "Error al agregar el estatus" });
    }
  });
  
  // Actualizar un estatus por su ID
  app.put("/estatus/:id", async (req, res) => {
    const { id } = req.params;
    const { Nombre, Descripcion } = req.body;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("Nombre", sql.VarChar, Nombre)
        .input("Descripcion", sql.VarChar, Descripcion)
        .query("UPDATE dbo.Estatus SET Nombre = @Nombre, Descripcion = @Descripcion WHERE Id = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Estatus no encontrado" });
      }
  
      res.json({ message: "Estatus actualizado exitosamente" });
    } catch (error) {
      console.log("Error al actualizar el estatus: ", error);
      res.status(500).json({ error: "Error al actualizar el estatus" });
    }
  });
  
  // Eliminar un estatus por su ID
  app.delete("/estatus/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM dbo.Estatus WHERE Id = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Estatus no encontrado" });
      }
  
      res.json({ message: "Estatus eliminado exitosamente" });
    } catch (error) {
      console.log("Error al eliminar el estatus: ", error);
      res.status(500).json({ error: "Error al eliminar el estatus" });
    }
  });
  