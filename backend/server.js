const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const db = new sqlite3.Database("sacredflame.db");

app.use(cors());
app.use(express.json());

// crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game TEXT,
    user TEXT,
    rating INTEGER,
    comment TEXT
)`);

// Obtener reviews de un juego específico
app.get("/reviews/:game", (req, res) => {
  db.all(
    "SELECT * FROM reviews WHERE game = ?",
    [req.params.game],
    (err, rows) => {
      res.json(rows);
    }
  );
});

// Agregar una nueva review
app.post("/reviews", (req, res) => {
  const { game, user, rating, comment } = req.body;
  db.run(
    "INSERT INTO reviews (game, user, rating, comment) VALUES (?, ?, ?, ?)",
    [game, user, rating, comment],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Actualizar una review
app.put("/reviews/:id", (req, res) => {
  const { rating, comment } = req.body;
  db.run(
    "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?",
    [rating, comment, req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      //res.json({ changes: this.changes });
      res.json({ updated: this.changes });
    }
  );
});

// Elimninar una review
app.delete("/reviews/:id", (req, res) => {
  db.run("DELETE FROM reviews WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// Reporte simple (descargar .txt)
app.get("/report/:game", (req, res) => {
  db.all(
    "SELECT * FROM reviews WHERE game = ?",
    [req.params.game],
    (err, rows) => {
      let txt = rows
        .map(
          (r) =>
            `Juego: ${r.game} | Usuario: ${r.user} | Calificación: ${r.rating} | Comentario: ${r.comment}`
        )
        .join("\n");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=report-${req.params.game}.txt`
      );
      res.type("text/plain").send(txt);
    }
  );
});

app.listen(3000, () =>
  console.log("Servidor corriendo en http://localhost:3000")
);
