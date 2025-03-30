/**
 * Represents a node in the Queue.
 */
class QueueNode {
    constructor(value) {
        this.value = value; // The data stored in the node (e.g., a task object)
        this.next = null;   // Pointer to the next node in the queue
    }
}

/**
 * Implements a First-In, First-Out (FIFO) Queue.
 */
class Queue {
    constructor() {
        this.front = null; // The first node in the queue
        this.rear = null;  // The last node in the queue
        this.size = 0;     // Number of elements in the queue
    }

    /**
     * Adds an element to the end of the queue.
     * Time Complexity: O(1)
     * @param {*} value - The value to add to the queue.
     */
    enqueue(value) {
        const newNode = new QueueNode(value);
        if (this.isEmpty()) {
            // If the queue is empty, the new node is both front and rear
            this.front = newNode;
            this.rear = newNode;
        } else {
            // Link the current rear node to the new node
            this.rear.next = newNode;
            // Update the rear pointer to the new node
            this.rear = newNode;
        }
        this.size++;
    }

    /**
     * Removes and returns the element from the front of the queue.
     * Time Complexity: O(1)
     * @returns {*} The value of the element removed, or null if the queue is empty.
     */
    dequeue() {
        if (this.isEmpty()) {
            console.warn("Dequeue called on empty queue.");
            return null; // Or throw an error
        }
        // Get the value of the front node
        const valueToRemove = this.front.value;
        // Move the front pointer to the next node
        this.front = this.front.next;
        // If the queue becomes empty after dequeue, update rear as well
        if (!this.front) {
            this.rear = null;
        }
        this.size--;
        return valueToRemove;
    }

    /**
     * Returns the element at the front of the queue without removing it.
     * Time Complexity: O(1)
     * @returns {*} The value of the element at the front, or null if the queue is empty.
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.front.value;
    }

    /**
     * Checks if the queue is empty.
     * Time Complexity: O(1)
     * @returns {boolean} True if the queue is empty, false otherwise.
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * Returns the number of elements in the queue.
     * Time Complexity: O(1)
     * @returns {number} The size of the queue.
     */
    getSize() {
        return this.size;
    }

    /**
     * Clears all elements from the queue.
     * Time Complexity: O(1)
     */
    clear() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    /**
     * Returns an array representation of the queue (for display/debugging).
     * Time Complexity: O(n)
     * @returns {Array} An array containing the queue elements in order.
     */
    toArray() {
        const result = [];
        let current = this.front;
        while (current) {
            result.push(current.value);
            current = current.next;
        }
        return result;
    }
}

// Export the Queue class if using modules (optional for simple browser scripts)
// export default Queue;
