// Importamos las librerías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const jsonParser = bodyParser.json();

// Conectar a SQLite y crear la tabla "todos" si no existe
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) console.error('Error creando la tabla:', err.message);
        else console.log('Tabla "todos" creada o ya existente.');
    });
});

// Endpoint POST para agregar tareas (agrega_todo)
app.post('/agrega_todo', jsonParser, (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        res.status(400).json({ error: 'El campo "todo" es requerido.' });
        return;
    }

    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, ?)');
    stmt.run(todo, timestamp, (err) => {
        if (err) {
            console.error('Error al insertar:', err);
            res.status(500).json({ error: 'Error al guardar la tarea.' });
            return;
        }
        console.log('Tarea agregada exitosamente.');
        res.status(201).json({ status: 'Tarea agregada', todo, created_at: timestamp });
    });
    stmt.finalize();
});

// Endpoint GET para verificar estado del servidor
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({ status: 'ok' });
});

// Servidor corriendo en puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});