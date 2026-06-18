# Todo List Application

A modern, responsive todo list application with local storage functionality.

## Features

✅ **Add Tasks** - Quickly add new tasks to your list
✅ **Mark Complete** - Check off tasks as you complete them
✅ **Filter Tasks** - View all, active, or completed tasks
✅ **Delete Tasks** - Remove individual tasks or clear all completed ones
✅ **Local Storage** - All data is automatically saved to your browser
✅ **Statistics** - Track active and total tasks
✅ **Priority Levels** - Tasks show priority badges (high, medium, low)
✅ **Time Tracking** - See when each task was created
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
✅ **Dark & Light** - Beautiful gradient design with smooth animations

## How to Use

1. **Open the app** - Open `index.html` in your web browser
2. **Add a task** - Type in the input field and click "Add Task" or press Enter
3. **Complete a task** - Check the checkbox next to any task
4. **Filter tasks** - Use the filter buttons to view All, Active, or Completed tasks
5. **Delete a task** - Click the × button on any task
6. **Clear completed** - Click "Clear Completed" to remove all finished tasks

## Technical Details

### Files
- `index.html` - Main HTML structure
- `styles.css` - Complete styling with responsive design
- `app.js` - Application logic and local storage handling

### Local Storage
- All tasks are automatically saved to `localStorage` with the key `todoApp_tasks`
- Data persists even after closing the browser
- Maximum storage is typically 5-10MB depending on the browser

### Browser Support
- Chrome/Edge 4+
- Firefox 3.5+
- Safari 4+
- IE 8+
- All modern mobile browsers

## Keyboard Shortcuts
- **Enter** - Add a new task (when input is focused)

## Data Structure

Each todo item has the following structure:
```javascript
{
    id: 1234567890,           // Unique timestamp-based ID
    text: "Task description",  // The task text
    completed: false,          // Completion status
    priority: "medium",        // Priority level
    createdAt: "ISO8601"       // ISO date string
}
```

## Customization

You can customize the app by modifying:
- Colors in `styles.css` (CSS custom properties at the top)
- Default priority in `app.js` (TodoApp.addTodo method)
- Storage key name (change `todoApp_tasks` in `app.js`)

## Performance

- Zero external dependencies
- Lightweight JavaScript (~4KB)
- Fast rendering with efficient DOM updates
- Smooth animations and transitions

## Tips

- Use the filter buttons to focus on what matters
- Regular clearing of completed tasks keeps your list fresh
- Check the task count in the filter section to track progress

Enjoy your new todo list! 📝