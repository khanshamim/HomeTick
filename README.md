# HomeTick — Family Task Manager

A mobile-first daily household task tracker.  
**Admin (parent)** creates and assigns tasks. **Family members** check them off each day.

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React Native (Expo SDK 51)              |
| Backend      | FastAPI (Python 3.11+)                  |
| Database     | Supabase (PostgreSQL)                   |
| Notifications| Firebase Cloud Messaging (FCM)          |

---

## Project Structure

```
HomeTick/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + APScheduler
│   │   ├── config.py          # Pydantic settings from .env
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── models/            # ORM models (User, Task, TaskStatus)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routers/           # FastAPI routers (users, tasks, notifications)
│   │   ├── services/          # Business logic (task_service, notification_service)
│   │   └── utils/fcm.py       # Firebase Admin SDK wrapper
│   ├── supabase_schema.sql    # Run once in Supabase SQL editor
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── App.js                 # Navigation root (Stack + BottomTabs)
    ├── src/
    │   ├── theme.js           # Design system (colours, spacing, typography)
    │   ├── context/AppContext.js   # Global state + user persistence
    │   ├── services/api.js         # Axios API client
    │   ├── hooks/useTasks.js       # Task fetch + optimistic toggle
    │   ├── hooks/useNotifications.js # FCM token registration
    │   ├── screens/           # UserSelection, Home, AddTask, FamilyOverview
    │   └── components/        # Header, TaskItem, UserCard
    ├── app.json
    └── package.json
```

---

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and paste the contents of `backend/supabase_schema.sql`. Run it.
3. Copy your **Project URL** and **Service Role Key** from  
   _Project Settings → API_.
4. Construct your `DATABASE_URL`:
   ```
   postgresql://postgres:[DB_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
5. (Optional) Uncomment the seed block in the schema to insert family members.

---

## 2. Firebase / FCM Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Add an **Android** app (package `com.hometick.app`) and an **iOS** app (bundle `com.hometick.app`).
3. Download **`google-services.json`** (Android) → `frontend/google-services.json`  
   Download **`GoogleService-Info.plist`** (iOS) → `frontend/GoogleService-Info.plist`
4. Go to **Project Settings → Service Accounts → Generate new private key**.  
   Save the downloaded JSON as `backend/firebase-credentials.json`.

---

## 3. Backend — Running Locally

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — fill in DATABASE_URL and FIREBASE_CREDENTIALS_PATH

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Interactive docs: http://localhost:8000/docs

### Key API endpoints

| Method | Path                          | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/users/`                     | List all family members              |
| POST   | `/users/`                     | Create a family member               |
| PUT    | `/users/fcm-token`            | Register/refresh FCM device token    |
| GET    | `/tasks/`                     | Admin: all tasks                     |
| POST   | `/tasks/`                     | Admin: create task                   |
| GET    | `/tasks/user/{user_id}`       | Today's tasks with completion status |
| POST   | `/tasks/{task_id}/complete`   | Mark task complete/incomplete        |
| GET    | `/tasks/overview`             | Family progress summary              |
| POST   | `/notifications/trigger`      | Manually fire morning/evening alerts |
| GET    | `/health`                     | Health check                         |

---

## 4. Frontend — Running Locally

```bash
cd frontend

# Install dependencies
npm install

# Set the API base URL (edit the file directly for now)
# frontend/src/services/api.js → API_BASE_URL

# Start Expo dev server
npx expo start

# Run on a device/emulator
# Press 'a' for Android emulator, 'i' for iOS simulator
# Or scan the QR code with the Expo Go app
```

> **Physical device tip:** replace `localhost` in `src/services/api.js`  
> with your machine's LAN IP address, e.g. `http://192.168.1.42:8000`.

### Screens

| Screen               | Route trigger             | Notes                              |
|----------------------|---------------------------|------------------------------------|
| User Selection       | No user in storage        | Tap your name to log in            |
| Home (Checklist)     | Bottom tab — My Tasks     | Pull to refresh; tap checkbox      |
| Add Task             | Bottom tab — Add Task     | Admin only (tab hidden for members)|
| Family Overview      | Bottom tab — Family       | Visible to all                     |

---

## 5. Notifications

Push notifications are sent automatically by the backend APScheduler:

| Time  | Message                                     |
|-------|---------------------------------------------|
| 08:00 UTC | "You have X tasks today" (morning)      |
| 20:00 UTC | "You have X pending tasks" (evening)    |

To trigger them manually (useful for testing):
```bash
curl -X POST http://localhost:8000/notifications/trigger \
  -H "Content-Type: application/json" \
  -d '{"type": "morning"}'
```

> FCM tokens are registered by the mobile client on first launch and stored in `users.fcm_token`.

---

## 6. Seed Data (Quick Start)

After running the schema, seed a family via the API:

```bash
BASE=http://localhost:8000

curl -s -X POST $BASE/users/ -H "Content-Type: application/json" \
  -d '{"name":"Dad","role":"admin"}'

curl -s -X POST $BASE/users/ -H "Content-Type: application/json" \
  -d '{"name":"Mom","role":"member"}'

curl -s -X POST $BASE/users/ -H "Content-Type: application/json" \
  -d '{"name":"Son","role":"member"}'
```

Then grab a `user_id` from the response and create a task:

```bash
curl -s -X POST $BASE/tasks/ -H "Content-Type: application/json" \
  -d '{"title":"Walk the dog","assigned_to":"<user_id>","is_daily":true,"due_time":"08:00"}'
```
