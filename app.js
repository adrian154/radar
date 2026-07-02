const Database = require("better-sqlite3");
const express = require("express");

/*
 * brief explanation of organizational scheme:
 *   - an item is something that requires some sort of action
 *   - the description provides context on what the task is
 *   - each item may be a Task or an Event
 *      - Tasks are things that need to be worked on and submitted, possibly before some deadline
 *      - Events require my presence at some specific time and date
 *   - a task's priority signals how important it is
 *      - HIGH: things where something bad will happen if not addressed promptly
 *      - medium: things that should be addressed urgently, but don't demand immediate attention
 *      - low: things that can be done whenever
 *   - a task's status indicates its completion
 *      - outstanding: task has not been begun
 *      - in progress: task has been begun, but not completed yet
 *      - dismissed: task is no longer
 */
const db = new Database("data/radar.db");
db.exec(`CREATE TABLE IF NOT EXISTS items (
    desc TEXT NOT NULL,
    class TEXT NOT NULL,
    status TEXT NOT NULL,
    dateOptions TEXT NOT NULL,
    priority TEXT NOT NULL,
    createTimestamp INTEGER NOT NULL
)`);

const getAllStmt = db.prepare("select * from items");

const app = express();
app.use(express.static("static"));

app.get("/items", (req, res) => {
    const items = getAllStmt.all();
    for(const item of items) {
        item.dateOptions = JSON.parse(item.dateOptions);
    }
    res.json(items);
});

app.listen(80, () => {
    console.log("Listening!");
});