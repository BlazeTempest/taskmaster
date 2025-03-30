document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Task Elements
    const taskInputSection = document.getElementById('task-input-section');
    const taskInputHeader = taskInputSection.querySelector('.collapsible-header'); // Target header for click
    // const taskInputCollapseToggleBtn = taskInputSection.querySelector('.collapse-toggle-btn'); // Button is inside header

    const taskDisplaySection = document.getElementById('task-display-section'); // Make this collapsible too
    const taskDisplayHeader = taskDisplaySection.querySelector('h2'); // Target header for click
    // const taskDisplayCollapseToggleBtn = taskDisplaySection.querySelector('.collapse-toggle-btn'); // Will add this button

    const addTaskForm = document.getElementById('add-task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskPriorityInput = document.getElementById('task-priority');
    const submitTaskBtn = document.getElementById('submit-task-btn');
    const submitTaskBtnText = submitTaskBtn.querySelector('.btn-text');
    const submitTaskBtnIcon = submitTaskBtn.querySelector('i');
    const scheduledTaskListUl = document.getElementById('scheduled-task-list');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    // Theme Toggle Elements
    const themeToggleButton = document.getElementById('theme-toggle');

    // Pomodoro Elements (Header)
    const pomodoroModeDisplay = document.getElementById('pomodoro-mode');
    const pomodoroTimeDisplay = document.getElementById('pomodoro-time-display');
    const pomodoroStartPauseBtn = document.getElementById('pomodoro-start-pause');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset');
    const pomodoroSkipBtn = document.getElementById('pomodoro-skip');
    const pomodoroStartPauseIcon = pomodoroStartPauseBtn.querySelector('i');
    // const pomodoroStartPauseText = pomodoroStartPauseBtn.querySelector('.btn-text'); // No text in header buttons

    // Help Modal Elements
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModalBtn = document.getElementById('close-help-modal');

    // Calendar Modal Elements
    const calendarToggleBtn = document.getElementById('calendar-toggle-btn');
    const calendarModal = document.getElementById('calendar-modal');
    const closeCalendarModalBtn = document.getElementById('close-calendar-modal');
    const calendarGrid = document.getElementById('calendar-grid');



    // --- Data Structures ---
    const taskBST = new BinarySearchTree();
    const executionQueue = new Queue();

    // --- State ---
    let allTasks = loadTasksFromStorage();
    let editingTaskId = null;

    // Pomodoro State
    const POMODORO_STATES = { WORK: 'Work', SHORT_BREAK: 'Short Break', LONG_BREAK: 'Long Break' };
    const POMODORO_DURATIONS = { [POMODORO_STATES.WORK]: 25, [POMODORO_STATES.SHORT_BREAK]: 5, [POMODORO_STATES.LONG_BREAK]: 15 };
    let pomodoroInterval = null;
    let pomodoroCurrentState = POMODORO_STATES.WORK;
    let pomodoroTimeRemaining = POMODORO_DURATIONS[POMODORO_STATES.WORK] * 60;
    let pomodoroIsRunning = false;
    let pomodoroCycles = 0;

    // --- Functions ---

    // --- Task Functions ---
    function loadTasksFromStorage() {
        const storedTasks = localStorage.getItem('tasksV2_BST');
        try {
            const loaded = storedTasks ? JSON.parse(storedTasks) : [];
            return loaded.map(task => ({ ...task, priority: parseInt(task.priority, 10) || 3 }));
        } catch (e) { console.error("Error parsing tasks:", e); return []; }
    }
    function saveTasksToStorage() { localStorage.setItem('tasksV2_BST', JSON.stringify(allTasks)); }
    function rebuildBST() { taskBST.clear(); allTasks.forEach(task => taskBST.insert(task)); console.log("BST rebuilt."); }
    function scheduleTasks() { executionQueue.clear(); const sortedTasks = taskBST.inOrderTraversal(); sortedTasks.forEach(task => executionQueue.enqueue(task)); console.log("Queue populated."); }
    function generateId() { return '_' + Math.random().toString(36).substr(2, 9); }

    function handleFormSubmit(event) {
        event.preventDefault();
        if (!taskDueDateInput.value) { alert("Deadline is required."); return; }
        const taskData = { title: taskTitleInput.value.trim(), description: taskDescriptionInput.value.trim(), dueDate: taskDueDateInput.value, priority: parseInt(taskPriorityInput.value, 10) };
        if (!taskData.title) { alert("Task title cannot be empty!"); return; }

        if (editingTaskId) {
            const taskIndex = allTasks.findIndex(task => task.id === editingTaskId);
            if (taskIndex > -1) {
                allTasks[taskIndex] = { ...allTasks[taskIndex], ...taskData };
                console.log("Task updated:", allTasks[taskIndex]);
            } else { console.error("Task to edit not found:", editingTaskId); }
        } else {
            const newTask = { id: generateId(), ...taskData, createdAt: new Date().toISOString() };
            allTasks.push(newTask);
            console.log("Task added:", newTask);
        }
        rebuildBSTAndRender(); // Combined function
        saveTasksToStorage();
        cancelEdit();
    }

    function cancelEdit() {
        editingTaskId = null;
        addTaskForm.reset();
        taskPriorityInput.value = '2';
        submitTaskBtnText.textContent = 'Add Task';
        submitTaskBtnIcon.className = 'fas fa-plus';
        cancelEditBtn.style.display = 'none';
        taskTitleInput.focus();
    }

    function rebuildBSTAndRender() {
        rebuildBST();
        scheduleTasks();
        renderScheduledTasks();
        // Calendar view will be rendered when opened
    }

    function renderScheduledTasks() {
        scheduledTaskListUl.innerHTML = '';
        const tasksToRender = executionQueue.toArray();
        if (tasksToRender.length === 0) { scheduledTaskListUl.innerHTML = '<li class="placeholder">No tasks scheduled yet.</li>'; return; }
        tasksToRender.forEach((task, index) => {
            const listItem = createScheduledTaskElement(task, index + 1);
            if (listItem) { scheduledTaskListUl.appendChild(listItem); setTimeout(() => listItem.classList.add('fade-in'), index * 50); }
        });
        console.log("Rendered", tasksToRender.length, "scheduled tasks.");
    }

    function createScheduledTaskElement(task, position) {
        if (!task || !task.id) return null;
        const li = document.createElement('li');
        li.dataset.taskId = task.id;
        li.classList.add(`priority-${task.priority}`);
        let priorityText = task.priority === 1 ? 'High' : task.priority === 3 ? 'Low' : 'Medium';
        li.innerHTML = `
            <div class="task-position">${position}</div>
            <div class="task-details">
                <strong>${task.title}</strong>
                ${task.description ? `<p>${task.description}</p>` : ''}
                <div class="task-meta">
                    <span><i class="fas fa-calendar-alt"></i> Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    <span><i class="fas fa-exclamation-circle"></i> Priority: ${priorityText}</span>
                 </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn icon-button" title="Edit Task"><i class="fas fa-edit"></i></button>
                <button class="delete-btn icon-button" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
                 <button class="complete-btn icon-button" title="Mark Complete (Dequeue)"><i class="fas fa-check-circle"></i></button>
            </div>`;
        li.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteTask(task.id); });
        li.querySelector('.edit-btn').addEventListener('click', (e) => { e.stopPropagation(); editTask(task.id); });
        li.querySelector('.complete-btn').addEventListener('click', (e) => { e.stopPropagation(); completeTask(task.id); });
        return li;
    }

    function deleteTask(taskId) {
        const taskToDelete = allTasks.find(task => task.id === taskId);
        if (!taskToDelete) return;
        if (confirm(`Delete task: "${taskToDelete.title}"?`)) {
            allTasks = allTasks.filter(task => task.id !== taskId);
            rebuildBSTAndRender();
            saveTasksToStorage();
            console.log("Task deleted:", taskId);
            if (editingTaskId === taskId) cancelEdit();
        }
    }

    function completeTask(taskId) {
        const taskAtFront = executionQueue.peek();
        if (!taskAtFront) { alert("No tasks to complete."); return; }
        if (taskAtFront.id !== taskId) { alert(`Complete "${taskAtFront.title}" first.`); return; }
        if (confirm(`Mark task "${taskAtFront.title}" as complete?`)) {
            const completedTask = executionQueue.dequeue();
            const taskIndex = allTasks.findIndex(t => t.id === completedTask.id);
            if (taskIndex > -1) allTasks.splice(taskIndex, 1);
            rebuildBSTAndRender();
            saveTasksToStorage();
            console.log("Task completed:", completedTask);
        }
    }

    function editTask(taskId) {
        const taskToEdit = allTasks.find(task => task.id === taskId);
        if (!taskToEdit) return;
        // Ensure Add/Edit section is expanded
        if (taskInputSection.classList.contains('collapsed')) {
             toggleCollapsibleSection(taskInputSection);
        }
        editingTaskId = taskId;
        taskTitleInput.value = taskToEdit.title;
        taskDescriptionInput.value = taskToEdit.description;
        taskDueDateInput.value = taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '';
        taskPriorityInput.value = taskToEdit.priority.toString();
        submitTaskBtnText.textContent = 'Update Task';
        submitTaskBtnIcon.className = 'fas fa-save';
        cancelEditBtn.style.display = 'inline-block';
        taskTitleInput.focus();
        taskInputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // --- Theme Functions ---
    function toggleTheme() { document.body.classList.toggle('dark-theme'); localStorage.setItem('themeV2_BST', document.body.classList.contains('dark-theme') ? 'dark' : 'light'); }
    function applySavedTheme() { const savedTheme = localStorage.getItem('themeV2_BST'); if (savedTheme === 'dark') document.body.classList.add('dark-theme'); else document.body.classList.remove('dark-theme'); }

    // --- Pomodoro Functions ---
    function updatePomodoroDisplay() { const minutes = Math.floor(pomodoroTimeRemaining / 60); const seconds = pomodoroTimeRemaining % 60; pomodoroTimeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`; document.title = `${pomodoroTimeDisplay.textContent} - ${pomodoroCurrentState}`; }
    function pomodoroTick() { if (pomodoroTimeRemaining <= 0) { clearInterval(pomodoroInterval); pomodoroInterval = null; pomodoroIsRunning = false; playNotificationSound(); switchToNextPomodoroState(); } else { pomodoroTimeRemaining--; updatePomodoroDisplay(); } }
    function startPausePomodoro() { if (pomodoroIsRunning) { clearInterval(pomodoroInterval); pomodoroInterval = null; pomodoroIsRunning = false; pomodoroStartPauseIcon.className = 'fas fa-play'; console.log("Pomodoro paused"); } else { if (pomodoroTimeRemaining <= 0) return; pomodoroIsRunning = true; pomodoroInterval = setInterval(pomodoroTick, 1000); pomodoroStartPauseIcon.className = 'fas fa-pause'; console.log("Pomodoro started"); } }
    function resetPomodoro() { clearInterval(pomodoroInterval); pomodoroInterval = null; pomodoroIsRunning = false; pomodoroTimeRemaining = POMODORO_DURATIONS[pomodoroCurrentState] * 60; updatePomodoroDisplay(); pomodoroStartPauseIcon.className = 'fas fa-play'; document.title = "Smart Task Scheduler V2"; console.log("Pomodoro reset to:", pomodoroCurrentState); }
    function switchToNextPomodoroState() { if (pomodoroCurrentState === POMODORO_STATES.WORK) { pomodoroCycles++; pomodoroCurrentState = (pomodoroCycles % 4 === 0) ? POMODORO_STATES.LONG_BREAK : POMODORO_STATES.SHORT_BREAK; } else { pomodoroCurrentState = POMODORO_STATES.WORK; } pomodoroModeDisplay.textContent = pomodoroCurrentState; resetPomodoro(); console.log("Switched Pomodoro state to:", pomodoroCurrentState); }
    function skipPomodoroSession() { if (confirm(`Skip current ${pomodoroCurrentState} session?`)) { clearInterval(pomodoroInterval); pomodoroInterval = null; pomodoroIsRunning = false; switchToNextPomodoroState(); } }
    let audioContext; function initAudio() { if (!audioContext) { audioContext = new (window.AudioContext || window.webkitAudioContext)(); console.log("AudioContext initialized."); } }
    function playNotificationSound() { if (!audioContext) { console.warn("AudioContext not initialized."); initAudio(); if (!audioContext) return; } if (audioContext.state === 'suspended') audioContext.resume(); const oscillator = audioContext.createOscillator(); const gainNode = audioContext.createGain(); oscillator.connect(gainNode); gainNode.connect(audioContext.destination); oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(440, audioContext.currentTime); gainNode.gain.setValueAtTime(0.5, audioContext.currentTime); oscillator.start(); oscillator.stop(audioContext.currentTime + 0.5); console.log("Played notification sound."); }

    // --- Modal Functions (Generic) ---
    function showModal(modalElement) {
        modalElement.classList.remove('hidden');
        setTimeout(() => modalElement.classList.add('visible'), 10);
    }
    function hideModal(modalElement) {
        modalElement.classList.remove('visible');
        setTimeout(() => modalElement.classList.add('hidden'), 300);
    }

    // --- Calendar View Functions ---
    function showCalendarModal() {
        renderCalendarView(); // Render content before showing
        showModal(calendarModal);
    }
    function renderCalendarView() {
        calendarGrid.innerHTML = '';
        const tasksByDate = {};
        allTasks.forEach(task => { if (task.dueDate) { const dateStr = task.dueDate.split('T')[0]; if (!tasksByDate[dateStr]) tasksByDate[dateStr] = []; tasksByDate[dateStr].push(task); } });
        const sortedDates = Object.keys(tasksByDate).sort();
        if (sortedDates.length === 0) { calendarGrid.innerHTML = '<p class="placeholder">No tasks with deadlines.</p>'; return; }
        sortedDates.forEach(dateStr => {
            const dayDiv = document.createElement('div'); dayDiv.className = 'calendar-day';
            const dateObj = new Date(dateStr + 'T00:00:00'); const formattedDate = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const heading = document.createElement('h3'); heading.textContent = formattedDate; dayDiv.appendChild(heading);
            const taskListUl = document.createElement('ul');
            tasksByDate[dateStr].sort((a, b) => a.priority - b.priority);
            tasksByDate[dateStr].forEach(task => {
                const taskLi = document.createElement('li'); taskLi.classList.add(`priority-${task.priority}`); taskLi.title = `P${task.priority}: ${task.description || ''}`;
                const titleSpan = document.createElement('span'); titleSpan.className = 'calendar-task-title'; titleSpan.textContent = task.title;
                const prioritySpan = document.createElement('span'); prioritySpan.className = `calendar-task-priority prio-${task.priority}`; prioritySpan.textContent = `P${task.priority}`;
                taskLi.appendChild(titleSpan); taskLi.appendChild(prioritySpan); taskListUl.appendChild(taskLi);
            });
            dayDiv.appendChild(taskListUl); calendarGrid.appendChild(dayDiv);
        });
        console.log("Rendered calendar view.");
    }

    // --- Collapsible Section Function ---
    function toggleCollapsibleSection(sectionElement) {
        const icon = sectionElement.querySelector('.collapse-toggle-btn i'); // Find icon within section
        const isCollapsed = sectionElement.classList.toggle('collapsed'); // Toggle and check state

        if (icon) { // Check if icon exists
             icon.className = isCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        }

        // Optional: Persist collapse state
        // localStorage.setItem(`${sectionElement.id}-collapsed`, isCollapsed);
    }

    // Function to apply initial collapse state (e.g., from localStorage)
    function applyInitialCollapseState(sectionElement) {
         // Optional: Load state from localStorage
         // const isCollapsed = localStorage.getItem(`${sectionElement.id}-collapsed`) === 'true';
         const isCollapsed = true; // Default to collapsed for Add/Edit
         if (sectionElement.id === 'task-input-section' && isCollapsed) {
              sectionElement.classList.add('collapsed');
              const icon = sectionElement.querySelector('.collapse-toggle-btn i');
              if(icon) icon.className = 'fas fa-chevron-down';
         }
         // Add similar logic for other sections if needed
    }

    // --- Initial Setup ---
    applySavedTheme();
    rebuildBSTAndRender();
    updatePomodoroDisplay();
    document.body.addEventListener('click', initAudio, { once: true });
    // Start with Add/Edit section collapsed by default
    applyInitialCollapseState(taskInputSection);
    // applyInitialCollapseState(taskDisplaySection); // Apply if needed for task display


    // --- Event Listeners ---
    addTaskForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', cancelEdit);
    themeToggleButton.addEventListener('click', toggleTheme);
    pomodoroStartPauseBtn.addEventListener('click', startPausePomodoro);
    pomodoroResetBtn.addEventListener('click', resetPomodoro);
    pomodoroSkipBtn.addEventListener('click', skipPomodoroSession);
    helpBtn.addEventListener('click', () => showModal(helpModal));
    closeHelpModalBtn.addEventListener('click', () => hideModal(helpModal));
    helpModal.addEventListener('click', (e) => { if (e.target === helpModal) hideModal(helpModal); });
    calendarToggleBtn.addEventListener('click', showCalendarModal); // Show modal on click
    closeCalendarModalBtn.addEventListener('click', () => hideModal(calendarModal));
    calendarModal.addEventListener('click', (e) => { if (e.target === calendarModal) hideModal(calendarModal); });

    // Collapsible Section Listeners (target the header/button)
    if (taskInputHeader) { // Check if element exists
        taskInputHeader.addEventListener('click', (e) => {
             // Only toggle if the click is not on a button inside the header
             if (!e.target.closest('button')) {
                 toggleCollapsibleSection(taskInputSection);
             } else if (e.target.closest('.collapse-toggle-btn')) {
                  // Allow clicking the button itself too
                  toggleCollapsibleSection(taskInputSection);
             }
        });
    }
     if (taskDisplayHeader) { // Add listener for the task display header
        taskDisplayHeader.addEventListener('click', (e) => {
             if (!e.target.closest('button')) { // Prevent toggling when clicking other potential header buttons
                 toggleCollapsibleSection(taskDisplaySection);
             } else if (e.target.closest('.collapse-toggle-btn')) {
                  toggleCollapsibleSection(taskDisplaySection);
             }
        });
    }


});
