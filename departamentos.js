// Ruta para obtener todos los departamentos
app.get("/departamentos", async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query("SELECT * FROM dbo.Departamentos");
      res.json(result.recordset);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los departamentos" });
    }
  });
  
  // Ruta para obtener un departamento por ID
  app.get("/departamentos/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("SELECT * FROM dbo.Departamentos WHERE ID = @id");
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
  
      res.json(result.recordset[0]);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el departamento" });
    }
  });
  
  // Ruta para crear un nuevo departamento
  app.post("/departamentos", async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("nombre", sql.VarChar, nombre)
        .input("descripcion", sql.VarChar, descripcion)
        .query(
          "INSERT INTO dbo.Departamentos (Nombre, Descripcion) VALUES (@nombre, @descripcion)"
        );
  
      res.json({ message: "Departamento creado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al crear el departamento" });
    }
  });
  
  // Ruta para actualizar un departamento por ID
  app.put("/departamentos/:id", async (req, res) => {
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
          "UPDATE dbo.Departamentos SET Nombre = @nombre, Descripcion = @descripcion WHERE ID = @id"
        );
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
  
      res.json({ message: "Departamento actualizado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el departamento" });
    }
  });
  
  // Ruta para eliminar un departamento por ID
  app.delete("/departamentos/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .query("DELETE FROM dbo.Departamentos WHERE ID = @id");
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
  
      res.json({ message: "Departamento eliminado exitosamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar el departamento" });
    }
  });
  