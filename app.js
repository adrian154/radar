const Database = require("better-sqlite3");
const express = require("express");

const db = new Database("data/radar.db");
db.exec(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    desc TEXT NOT NULL,
    status TEXT NOT NULL,
    dueDate INTEGER NOT NULL,
    important TEXT NOT NULL,
    createDate INTEGER NOT NULL
)`);

const getAllStmt = db.prepare("select * from tasks");
const insertStmt = db.prepare("INSERT INTO tasks (title, desc, status, dueDate, important, createDate) VALUES (?,?,?,?,?,?)")
const updateStmt = db.prepare("UPDATE tasks SET title = ?, desc = ?, status = ?, dueDate = ?, important = ? WHERE id = ?")

const app = express();
app.use(express.static("static"));
app.use(express.json());

app.get("/items", (req, res) => {
    const items = getAllStmt.all();
    res.json(items);
});

app.post("/items", (req, res) => {
    if(req.body.id) {
        updateStmt.run(String(req.body.title), String(req.body.desc), String(req.body.status), Number(req.body.dueDate), String(Boolean(req.body.important)), req.body.id) 
    } else {
        insertStmt.run(String(req.body.title), String(req.body.desc), String(req.body.status), Number(req.body.dueDate), String(Boolean(req.body.important)), Date.now())    
    }
    res.sendStatus(200)
});

app.listen(80, () => {
    console.log("Listening!");
});