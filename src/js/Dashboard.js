const navMenu = document.getElementById("navbarMenu");
const sideBarButton = document.getElementById("sidebar-button");
const sidebarIcon = document.getElementById("sidebar-icon");
const sidebarContainer = document.getElementById("sidebar-container");
const userNameBanner = document.getElementById("userName");
const addTaskBtn = document.getElementById("Add-Task-Btn");
const taskCard = document.getElementById("task-card-data");
const taskContainer = document.getElementById("task-container");
const sidebarTxt = document.querySelectorAll(".sidebar-text");
const logoutBtn = document.getElementById("logout-btn");
const addTaskModalBtn = document.getElementById("task-modal");
const closeTaskModalBtn = document.getElementById("close-task");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("due-date");
const submitTaskBtn = document.getElementById("sbmt-task-btn");
const taskForm = document.getElementById("addTaskForm");
const taskButton = document.getElementById("task-button");
const timer = document.getElementById("timer");
const searchTask = document.getElementById("search-task");

const API_BASE_URL = "https://task-app-backend-cruj.onrender.com/api/v1/task";
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

document.addEventListener("DOMContentLoaded", async () => {
  getAllTasks();
  UserName();
  startCountdown();
});

let totalSeconds;
let countdownInterval;
function updateTimerDisplay(totalSeconds) {
  const min = Math.floor(totalSeconds / 60);
  const sec = totalSeconds % 60;
  const secFormat = sec <= 10 ? `0${sec}` : sec;
  timer.innerText = `${min} m:${sec} s`;
}

function startCountdown() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    location.replace("index.html");
    return;
  }
  const decodedPayload = decodeJwt(accessToken);
  totalSeconds = decodedPayload.exp;
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(() => {
    const currentTiesSeconds = Math.floor(Date.now() / 1000);
    let remainingSeconds = totalSeconds - currentTiesSeconds;

    if (userNameBanner.innerText === "Unknown" || remainingSeconds <= 0) {
      clearInterval(countdownInterval);
      location.replace("index.html");
    } else {
      updateTimerDisplay(remainingSeconds);
    }
  }, 1000);
}

let allTasks = [];
let filteredTask = [];

// from validation
function validTitle(e) {
  const inputElement = e.target;
  const titleValue = inputElement.value;
  if (titleValue.length <= 2) {
    titleInput.classList.remove("is-valid");
    titleInput.classList.add("is-invalid");
  } else {
    titleInput.classList.add("is-valid");
    titleInput.classList.remove("is-invalid");
  }
}
function validDescription(e) {
  const inputElement = e.target;
  const descriptionValue = inputElement.value;
  if (descriptionValue.length <= 3) {
    inputElement.classList.remove("is-valid");
    inputElement.classList.add("is-invalid");
  } else {
    inputElement.classList.add("is-valid");
    inputElement.classList.remove("is-invalid");
  }
}

function validDueDate(e) {
  const inputElement = e.target;
  const selectedDateString = inputElement.value;
  inputElement.isCustomInvalid = false;
  const selectedDate = new Date(selectedDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    inputElement.isCustomInvalid = true;
    inputElement.classList.add("is-invalid");
    inputElement.nextElementSibling.textContent =
      "Due date cannot be in the past.";
    inputElement.classList.remove("is-valid");
  } else {
    inputElement.classList.remove("is-invalid");
    inputElement.classList.add("is-valid");
  }
}

titleInput.addEventListener("input", (e) => {
  validTitle(e);
});
descriptionInput.addEventListener("input", (e) => {
  validDescription(e);
});

dueDateInput.addEventListener("change", (e) => {
  validDueDate(e);
});

// end of validation

// opening and closing modal for adding task
function openAddTaskModal() {
  taskForm.reset();
  taskForm.classList.remove("was-validated");
  taskForm
    .querySelectorAll(".form-control, .form-select, .form-check-input")
    .forEach((control) => {
      control.classList.remove("is-valid", "is-invalid");
    });
  addTaskModalBtn.classList.remove("d-none");
  addTaskModalBtn.classList.add("d-block");
}

function closeAddTaskModal() {
  taskForm.reset();
  taskForm.classList.remove("was-validated");
  taskForm
    .querySelectorAll(".form-control, .form-select, .form-check-input")
    .forEach((control) => {
      control.classList.remove("is-valid", "is-invalid");
    });
  addTaskModalBtn.classList.add("d-none");
  addTaskModalBtn.classList.remove("d-block");
}

addTaskBtn.addEventListener("click", openAddTaskModal);
closeTaskModalBtn.addEventListener("click", closeAddTaskModal);

//end  opening and closing modal for adding task

sideBarButton.addEventListener("click", () => {
  const isExpanded = sidebarContainer.classList.contains("sidebar-expanded");

  if (!isExpanded) {
    sidebarIcon.src = "./src/images/sidebarClose.png";

    Array.from(sidebarTxt).forEach((v) => {
      v.classList.remove("d-none");
      v.classList.add("d-inline-block");
    });
    sidebarContainer.classList.remove("sidebar-default");
    sidebarContainer.classList.add("sidebar-expanded");
  } else {
    sidebarIcon.src = "./src/images/sidebarOpen.png";
    Array.from(sidebarTxt).forEach((v) => {
      v.classList.add("d-none");
      v.classList.remove("d-inline-block");
    });
    sidebarContainer.classList.remove("sidebar-expanded");
    sidebarContainer.classList.add("sidebar-default");
  }
});

function UserName() {
  const userFullName = localStorage.getItem("userName");
  if (userFullName) {
    const userNameArray = userFullName.split(" ");
    const user = userNameArray[0];
    userNameBanner.innerText = user;
  } else {
    userNameBanner.innerText = "Unknown";
  }
}

searchTask.addEventListener("input", (e) => {
  const searched = e.target.value.toLowerCase().trim();

  const searchedTasks = allTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searched) ||
      task.description.toLowerCase().includes(searched)
  );
  renderTasks(searchedTasks);
});

document.querySelector(".sidebar-filter").addEventListener("click", (e) => {
  const clickedButton = e.target.closest("button");
  if (!clickedButton) return;
  const currentActive = document.querySelector(".sidebar-filter .active");
  if (currentActive) {
    currentActive.classList.remove("active", "text-muted", "text-light");
    const prevText = currentActive.querySelector(".sidebar-text");
    if (prevText) {
      prevText.classList.remove("text-light");
      prevText.classList.add("text-muted", "text-danger");
    }
  }
  clickedButton.classList.add("active");
  const newText = clickedButton.querySelector(".sidebar-text");
  if (newText) {
    newText.classList.remove("text-muted", "text-danger");
    newText.classList.add("text-light");
  }

  const filterTask = e.target.textContent.trim();
  switch (filterTask) {
    case "In-Process":
      filteredTask = allTasks.filter((task) => task.status === "In_Process");
      break;

    case "Completed":
      filteredTask = allTasks.filter((task) => task.status === "Completed");
      break;

    // case "Calender":
    //   break;

    default:
      filteredTask = allTasks;
      break;
  }
  renderTasks(filteredTask);
});

function displayTask(task) {
  const statusText = task.status.replace("_", " ");
  const statusColor =
    task.status === "Completed"
      ? "success"
      : task.status === "In_Process"
      ? "primary"
      : "warning";

  const today = new Date();
  const dueDate = new Date(task.dueDate);

  // Calculate difference in days (milliseconds / milliseconds_per_day)
  const msInDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / msInDay);
  let dueDateText = "";
  let dueDateClass = "bg-secondary";
  if (daysLeft < 0) {
    dueDateText = "Overdue";
    dueDateClass = "bg-danger"; // Visually mark as overdue
  } else if (daysLeft === 0) {
    dueDateText = "Due Today";
    dueDateClass = "bg-warning"; // Visually mark as due today
  } else {
    dueDateText = `Due in ${daysLeft}d`;
    dueDateClass = "bg-info";
  }
  return `
          <div class="col">
                            <div class="card border-2  border-${statusColor} rounded-4 h-100">
                                <div class="card-body ">
                                    <div class="d-flex">
                                        <div class="col-10 d-flex flex-column justify-content-between">
                                            <div class="d-flex align-items-start my-4">
                                                <input class="form-check-input" type="checkbox" value="${task.id}"
                                                    id="${task.id}">
                                                <div class="ps-3 pe-1">
                                                    <strong class="card-title">${task.title}</strong>
                                                    <p class="fw-6 text-muted w-75">${task.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <small class="bg-danger bg-gradient text-primary-emphasis rounded px-3 py-1">High</small>
                                                <small class="bg-${statusColor} bg-opacity-75 text-white rounded px-3 py-1 me-2">${statusText}</small>
                                                    <small class="${dueDateClass} bg-gradient text-primary-emphasis my-2 rounded px-3 py-1">${dueDateText}</small>
                                            </div>
                                        </div>
                                        <div
                                            class="col-2 d-flex flex-column justify-content-between  my-2 align-items-center" id="task-button">
                                            <button type="button" class="btn delete" id="${task.id}"><i class="bi bi-trash"></i></button>
                                           <button type="button" class="btn edit" id="${task.id}"> <i class="bi bi-pen"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
          `;
}

function updateCountDashboard(
  totalTask,
  pendingTask,
  inProcessTask,
  completedTask
) {
  document.getElementById("totalTask").innerText = totalTask;
  document.getElementById("pendingTask").innerText = pendingTask;
  document.getElementById("inProcessTask").innerText = inProcessTask;
  document.getElementById("completedTask").innerText = completedTask;
}

document.querySelector(".all-btn-group").addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const currentActive = document.querySelector(".all-btn-group .active");
  if (currentActive) {
    currentActive.classList.remove("active");
  }
  e.target.classList.add("active");

  const filterTask = e.target.textContent.trim();

  switch (filterTask) {
    case "Pending":
      filteredTask = allTasks.filter((task) => task.status === "Pending");
      break;
    case "In-Process":
      filteredTask = allTasks.filter((task) => task.status === "In_Process");
      break;
    case "Completed":
      filteredTask = allTasks.filter((task) => task.status === "Completed");
      break;

    default:
      filteredTask = allTasks;
      break;
  }

  renderTasks(filteredTask);
});

async function getAllTasks() {
  try {
    const response = await api.get("/all");
    allTasks = response.data.data || [];
    filteredTask = allTasks;
    const tasks = response.data.data;
    let totalTask = tasks.length || 0,
      pendingTask = 0,
      inProcessTask = 0,
      completedTask = 0;
    // renderTasks(tasks);
    tasks.forEach((task) => {
      if (task.status === "Pending") {
        pendingTask++;
      } else if (task.status === "In_Process") {
        inProcessTask++;
      } else if (task.status === "Completed") {
        completedTask++;
      }
    });
    renderTasks(filteredTask);

    updateCountDashboard(totalTask, pendingTask, inProcessTask, completedTask);
  } catch (error) {
    sendToastNotification(error.response, "red");
  }
}

function renderTasks(tasks) {
  if (taskContainer) {
    taskContainer.innerHTML = "";
    if (tasks.length <= 0) {
      document.querySelector(
        "#task-container"
      ).innerHTML = `<div class="col-12 text-center  py-5">
                    <p class="text-muted fs-5">No tasks found. Click the button to add a new task! </p>
                </div>`;
    } else {
      tasks.forEach((task) => {
        const taskHtml = displayTask(task);
        taskContainer.insertAdjacentHTML("beforeend", taskHtml);
      });
    }
  }
}

if (taskContainer) {
  taskContainer.addEventListener("click", (e) => {
    // debugger;
    const clickedActionBtn = e.target.closest("button");
    if (!clickedActionBtn) return;
    const taskId = Number(clickedActionBtn.id);
    if (!taskId) return;

    if (clickedActionBtn.classList.contains("delete")) {
      deleteTask(taskId);
    } else {
      editTask(taskId);
    }
  });
}

async function deleteTask(taskId) {
  const confirmDelete = confirm("Are you sure want to delete task");
  if (!confirmDelete) {
    return;
  }
  try {
    const response = await api.delete(`/${taskId}`);
    sendToastNotification(response, "green");
    getAllTasks();
  } catch (error) {
    sendToastNotification(error.response, "red");
  }
}

async function editTask(taskId) {
  openAddTaskModal();
  try {
    const response = await api.get(`/all`);
    const task = response.data.data.find((t) => t.id === Number(taskId));
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    dueDateInput.value = new Date(task.dueDate).toISOString().split("T")[0];
    taskForm.elements["status"].value = task.status;
    taskForm.dataset.editId = taskId;
  } catch (error) {
    sendToastNotification(error.response, "red");
  }
}

logoutBtn.addEventListener("click", () => {
  const confirmation = confirm("are you sure for logout");
  if (confirmation) {
    localStorage.clear();
    location.replace("index.html");
  }
});

async function submitTask(e) {
  if (!taskForm.checkValidity()) {
    taskForm.classList.add("was-validated");
    const invalidField = taskForm.querySelectorAll(".is-invalid");
    invalidField.forEach((input) => {
      input.classList.add("is-invalid");
    });

    return;
  }

  if (dueDateInput.isCustomInvalid) {
    taskForm.classList.add("was-validated");
    return;
  }

  const rawDate = dueDateInput.value;
  const isoDate = new Date(rawDate).toISOString();
  const taskData = {
    title: titleInput.value,
    description: descriptionInput.value,
    status: taskForm.elements["status"].value,
    dueDate: isoDate,
  };
  // debugger;
  const editId = taskForm.dataset.editId;
  try {
    let response;

    if (editId) {
      response = await api.put(`/${editId}`, taskData);
    } else {
      response = await api.post("/create", taskData);
    }
    sendToastNotification(response, "green");
    if (response.data.success === true) {
      closeAddTaskModal();
      delete taskForm.dataset.editId;
      taskForm.reset();
      taskForm.classList.remove("was-validated");
      getAllTasks();
    }
  } catch (error) {
    sendToastNotification(error.response, "red");
  }
}
submitTaskBtn.addEventListener("click", (e) => {
  submitTask(e);
});

export function sendToastNotification(response, clr) {
  Toastify({
    text: response?.data?.message || "something went wrong",
    duration: 3000,
    style: {
      background: clr,
      "z-index": 100,
      right: 0,
      top: 20,
      position: "absolute",
      maxWidth: "400px",
      borderRadius: "8px",
    },
  }).showToast();
}

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1]; // Get the payload part
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Convert Base64Url to Base64
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT:", e);
    return null;
  }
}
