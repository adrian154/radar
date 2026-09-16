// constants
const TASK_STATUS = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete"
};

// elements
const editor = {
    dialog: document.getElementById("edit-task"),
    title: document.getElementById("task-title"),
    desc: document.getElementById("task-desc"),
    priorityNormal: document.getElementById("task-normal"),
    priorityImportant: document.getElementById("task-important"),
    status: {
        notStarted: document.getElementById("task-not-started"),
        inProgress: document.getElementById("task-in-progress"),
        complete: document.getElementById("task-complete")
    },
    date: document.getElementById("task-date")
};
const tagTemplates = {
    important: document.querySelector("#tag-templates .important"),
    inProgress: document.querySelector("#tag-templates .in-progress"),
    complete: document.querySelector("#tag-templates .complete"),
    notStarted: document.querySelector("#tag-templates .not-started")
};
const tasksGrid = document.getElementById("tasks-grid");

let editorItemId = null;

const loadItem = item => {
    editorItemId = item.id;
    editor.title.value = item.title;
    editor.desc.value = item.desc;
    editor.priorityImportant.checked = item.important;
    editor.priorityNormal.checked = !item.important;
    editor.status.notStarted.checked = item.status == TASK_STATUS.NOT_STARTED;
    editor.status.inProgress.checked = item.status == TASK_STATUS.IN_PROGRESS;
    editor.status.complete.checked = item.status == TASK_STATUS.COMPLETE;
    editor.dialog.showModal();
};

const clearEditor = () => {
    editorItemId = null;
    editor.title.value = "";
    editor.desc.value = "";
    editor.priorityImportant.checked = false;
    editor.priorityNormal.checked = true;
    editor.status.notStarted.checked = true;
    editor.status.inProgress.checked = false;
    editor.status.inProgress.checked = false;
    editor.date.valueAsDate = null;
};

const fetchItems = async () => {

    const resp = await fetch("/items");
    if(!resp.ok) {
        alert(`Failed to fetch items (HTTP ${resp.status}) :(`);
    }

    const data = await resp.json();
    for(const item of data) {

        item.important = JSON.parse(item.important);

        const div = document.createElement("div");
        div.classList.add("task");
        tasksGrid.append(div);

        const title = document.createElement("p");
        title.classList.add("title");
        title.textContent = item.title;
        div.append(title);

        const desc = document.createElement("p");
        desc.classList.add("desc");
        desc.textContent = item.desc;
        div.append(desc);

        if(item.important) {
            div.append(tagTemplates.important.cloneNode(true), " ");
        }

        if(item.status == TASK_STATUS.NOT_STARTED) {
            div.append(tagTemplates.notStarted.cloneNode(true), " ");
        } else if(item.status == TASK_STATUS.IN_PROGRESS) {
            div.append(tagTemplates.inProgress.cloneNode(true), " ");
        } else if(item.status == TASK_STATUS.COMPLETE) {
            div.append(tagTemplates.complete.cloneNode(true), " ");
        }

        div.addEventListener("click", () => loadItem(item));

    }

};

document.getElementById("edit-task-form").addEventListener("submit", async event => {

    event.preventDefault();

    const status = editor.status.notStarted.checked ? "not_started" :
                   editor.status.inProgress.checked ? "in_progress" :
                   "complete";

    const resp = await fetch("/items", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            id: editorItemId,
            title: editor.title.value,
            desc: editor.desc.value,
            status: status,
            dueDate: Number(editor.date.valueAsDate),
            important: editor.priorityImportant.checked
        })
    });

    if(!resp.ok) {
        alert("Failed to add task :(")
    }

    location.reload();

});

document.getElementById("new-task-button").addEventListener("click", () => {
    clearEditor();
    editor.dialog.showModal();
});

fetchItems();