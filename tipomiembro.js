// Ruta para obtener todos los tipos de miembro
app.get("/tipos-miembro", async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT * FROM dbo.TipoMiembro");
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los tipos de miembro" });
    }
  });
  
  // Ruta para obtener un tipo de miembro por ID
  app.get("/tipos-miembro/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM dbo.TipoMiembro WHERE ID = @id");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Tipo de miembro no encontrado" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el tipo de miembro" });
    }
  });
  
  // Ruta para crear un nuevo tipo de miembro
  app.post("/tipos-miembro", async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("nombre", sql.VarChar, nombre)
        .input("descripcion", sql.VarChar, descripcion)
        .query(
          "INSERT INTO dbo.TipoMiembro (Nombre, Descripcion) VALUES (@nombre, @descripcion)"
        );
  
      res.json({ message: "Tipo de miembro creado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al crear el tipo de miembro" });
    }
  });
  
  // Ruta para actualizar un tipo de miembro por ID
  app.put("/tipos-miembro/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("nombre", sql.VarChar, nombre)
        .input("descripcion", sql.VarChar, descripcion)
        .query(
          "UPDATE dbo.TipoMiembro SET Nombre = @nombre, Descripcion = @descripcion WHERE ID = @id"
        );
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Tipo de miembro no encontrado" });
      }
  
      res.json({ message: "Tipo de miembro actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el tipo de miembro" });
    }
  });
  
  // Ruta para eliminar un tipo de miembro por ID
  app.delete("/tipos-miembro/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM dbo.TipoMiembro WHERE ID = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Tipo de miembro no encontrado" });
      }
  
      res.json({ message: "Tipo de miembro eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar el tipo de miembro" });
    }
  });