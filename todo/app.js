class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todoApp_tasks';
        this.init();
    }

    // Initialize the app
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Form submission
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear completed button
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });

        // Clear all button
        document.getElementById('clearAll').addEventListener('click', () => {
            if (this.todos.length > 0 && confirm('Are you sure you want to delete all tasks?')) {
                this.todos = [];
                this.saveToStorage();
                this.render();
            }
        });
    }

    // Add a new todo
    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();

        if (!text) {
            input.focus();
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToStorage();
        input.value = '';
        input.focus();
        this.render();
    }

    // Toggle todo completion status
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    // Delete a todo
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }

    // Clear all completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount > 0 && confirm(`Delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }

    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // Get statistics
    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const active = total - completed;
        return { total, completed, active };
    }

    // Format date
    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return 'just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Save to local storage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    // Load from local storage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.todos = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.todos = [];
        }
    }

    // Render the UI
    render() {
        this.updateStats();
        this.updateTodoList();
        this.updateActionButtons();
    }

    // Update statistics display
    updateStats() {
        const stats = this.getStats();
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('activeCount').textContent = stats.active;
    }

    // Update todo list display
    updateTodoList() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    onchange="app.toggleTodo(${todo.id})"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="todo-priority priority-${todo.priority}">${todo.priority}</span>
                <span class="todo-date">${this.formatDate(todo.createdAt)}</span>
                <div class="todo-actions">
                    <button class="btn-delete" onclick="app.deleteTodo(${todo.id})" title="Delete">×</button>
                </div>
            </li>
        `).join('');
    }

    // Update action buttons visibility
    updateActionButtons() {
        const clearCompleted = document.getElementById('clearCompleted');
        const clearAll = document.getElementById('clearAll');
        const hasCompleted = this.todos.some(t => t.completed);
        const hasAny = this.todos.length > 0;

        clearCompleted.style.display = hasCompleted ? 'block' : 'none';
        clearAll.style.display = hasAny ? 'block' : 'none';
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});