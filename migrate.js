const Database = require("better-sqlite3");
const dbNew = new Database("data/radar-rev2.db");
const dbOld = new Database("data/radar.db");

const insert = dbNew.prepare("INSERT INTO tasks (id,title,desc,status,dueDate,priority,createDate) VALUES (?,?,?,?,?,?,?)")

dbOld.prepare("SELECT * FROM tasks").all().forEach(row => {
    console.log(row)
    insert.run(row.id, row.title, row.desc, row.status, row.dueDate, row.important == 'true' ? 'high' : 'low', row.createDate)
});