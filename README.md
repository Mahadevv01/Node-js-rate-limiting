# Node.js User Task Queuing with Rate Limiting

## Project Overview

The objective of this project is to develop a Node.js API capable of handling user tasks while enforcing strict rate limits. The API will be deployed in a cluster environment with two replica sets to ensure high availability and reliability.

### Key Features

1. **Rate Limiting:** 
   - Each user ID is limited to one task per second.
   - Each user ID is also limited to a maximum of 20 tasks per minute.
   - Tasks that exceed these limits will be queued and processed in accordance with the defined rate limits.

2. **Task Handling:**
   - The API exposes a single route to handle tasks. The route accepts POST requests with a JSON body containing a user ID.
   - Each task is processed by a function that logs the completion time and user ID to a log file.

3. **Queueing System:**
   - To manage task execution in line with rate limits, a queueing system is implemented. This system ensures that tasks are processed sequentially and adhere to the rate limits for each user ID.

4. **Logging:**
   - Each task's completion, along with the user ID and timestamp, is logged to a file. This provides a record of task processing and helps with monitoring and debugging.

5. **Cluster Deployment:**
   - The Node.js API is set up in a cluster with two replica sets to provide redundancy and handle increased load. This setup enhances the reliability and scalability of the API.

6. **Resilience and Error Handling:**
   - The API is designed to handle various failure scenarios and edge cases. It ensures robust performance even in the face of unexpected issues

### Additional Considerations

- **Redis Integration:** While not mandatory, Redis is recommended for managing queues between the clusters. It provides efficient, in-memory data storage and helps with distributed task management.
- **Documentation:** Clear and comprehensive documentation is provided to explain the code, setup, and usage of the API. This includes instructions for running and testing the solution.

This project demonstrates the implementation of rate limiting and task queueing in a Node.js environment, showcasing techniques for managing API requests efficiently while maintaining high performance and reliability.
