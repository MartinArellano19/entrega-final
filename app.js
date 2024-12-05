document.addEventListener("DOMContentLoaded", () => {
    const taskList = document.getElementById("task-list");
    const taskTitleInput = document.getElementById("task-title");
    const taskDescInput = document.getElementById("task-desc");
    const addTaskBtn = document.getElementById("add-task-btn");
    const filterSelect = document.getElementById("filter-tasks");

    const loadTasks = () => JSON.parse(localStorage.getItem("tasks")) || [];
    const saveTasks = (tasks) => localStorage.setItem("tasks", JSON.stringify(tasks));

    const displayTasks = (filter = "all") => {
        const tasks = loadTasks();
        taskList.innerHTML = "";

        const filteredTasks = tasks.filter(task =>
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "pending" && !task.completed)
        );

        if (filteredTasks.length === 0) {
            taskList.innerHTML = "<p class='text-center'>No hay tareas.</p>";
            return;
        }

        filteredTasks.forEach(task => {
            const taskHTML = `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title ${task.completed ? 'text-decoration-line-through' : ''}">
                                ${task.title}
                            </h5>
                            <p class="card-text">${task.desc}</p>
                            <button class="btn btn-${task.completed ? 'success' : 'secondary'} btn-sm toggle-complete-btn" data-id="${task.id}">
                                ${task.completed ? 'Marcar como Pendiente' : 'Marcar como Completada'}
                            </button>
                            <button class="btn btn-warning btn-sm edit-task-btn" data-id="${task.id}">Editar</button>
                            <button class="btn btn-danger btn-sm delete-task-btn" data-id="${task.id}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            taskList.innerHTML += taskHTML;
        });

        document.querySelectorAll(".toggle-complete-btn").forEach(btn =>
            btn.addEventListener("click", toggleTaskCompletion)
        );
        document.querySelectorAll(".edit-task-btn").forEach(btn =>
            btn.addEventListener("click", editTask)
        );
        document.querySelectorAll(".delete-task-btn").forEach(btn =>
            btn.addEventListener("click", deleteTask)
        );
    };

    const fetchInitialTasks = async () => {
        try {
            const response = await fetch("data/tasks.json");
            const initialTasks = await response.json();
            saveTasks(initialTasks);
            displayTasks();
        } catch (error) {
            console.error("Error al cargar las tareas iniciales:", error);
        }
    };

    const addTask = () => {
        const title = taskTitleInput.value.trim();
        const desc = taskDescInput.value.trim();
        if (!title || !desc) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Por favor, completa todos los campos.",
            });
            return;
        }

        const tasks = loadTasks();
        const newTask = {
            id: Date.now(),
            title,
            desc,
            completed: false,
        };
        tasks.push(newTask);
        saveTasks(tasks);
        displayTasks();
        taskTitleInput.value = "";
        taskDescInput.value = "";
    };

    const toggleTaskCompletion = (event) => {
        const taskId = parseInt(event.target.getAttribute("data-id"));
        const tasks = loadTasks();
        const task = tasks.find(task => task.id === taskId);
        task.completed = !task.completed;
        saveTasks(tasks);
        displayTasks(filterSelect.value);
    };

    const editTask = (event) => {
        const taskId = parseInt(event.target.getAttribute("data-id"));
        const tasks = loadTasks();
        const task = tasks.find(task => task.id === taskId);

        const newTitle = prompt("Editar título de la tarea", task.title);
        const newDesc = prompt("Editar descripción de la tarea", task.desc);

        if (newTitle) task.title = newTitle;
        if (newDesc) task.desc = newDesc;

        saveTasks(tasks);
        displayTasks(filterSelect.value);
    };

    const deleteTask = (event) => {
        const taskId = parseInt(event.target.getAttribute("data-id"));
        let tasks = loadTasks();
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks(tasks);
        displayTasks(filterSelect.value);
    };

    filterSelect.addEventListener("change", (event) => {
        displayTasks(event.target.value);
    });

    addTaskBtn.addEventListener("click", addTask);

    if (!localStorage.getItem("tasks")) {
        fetchInitialTasks();
    } else {
        displayTasks();
    }
});
