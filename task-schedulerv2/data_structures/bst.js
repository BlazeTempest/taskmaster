/**
 * Represents a node in the Binary Search Tree.
 */
class BSTNode {
    constructor(task) {
        this.task = task;   // The task object stored in the node
        this.left = null;   // Pointer to the left child node
        this.right = null;  // Pointer to the right child node
    }
}

/**
 * Implements a Binary Search Tree for storing and sorting tasks.
 * Tasks are sorted primarily by deadline (earliest first) and secondarily by priority (lower number first).
 */
class BinarySearchTree {
    constructor() {
        this.root = null; // The root node of the BST
    }

    /**
     * Compares two tasks based on deadline and priority.
     * @param {object} task1 - The first task object { deadline, priority, ... }
     * @param {object} task2 - The second task object { deadline, priority, ... }
     * @returns {number} -1 if task1 comes before task2, 1 if task1 comes after task2, 0 if considered equal (though exact equality might be rare with IDs).
     */
    _compareTasks(task1, task2) {
        // Handle null/undefined deadlines - tasks without deadlines go last
        const deadline1 = task1.dueDate ? new Date(task1.dueDate).getTime() : Infinity;
        const deadline2 = task2.dueDate ? new Date(task2.dueDate).getTime() : Infinity;

        if (deadline1 < deadline2) {
            return -1; // task1 has earlier deadline
        } else if (deadline1 > deadline2) {
            return 1; // task1 has later deadline
        } else {
            // Deadlines are the same (or both are Infinity), compare by priority
            // Assuming priority is a number (lower is higher priority)
            const priority1 = parseInt(task1.priority, 10) || 3; // Default to low priority if invalid
            const priority2 = parseInt(task2.priority, 10) || 3; // Default to low priority if invalid

            if (priority1 < priority2) {
                return -1; // task1 has higher priority (lower number)
            } else if (priority1 > priority2) {
                return 1; // task1 has lower priority (higher number)
            } else {
                // If deadlines and priorities are the same, consider them equal for sorting purposes
                // Or use a tertiary key like task ID if strict ordering is needed for duplicates
                return 0;
            }
        }
    }

    /**
     * Inserts a task into the BST.
     * Time Complexity: O(log n) average, O(n) worst-case.
     * @param {object} task - The task object to insert.
     */
    insert(task) {
        const newNode = new BSTNode(task);
        if (!this.root) {
            this.root = newNode;
        } else {
            this._insertNode(this.root, newNode);
        }
    }

    /**
     * Helper function to recursively insert a node.
     * @param {BSTNode} node - The current node being compared.
     * @param {BSTNode} newNode - The new node to insert.
     */
    _insertNode(node, newNode) {
        const comparison = this._compareTasks(newNode.task, node.task);

        if (comparison === -1) { // newNode's task comes before node's task
            if (!node.left) {
                node.left = newNode;
            } else {
                this._insertNode(node.left, newNode);
            }
        } else { // newNode's task comes after or is equal to node's task (place in right subtree)
            // Note: If comparison is 0, placing it right handles potential duplicates simply.
            // More complex duplicate handling could be added here if needed.
            if (!node.right) {
                node.right = newNode;
            } else {
                this._insertNode(node.right, newNode);
            }
        }
    }

    /**
     * Performs an in-order traversal of the BST.
     * Returns tasks sorted by deadline (earliest first) then priority (highest first).
     * Time Complexity: O(n)
     * @returns {Array<object>} An array of task objects in sorted order.
     */
    inOrderTraversal() {
        const result = [];
        this._inOrder(this.root, result);
        return result;
    }

    /**
     * Helper function for recursive in-order traversal.
     * @param {BSTNode} node - The current node.
     * @param {Array<object>} result - The array to store sorted tasks.
     */
    _inOrder(node, result) {
        if (node) {
            this._inOrder(node.left, result);
            result.push(node.task);
            this._inOrder(node.right, result);
        }
    }

    /**
     * Clears the entire BST.
     * Time Complexity: O(1) (by resetting root, garbage collection handles nodes)
     */
    clear() {
        this.root = null;
    }

    // --- Optional Methods (Implement if needed) ---

    /**
     * Searches for a task (exact match might be tricky, maybe search by ID).
     * Time Complexity: O(log n) average, O(n) worst-case.
     * @param {string} taskId - The ID of the task to search for.
     * @returns {object | null} The found task object or null.
     */
    search(taskId) {
        return this._searchNode(this.root, taskId);
    }

    _searchNode(node, taskId) {
        if (!node) {
            return null;
        }
        if (node.task.id === taskId) {
            return node.task;
        }
        // Since search isn't based on sort keys, we might need to traverse both sides
        // This makes search O(n) unless we only search by sort keys.
        // For ID search, a simple array find might be better unless BST stores ID efficiently.
        // Let's assume for now search isn't a primary use case based on ID.
        // If searching by deadline/priority:
        // const comparison = this._compareTasks({ id: taskId, dueDate: ???, priority: ??? }, node.task);
        // if (comparison === -1) return this._searchNode(node.left, taskId);
        // else if (comparison === 1) return this._searchNode(node.right, taskId);
        // else return node.task; // Found based on sort keys

        // Simple O(n) search for ID:
        let found = this._searchNode(node.left, taskId);
        if (found) return found;
        return this._searchNode(node.right, taskId);
    }


    /**
     * Deletes a task from the BST (more complex to implement correctly).
     * Time Complexity: O(log n) average, O(n) worst-case.
     * @param {object} task - The task object to delete.
     */
    delete(task) {
        this.root = this._deleteNode(this.root, task);
    }

    _deleteNode(node, taskToDelete) {
        if (!node) {
            return null;
        }

        const comparison = this._compareTasks(taskToDelete, node.task);

        if (comparison === -1) { // Task to delete is in the left subtree
            node.left = this._deleteNode(node.left, taskToDelete);
            return node;
        } else if (comparison === 1) { // Task to delete is in the right subtree
            node.right = this._deleteNode(node.right, taskToDelete);
            return node;
        } else {
            // Found the node to delete (or an equivalent one based on sort keys)
            // Handle node deletion based on children:
            // 1. Node has no children
            if (!node.left && !node.right) {
                return null;
            }
            // 2. Node has one child
            if (!node.left) {
                return node.right;
            }
            if (!node.right) {
                return node.left;
            }
            // 3. Node has two children
            // Find the minimum node in the right subtree (in-order successor)
            const successor = this._findMinNode(node.right);
            node.task = successor.task; // Replace node's task with successor's task
            // Delete the successor from the right subtree
            node.right = this._deleteNode(node.right, successor.task);
            return node;
        }
    }

     /**
     * Finds the node with the minimum value (earliest deadline/highest priority) in a subtree.
     * @param {BSTNode} node - The root of the subtree.
     * @returns {BSTNode} The node with the minimum value.
     */
    _findMinNode(node) {
        while (node && node.left) {
            node = node.left;
        }
        return node;
    }
}

// Export the class if using modules
// export default BinarySearchTree;
