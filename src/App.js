import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State management
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [error, setError] = useState('');

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  
  // Add new todo
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTodo = newTodo.trim();

    // Check for empty input
    if (!trimmedTodo) {
      setError('Please enter a task');
      return;
    }

    // Check for duplicate task
    const isDuplicate = todos.some(
      todo => todo.text.toLowerCase() === trimmedTodo.toLowerCase()
    );

    if (isDuplicate) {
      setError('This task already exists');
      return;
    }

    const todo = {
      id: Date.now(),
      text: trimmedTodo,
      status: 'todo',
      createdAt: new Date().toISOString()
    };

    setTodos([...todos, todo]);
    setNewTodo('');
    setError('');
  };

  // Update todo status
  const updateStatus = (id, newStatus) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, status: newStatus } : todo
    ));
  };

  // Delete todo
  const deleteTodo = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    const matchesStatus = filterStatus === 'all' || todo.status === filterStatus;
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = (id) => {
    const trimmedEdit = editingText.trim();
    
    if (!trimmedEdit) {
      setError('Task cannot be empty');
      return;
    }

    // Check for duplicate when editing, excluding the current task
    const isDuplicate = todos.some(
      todo => todo.id !== id && 
      todo.text.toLowerCase() === trimmedEdit.toLowerCase()
    );

    if (isDuplicate) {
      setError('This task already exists');
      return;
    }

    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: trimmedEdit } : todo
    ));
    setEditingId(null);
    setEditingText('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-title">Task Manager</h1>
        <p className="subtitle">Make Sure You Don't Forget Anything!</p>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Add Todo Form */}
      <form onSubmit={handleSubmit} className="add-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="task-input"
          />
          <button type="submit" className="add-button">
            Add Task
          </button>
        </div>
      </form>

      {/* Filter Buttons */}
      <div className="filter-group">
        {['all', 'todo', 'in-progress', 'done'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
          >
            {status === 'all' ? 'All' :
             status === 'todo' ? 'Todo' :
             status === 'in-progress' ? 'In Progress' : 'Done'}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="todo-list">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            className={`todo-item ${todo.status}`}
          >
            <div className="todo-content">
              {editingId === todo.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="edit-input"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={() => saveEdit(todo.id)}
                      className="save-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className={`task-text ${todo.status === 'done' ? 'completed' : ''}`}>
                    {todo.text}
                  </span>
                  <div className="action-buttons">
                    <button
                      onClick={() => startEditing(todo)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    {['todo', 'in-progress', 'done'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateStatus(todo.id, status)}
                        className={`status-btn ${status} ${todo.status === status ? 'active' : ''}`}
                      >
                        {status === 'todo' ? 'Todo' :
                         status === 'in-progress' ? 'In Progress' : 'Done'}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredTodos.length === 0 && (
          <div className="empty-message">
            No tasks found.
          </div>
        )}
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Task Manager. All rights reserved.</p>
        <p>Made with ❤️ by Hesham Saif</p>
        <div className="social-links">
          <a 
            href="https://github.com/heshammmsaifff" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-github"></i>
          </a>
          <a 
            href="https://www.linkedin.com/in/hesham-saif-6b4846353/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
