// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const tasksLeft = document.getElementById('tasksLeft');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const suggestionsList = document.getElementById('suggestionsList');

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let theme = localStorage.getItem('theme') || 'light';

// Initialize
updateTaskList();
updateTasksLeft();
setTheme(theme);
updateSuggestions();

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
clearCompletedBtn.addEventListener('click', clearCompleted);
themeToggle.addEventListener('click', toggleTheme);
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        updateTaskList();
    });
});

// Theme Functions
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    setTheme(theme);
}

// AI Suggestions
function updateSuggestions() {
    const suggestions = [];
    
    if (tasks.length === 0) {
        suggestions.push("Start by adding your first task!");
    } else {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        
        if (completedTasks === 0) {
            suggestions.push("Try completing some tasks to track your progress!");
        } else if (completedTasks === totalTasks) {
            suggestions.push("Great job! You've completed all your tasks!");
        } else {
            const completionRate = (completedTasks / totalTasks) * 100;
            suggestions.push(`You've completed ${completionRate.toFixed(0)}% of your tasks. Keep going!`);
        }
        
        if (tasks.length > 5) {
            suggestions.push("You have many tasks. Consider prioritizing the most important ones!");
        }
    }
    
    suggestionsList.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item"><i class="fas fa-lightbulb"></i> ${suggestion}</div>`
    ).join('');
}

// Task Functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        tasks.push(task);
        saveTasks();
        updateTaskList();
        updateTasksLeft();
        updateSuggestions();
        taskInput.value = '';
        
        // AI-like suggestion
        setTimeout(() => {
            if (tasks.length === 1) {
                showSuggestion("Try adding more tasks! You can mark them as complete by clicking the checkbox.");
            }
        }, 1000);
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    updateTaskList();
    updateTasksLeft();
    updateSuggestions();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
            // AI-like suggestion
            if (task.completed) {
                showSuggestion("Great job! Keep up the good work!");
            }
        }
        return task;
    });
    saveTasks();
    updateTaskList();
    updateTasksLeft();
    updateSuggestions();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    updateTaskList();
    updateTasksLeft();
    updateSuggestions();
}

function updateTaskList() {
    taskList.innerHTML = '';
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function updateTasksLeft() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksLeft.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showSuggestion(message) {
    const suggestion = document.createElement('div');
    suggestion.className = 'suggestion';
    suggestion.textContent = message;
    suggestion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-color);
        animation: slideIn 0.5s ease-out;
        z-index: 1000;
    `;
    
    document.body.appendChild(suggestion);
    
    setTimeout(() => {
        suggestion.style.animation = 'slideOut 0.5s ease-in';
        setTimeout(() => suggestion.remove(), 500);
    }, 3000);
}

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 