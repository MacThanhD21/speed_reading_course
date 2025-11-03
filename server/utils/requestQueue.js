/**
 * Request Queue Manager
 * Limits concurrent requests to external APIs to prevent overload
 * Uses queue system with configurable concurrency limit
 */

class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  /**
   * Add a request to the queue
   * @param {Function} requestFn - Async function that makes the API call
   * @returns {Promise} - Promise that resolves when request completes
   */
  async enqueue(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        requestFn,
        resolve,
        reject,
        timestamp: Date.now()
      });
      this.process();
    });
  }

  /**
   * Process the queue
   */
  async process() {
    // Don't process if queue is empty or at max concurrent
    if (this.queue.length === 0 || this.running >= this.maxConcurrent) {
      return;
    }

    // Get next item from queue
    const item = this.queue.shift();
    this.running++;

    try {
      // Execute the request
      const result = await item.requestFn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.running--;
      // Process next item in queue
      this.process();
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      total: this.running + this.queue.length
    };
  }

  /**
   * Clear the queue (for testing/emergency)
   */
  clear() {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

// Singleton instances for different API endpoints
const geminiQueue = new RequestQueue(
  parseInt(process.env.GEMINI_MAX_CONCURRENT || '10', 10)
);

export { RequestQueue, geminiQueue };
export default RequestQueue;

