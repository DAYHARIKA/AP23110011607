# Campus Notifications Application

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Authorization token from test server

### Step 1: Get Authorization Token

1. Register with the test server:
```bash
POST http://20.207.122.201/evaluation-service/register
```

Request body:
```json
{
  "email": "your-email@edu.edu",
  "name": "Your Name",
  "mobileNo": "your-mobile",
  "githubUsername": "your-github-username",
  "rollNo": "your-roll-number",
  "accessCode": "the-access-code-from-email"
}
```

2. Save the `clientID` and `clientSecret` from the response.

3. Get authorization token:
```bash
POST http://20.207.122.201/evaluation-service/auth
```

Request body:
```json
{
  "email": "your-email@edu.edu",
  "name": "Your Name",
  "rollNo": "your-roll-number",
  "accessCode": "the-access-code",
  "clientID": "from-registration",
  "clientSecret": "from-registration"
}
```

4. Save the `access_token` - you'll need this for the application.

### Step 2: Install Backend Dependencies

```bash
cd notification_app_be
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd notification_app_fe
npm install
```

### Step 4: Run the Application

**Option A: Run Frontend Only (Recommended for Evaluation)**

The frontend directly calls the test server APIs, so you don't need the backend running.

```bash
cd notification_app_fe
npm run dev
```

The application will run on `http://localhost:3000`

**Option B: Run Both Backend and Frontend**

Terminal 1 (Backend):
```bash
cd notification_app_be
npm start
```

Terminal 2 (Frontend):
```bash
cd notification_app_fe
npm run dev
```

### Step 5: Use the Application

1. Open `http://localhost:3000` in your browser
2. Paste your authorization token
3. Click "Access Notifications"
4. Navigate between "All Notifications" and "Priority Inbox"
5. Filter notifications by type
6. Click on notifications to mark as viewed

### Step 6: Test Stage 1 (Priority Logic)

To test the priority inbox logic separately:

```bash
cd logging_middleware
node priority_inbox.js
```

Edit `priority_inbox.js` and replace `YOUR_ACCESS_TOKEN_HERE` with your actual token.

### Project Structure

```
.
├── logging_middleware/
│   ├── logger.js          # Reusable logging function (CommonJS)
│   ├── logger.ts          # Reusable logging function (TypeScript)
│   └── priority_inbox.js  # Stage 1: Priority inbox logic
├── notification_app_be/
│   ├── server.js          # Express backend server
│   ├── package.json
│   └── .env.example
├── notification_app_fe/
│   ├── app/
│   │   ├── page.tsx              # Home page (token entry)
│   │   ├── notifications/
│   │   │   └── page.tsx          # All notifications page
│   │   ├── priority/
│   │   │   └── page.tsx          # Priority inbox page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── utils/
│   │   └── logger.ts             # Frontend logging utility
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
├── notification_system_design.md # Design document
└── .gitignore
```

### Features

- **Logging Middleware**: Reusable logging function that sends logs to test server
- **Stage 1**: Priority inbox logic with weight-based sorting (Placement > Result > Event)
- **Stage 2**: React/Next.js frontend with Material UI
  - Display all notifications
  - Display priority notifications (configurable top N)
  - Filter by notification type
  - Mark notifications as viewed/new
  - Responsive design for mobile and desktop
  - Extensive logging integration

### Notes

- The frontend directly calls the test server APIs for simplicity
- All operations use the custom logging middleware
- Viewed notifications are tracked in localStorage
- Material UI is used for styling as required
- TypeScript is used for type safety
