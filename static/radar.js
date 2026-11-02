// constants
const TASK_STATUS = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete"
};

const TASK_PRIORITY = {
    LOW: "low",
    NORMAL: "normal",
    HIGH: "high"
};

const priorityToInt = {
    [TASK_PRIORITY.LOW]: 0,
    [TASK_PRIORITY.NORMAL]: 1,
    [TASK_PRIORITY.HIGH]: 2
};

// elements
const editor = {
    dialog: document.getElementById("edit-task"),
    title: document.getElementById("task-title"),
    desc: document.getElementById("task-desc"),
    priority: {
        low: document.getElementById("task-low"),
        normal: document.getElementById("task-normal"),
        high: document.getElementById("task-high")
    },
    status: {
        notStarted: document.getElementById("task-not-started"),
        inProgress: document.getElementById("task-in-progress"),
        complete: document.getElementById("task-complete")
    },
    date: document.getElementById("task-date")
};
const tagTemplates = {
    low: document.querySelector("#tag-templates .low"),
    normal: document.querySelector("#tag-templates .normal"),
    high: document.querySelector("#tag-templates .high"),
    inProgress: document.querySelector("#tag-templates .in-progress"),
    complete: document.querySelector("#tag-templates .complete"),
    notStarted: document.querySelector("#tag-templates .not-started")
};
const sortAndFilter = {
    showComplete: document.getElementById("show-complete")
};
const tasksGrid = document.getElementById("tasks-grid");

let selectedTask = null;

const loadItem = item => {
    selectedTask = item;
    editor.title.value = item.title;
    editor.desc.value = item.desc;
    editor.priority.high.checked = item.priority == TASK_PRIORITY.HIGH;
    editor.priority.normal.checked = item.priority == TASK_PRIORITY.NORMAL;
    editor.priority.low.checked = item.priority == TASK_PRIORITY.LOW;
    editor.status.notStarted.checked = item.status == TASK_STATUS.NOT_STARTED;
    editor.status.inProgress.checked = item.status == TASK_STATUS.IN_PROGRESS;
    editor.status.complete.checked = item.status == TASK_STATUS.COMPLETE;
    if(item.dueDate) {
        editor.date.valueAsDate = new Date(item.dueDate);
    } else {
        editor.date.value = "";
    }
    editor.dialog.showModal();
};

const clearEditor = () => {
    selectedTask = null;
    editor.title.value = "";
    editor.desc.value = "";
    editor.priority.high.checked = false;
    editor.priority.normal.checked = false;
    editor.priority.low.checked = true;
    editor.status.notStarted.checked = true;
    editor.status.inProgress.checked = false;
    editor.status.inProgress.checked = false;
    editor.date.valueAsDate = null;
};

// store list of items and associated elements
const tasks = [];

const buildElement = item => {

    const div = document.createElement("div");
    div.classList.add("task");

    const title = document.createElement("p");
    title.classList.add("title");
    title.textContent = item.title;
    div.append(title);

    const desc = document.createElement("p");
    desc.classList.add("desc");
    desc.textContent = item.desc;
    div.append(desc);

    if(item.priority == TASK_PRIORITY.HIGH) {
        div.append(tagTemplates.high.cloneNode(true), " ");
    } else if(item.priority == TASK_PRIORITY.NORMAL) {
        div.append(tagTemplates.normal.cloneNode(true), " ");
    } else if(item.priority == TASK_PRIORITY.LOW) {
        div.append(tagTemplates.low.cloneNode(true), " ");
    }

    if(item.status == TASK_STATUS.NOT_STARTED) {
        div.append(tagTemplates.notStarted.cloneNode(true), " ");
    } else if(item.status == TASK_STATUS.IN_PROGRESS) {
        div.append(tagTemplates.inProgress.cloneNode(true), " ");
    } else if(item.status == TASK_STATUS.COMPLETE) {
        div.append(tagTemplates.complete.cloneNode(true), " ");
    }

    div.addEventListener("click", () => loadItem(item));
    return div;

};

const fetchItems = async () => {

    const resp = await fetch("/items");
    if(!resp.ok) {
        alert(`Failed to fetch items (HTTP ${resp.status}) :(`);
    }

    const data = await resp.json();
 
    for(const task of data) {
        const element = buildElement(task);
        task.element = element;
        tasksGrid.append(element);
        tasks.push(task);
    }

    // apply default sort options
    updateGrid();

};

// apply sort and filter settings
const updateGrid = () => {
    
    // sort tasks and apply order
    const sorted = tasks.sort((a, b) => {

        // compare priority
        if(a.priority != b.priority) {
            return priorityToInt[b.priority] - priorityToInt[a.priority];
        } 

    });

    for(const i in sorted) {
        sorted[i].element.style.order = i;
    }

    // update filters
    for(const task of tasks) {
        if(sortAndFilter.showComplete.checked) {
            task.element.style.display = "";
        } else  {
            task.element.style.display = task.status == TASK_STATUS.COMPLETE ? "none" : "";
        }
    }
};

sortAndFilter.showComplete.addEventListener("input", updateGrid);

document.getElementById("edit-task-form").addEventListener("submit", async event => {

    event.preventDefault();

    const status = editor.status.notStarted.checked ? TASK_STATUS.NOT_STARTED :
                   editor.status.inProgress.checked ? TASK_STATUS.IN_PROGRESS :
                   TASK_STATUS.COMPLETE;

    const priority = editor.priority.high.checked ? TASK_PRIORITY.HIGH :
                     editor.priority.normal.checked ? TASK_PRIORITY.NORMAL :
                     TASK_PRIORITY.LOW;

    const newTask = {
        id: selectedTask?.id,
        title: editor.title.value,
        desc: editor.desc.value,
        status: status,
        dueDate: Number(editor.date.valueAsDate),
        priority: priority
    };

    const resp = await fetch("/items", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(newTask)
    });

    if(!resp.ok) {
        alert("Failed to add task :(")
    }

    // create grid entry
    const element = buildElement(newTask);
    newTask.element = element;
    tasksGrid.append(element);

    if(selectedTask) {
        selectedTask.element.remove(); // if added already, delete the old element
        Object.assign(selectedTask, newTask);
    } else {
        tasks.push(newTask); // otherwise add the task
    }    

    updateGrid();
    editor.dialog.close();

});

document.getElementById("new-task-button").addEventListener("click", () => {
    clearEditor();
    editor.dialog.showModal();
});

// prevent newlines in task title
editor.title.addEventListener("keydown", event => {
    if(event.key == "Enter") {
        event.preventDefault();
    }
});

fetchItems();