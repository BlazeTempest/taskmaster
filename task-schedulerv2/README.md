# Task Scheduler V2

## Introduction

This project aims to create an enhanced version of the original task scheduler, focusing on efficient task management through a Greedy scheduling algorithm and specific data structures (BST, Queue), alongside a modern, interactive, and user-friendly interface (UI/UX).

## Core Scheduling Logic

*   **Data Storage & Sorting:** Tasks will be stored in a **Binary Search Tree (BST)**.
    *   The BST will primarily sort tasks by **deadline** (earliest first).
    *   For tasks with the same deadline, the secondary sorting key will be **priority** (lower number indicating higher priority).
    *   This structure allows for efficient insertion and retrieval (O(log n) average) while maintaining sorted order.
*   **Scheduling Algorithm:** A **Greedy Algorithm** will be used to determine the optimal execution sequence.
    *   Tasks are selected based on the earliest deadline.
    *   Ties in deadlines are broken by selecting the task with the highest priority (lowest priority number).
*   **Execution Order:** A **Queue (FIFO)** will be used to hold the final sequence of tasks determined by the Greedy Algorithm, ready for execution or display.
*   **Retrieval:** An in-order traversal of the BST (O(n)) retrieves tasks sorted by deadline and priority, which can then be enqueued based on the Greedy strategy.

## Planned Enhancements

### Functionality Improvements

*   **Greedy Task Scheduling:** Implement the core scheduling logic described above using BST and Queue.
*   **Task Input:** Allow users to add tasks with Name, Deadline, and Priority (e.g., 1=High, 2=Medium, 3=Low).
*   **Task Visualization:** Display the sorted/scheduled task order derived from the BST and Queue.
*   **Task Dependency & Blocking:** *(Future Goal)* Enable users to define dependencies between tasks. Visually indicate blocked tasks. *(Note: This adds complexity beyond the initial BST/Queue model).*
*   **Time Tracking & Analytics:** *(Future Goal)* Integrate a simple time tracker and productivity dashboard.
*   **Persistent Storage:** Use `localStorage` or `sessionStorage` to save the task list (potentially the raw list, which is then rebuilt into the BST on load).

### UI/UX Improvements

*   **Modern & Minimalistic Design:**
    *   Adopt a soft color palette (configurable light/dark modes).
    *   Explore subtle Glassmorphism or Neumorphism effects.
    *   Utilize rounded corners and smooth transitions.
*   **Enhanced Interactivity:**
    *   Implement **advanced animations** for task operations (add, delete, reorder, completion).
    *   Use **icons** for buttons (e.g., add, delete, edit, priority levels) using a library like Font Awesome or SVG icons.
    *   Implement **theme-appropriate cursors** (e.g., custom pointer for interactive elements).
*   **Visual Task Organization:**
    *   **Primary View:** Display the scheduled task list (from the Queue).
    *   *(Optional Views):* Consider adding back Kanban or other views if needed, but the core focus is the scheduled list.
*   **Interactive Elements:**
    *   Incorporate hover effects & micro-interactions.
    *   Include a prominent dark/light mode toggle.

## Technology Stack (Proposed)

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Data Structures:**
    *   **Binary Search Tree (BST):** Custom implementation for storing tasks sorted by deadline/priority.
    *   **Queue:** Custom implementation for managing execution order.
*   **Icon Library:** *(Optional)* Font Awesome or similar.

## Big-O Complexity Analysis

*   **BST Operations (Insert/Search/Delete):** O(log n) average, O(n) worst-case (if tree becomes unbalanced).
*   **Queue Operations (Enqueue/Dequeue):** O(1).
*   **Sorting (BST In-order Traversal):** O(n).
*   **Greedy Scheduling (Traversal + Enqueue):** O(n).

## Comparison to V1 / Previous V2 Plan

*   Refocuses on a specific, efficient scheduling algorithm (Greedy) using BST/Queue.
*   Prioritizes deadline/priority sorting over manual drag-and-drop status changes (like Kanban).
*   Adds specific UI requirements like icons, custom cursors, and advanced animations.

## Setup & Installation (Placeholder)

*(Instructions will be added once development starts)*

## Usage (Placeholder)

*(Instructions will be added once development starts)*
