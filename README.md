# TechGration LMS — Learning Management System

Enterprise-grade Learning Management System powered by **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Motion (v14)**, **Prisma ORM**, and **MongoDB**.

---

## 🍃 Database Architecture: MongoDB

The entire database layer is natively backed by **MongoDB** (MongoDB Atlas Cloud Cluster or Docker MongoDB with replica set `rs0` for multi-document ACID transactions).

### Environment Configuration (`.env`)
```env
DATABASE_URL="mongodb+srv://<db_username>:<db_password>@cluster0.95o6h5q.mongodb.net/techgration_lms?retryWrites=true&w=majority&appName=Cluster0"
```

### Database Management Commands
- **Sync Schema & Indexes to MongoDB**:
  ```bash
  pnpm db:push
  # or: npx prisma db push
  ```
- **Seed Sample Data to MongoDB**:
  ```bash
  pnpm db:seed
  # or: npx tsx prisma/seed.ts
  ```

---

## 🛡️ Administrative Portal & Test Credentials

Access the Admin Command Center at `/admin/login` (or `/login`).

| Role | Email | Password | Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@techgration.com` | `SuperAdmin@2026!` | Full platform authority & immutable permissions |
| **Operations Admin** | `admin@techgration.com` | `Admin@2026!` | User management, course review, and billing |
| **Instructor** | `rohit.sharma@techgration.com` | `Teacher@2026!` | Curriculum authoring and live classrooms |
| **Student** | `arjun.patel@techgration.com` | `Student@2026!` | Course catalog, video lessons, assignments |

*Tip: The login screen includes 1-click **Demo Account Switcher** buttons to instantly test any role.*

---

## 🚀 Running the Project

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the public landing page or [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) for the administrative console.
