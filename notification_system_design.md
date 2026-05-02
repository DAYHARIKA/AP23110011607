# Notification System Design

## Stage 1: Priority Inbox Implementation

### Problem Statement
The campus notifications application receives a high volume of notifications, causing users to lose track of important updates. We need to implement a Priority Inbox that displays the top N most important unread notifications first.

### Approach

#### Priority Calculation
Priority is determined based on two factors:
1. **Notification Type Weight** (Primary factor)
   - Placement: Weight = 3 (Highest priority)
   - Result: Weight = 2 (Medium priority)
   - Event: Weight = 1 (Lowest priority)

2. **Recency** (Secondary factor)
   - More recent notifications are given higher priority within the same type
   - Time decay is applied to reduce priority of older notifications

#### Algorithm
```
Priority Score = (Type Weight × 1000) + Recency Factor

Where:
- Type Weight: 3 for Placement, 2 for Result, 1 for Event
- Recency Factor: Max(0, 100 - hours_since_notification)
```

The multiplication by 1000 ensures that type weight is the primary sorting criterion, while recency serves as a tiebreaker for notifications of the same type.

#### Sorting Logic
1. Calculate priority score for each notification
2. Sort notifications by priority score (descending)
3. For equal scores, sort by timestamp (most recent first)
4. Return top N notifications

#### Efficiency Considerations
Since new notifications keep coming in, maintaining top N efficiently can be done using:

1. **Min-Heap Approach** (O(n log k)):
   - Maintain a min-heap of size k (where k = N)
   - For each new notification:
     - If heap has < k elements, add it
     - If new notification has higher priority than heap's minimum, replace minimum
   - Time complexity: O(n log k) where n = total notifications, k = N

2. **Quick Select** (O(n) average):
   - Use quickselect algorithm to find the Nth largest element
   - Partition array around this element
   - Time complexity: O(n) average, O(n²) worst case

3. **Sorting** (O(n log n)):
   - Simple and straightforward
   - For reasonable dataset sizes (e.g., < 10,000 notifications), this is acceptable
   - Used in current implementation for simplicity

#### Current Implementation
The current implementation uses the sorting approach:
- Fetch all notifications from API
- Calculate priority scores
- Sort by score and timestamp
- Return top 10

This is suitable for the current scale. If the dataset grows significantly, we can switch to the min-heap approach for better performance.

### Code Structure
- `logger.js/ts`: Reusable logging middleware
- `priority_inbox.js`: Main logic for priority calculation and sorting
- Functions:
  - `fetchNotifications()`: Fetches notifications from API
  - `calculatePriorityScore()`: Computes priority score for a notification
  - `getTopPriorityNotifications()`: Returns top N sorted notifications

### Logging Integration
All critical operations are logged using the custom Log function:
- API fetch operations
- Notification count updates
- Priority retrieval operations
