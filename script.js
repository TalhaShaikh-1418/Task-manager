const taskInput = document.getElementById("taskText");
const prioritySelect = document.getElementById("priority");
const reminderInput = document.getElementById("reminderTime");

function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const reminderTime = reminderInput.value;

  if (!text) return;

  const task = createTaskElement(text, priority, reminderTime);
  document.getElementById("todo-list").appendChild(task);
  saveTasks();
  taskInput.value = "";
  reminderInput.value = "";

  // Reminder set (if time provided)
  if (reminderTime) {
    const time = new Date(reminderTime).getTime() - new Date().getTime();
    if (time > 0) {
      setTimeout(() => {
        alert(`⏰ Reminder: "${text}"`);
        if (Notification.permission === "granted") {
          new Notification("Task Reminder", {
            body: text
          });
        }
      }, time);
    }
  }
}

function createTaskElement(text, priority, reminderTime = null) {
  const li = document.createElement("li");
  li.className = "task";
  li.setAttribute("data-priority", priority);
  li.setAttribute("data-reminder", reminderTime || "");
  li.innerHTML = `
    ${text}
    <button onclick="this.parentElement.remove(); saveTasks();">🗑️</button>
  `;
  return li;
}

function saveTasks() {
  const columns = ["todo-list", "progress-list", "done-list"];
  const data = {};

  columns.forEach(id => {
    const tasks = [];
    document.getElementById(id).querySelectorAll(".task").forEach(task => {
      tasks.push({
        text: task.textContent.trim().replace("🗑️", "").trim(),
        priority: task.getAttribute("data-priority"),
        reminder: task.getAttribute("data-reminder") || ""
      });
    });
    data[id] = tasks;
  });

  localStorage.setItem("tasks", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("tasks"));
  if (!data) return;

  Object.keys(data).forEach(id => {
    const list = document.getElementById(id);
    data[id].forEach(task => {
      const li = createTaskElement(task.text, task.priority, task.reminder);
      list.appendChild(li);

      // Reminder re-schedule after reload
      if (task.reminder) {
        const time = new Date(task.reminder).getTime() - new Date().getTime();
        if (time > 0) {
          setTimeout(() => {
            alert(`⏰ Reminder: "${task.text}"`);
            if (Notification.permission === "granted") {
              new Notification("Task Reminder", {
                body: task.text
              });
            }
          }, time);
        }
      }
    });
  });
}

function clearAll() {
  if (confirm("Clear all tasks?")) {
    ["todo-list", "progress-list", "done-list"].forEach(id => {
      document.getElementById(id).innerHTML = "";
    });
    saveTasks();
  }
}

// Dark mode toggle
document.getElementById("darkModeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// Ask permission for browser notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Load saved tasks
loadTasks();

// Enable drag and drop using SortableJS
["todo-list", "progress-list", "done-list"].forEach(id => {
  new Sortable(document.getElementById(id), {
    group: "shared",
    animation: 150,
    onEnd: saveTasks
  });
});
