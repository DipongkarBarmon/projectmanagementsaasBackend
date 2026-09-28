# 🚀 Project Management SaaS API
Plan faster. Build better. Manage with confidence.
An end-to-end REST API for organizational project management, sprint planning, task tracking, team collaboration, and automated billing.

Node.js | TypeScript | Express | Prisma | PostgreSQL | Vercel

A production-oriented REST API for managing organizations, creating projects and sprints, assigning tasks, tracking team activities, and handling automated subscription billing.

Built with Express 5, TypeScript, Prisma ORM 7, PostgreSQL, JWT authentication, Redis, and automated bKash Tokenized Checkout for SaaS subscriptions.

## Features
🔐 **JWT authentication** with secure access tokens and role-based guards
👥 **Multi-tenant Role System** (SUPER_ADMIN at platform level, ORG_ADMIN / PROJECT_MANAGER / MEMBER at organization level)
🏢 **Organization Management** with member invitations and activity tracking
📊 **Project & Sprint Lifecycle** with structured task management
✅ **Task Tracking** with Kanban-style statuses, priorities, labels, and due dates
💬 **Team Collaboration** through task comments and file attachments
🔔 **Real-time Notifications** for task assignments and sprint updates
💰 **SaaS Subscription Billing** with strict quota limits (max projects/members/teams)
💳 **Automated bKash Checkout** for subscription upgrades, downgrades, and renewals
⚡ **Redis-backed Caching** for intent metadata and fast token retrieval
☁️ **Vercel-ready** ESM production bundle

## Technology Stack
| Layer | Technology |
| --- | --- |
| **Runtime** | Node.js 20+ |
| **Language** | TypeScript |
| **Framework** | Express 5 |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 |
| **Authentication** | JSON Web Tokens, bcryptjs |
| **Validation** | Zod |
| **Cache** | Redis |
| **Payments** | bKash Tokenized Checkout |
| **Build** | tsc |
| **Deployment** | Vercel with `@vercel/node` |

## Project Structure
```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema/
│   │   ├── enum.prisma
│   │   ├── user.prisma
│   │   ├── organization.prisma
│   │   ├── project.prisma
│   │   ├── task.prisma
│   │   └── billing.prisma
│   └── schema.prisma
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── lib/
│   ├── middleware/
│   ├── app/module/
│   │   ├── auth/
│   │   ├── invitations/
│   │   ├── organizations/
│   │   ├── projects/
│   │   ├── teams/
│   │   ├── sprints/
│   │   ├── tasks/
│   │   ├── labels/
│   │   ├── comments/
│   │   ├── attachments/
│   │   ├── activities/
│   │   ├── notifications/
│   │   ├── adminbilling/
│   │   └── organizationbilling/
│   └── utils/
├── generated/prisma/
├── package.json
├── tsconfig.json
└── vercel.json
```

## Roles
The API defines roles at two completely different levels:

**Platform Roles:**
- `SUPER_ADMIN`: Manages the entire platform, views all subscriptions, and handles platform-wide billing analytics.

**Organization Roles:**
- `ORG_ADMIN`: Manages the organization's billing, invites members, and has full control over all projects and teams.
- `PROJECT_MANAGER`: Creates and manages sprints, tasks, and teams within an organization.
- `MEMBER`: Can be assigned to tasks, comment on issues, and move tasks across sprint boards.
- `GUEST`: Read-only or limited access to specific projects.

Authentication strictly checks both the database record and the specific organization role. Blocked users cannot access protected routes.

## Architecture at a Glance
```text
Client / Frontend
  │
  │ Authorization: Bearer <token>
  ▼
Express 5 API ──► Auth + Role Middleware ──► Controllers ──► Services
  │                                                │
  ├── CORS, Zod validation, async errors            ├── Prisma ──► PostgreSQL
  ├── Global error handler                          ├── Redis ──► Intent Caching
  └── bKash Integration                             └── JWT ──► Auth verification
```

## API Route Documentation
All application routes are prefixed with `/api/v1`. Below is a comprehensive breakdown of every route, grouped by module.

### 1. Authentication Module (`/api/v1/auth`)
This module handles user registration, login, and profile fetching.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Creates a new user account. Hashes the password and saves the user. |
| `POST` | `/login` | Public | Authenticates the user and returns a JWT Access Token. |
| `GET` | `/me` | Authenticated | Returns the current logged-in user's profile data using their JWT. |

### 2. Organization Module (`/api/v1/organizations`)
This module is the core of the SaaS. Everything belongs to an organization.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Authenticated | Creates a new organization and automatically makes the creator the `ORG_ADMIN`. |
| `GET` | `/:id` | ORG_MEMBER | Fetches details of a specific organization (restricted to members of that org). |
| `GET` | `/:id/members` | ORG_MEMBER | Lists all users inside an organization with their specific roles. |

### 3. Invitation Module (`/api/v1/invitations`)
Handles bringing new users into an organization.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/send` | ORG_ADMIN | Sends an invitation (via email) to a user to join their organization. |
| `POST` | `/accept` | Authenticated | Clicked by a user to officially join the organization and become a member. |

### 4. Projects Module (`/api/v1/projects`)
Projects exist inside an organization.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | ORG_ADMIN, PROJECT_MANAGER | Creates a new project. |
| `GET` | `/` | ORG_MEMBER | Lists all projects inside an organization. |
| `GET` | `/:id` | ORG_MEMBER | Fetches specific project details (including active sprints and tasks). |
| `PATCH` | `/:id` | ORG_ADMIN, PROJECT_MANAGER | Updates project details (name, description, status). |
| `DELETE` | `/:id` | ORG_ADMIN, PROJECT_MANAGER | Soft deletes or archives a project. |

### 5. Teams Module (`/api/v1/teams`)
Handles grouping members into specific teams inside an organization.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | ORG_ADMIN, PROJECT_MANAGER | Creates a new Team. |
| `POST` | `/:id/members` | ORG_ADMIN, PROJECT_MANAGER | Adds organization members to a specific team. |
| `GET` | `/:id` | ORG_MEMBER | Fetches the team details and lists all members in it. |

### 6. Sprints Module (`/api/v1/sprints`)
Sprints belong to Projects. They represent a fixed period of time to complete tasks.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | PROJECT_MANAGER | Creates a new Sprint inside a Project. |
| `GET` | `/project/:projectId` | ORG_MEMBER | Lists all sprints (active, planned, completed) for a specific project. |
| `PATCH` | `/:id` | PROJECT_MANAGER | Updates sprint status (e.g., moving it from `PLANNED` to `ACTIVE`). |

### 7. Tasks Module (`/api/v1/tasks`)
Tasks (or Issues) are the core units of work.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | PROJECT_MANAGER, MEMBER | Creates a new task. |
| `GET` | `/sprint/:sprintId` | ORG_MEMBER | Gets all tasks for a specific sprint (for Kanban boards). |
| `PATCH` | `/:id` | Assigned Member | Updates task details (e.g., changing status to `IN_PROGRESS`). |
| `PATCH` | `/:id/assign` | PROJECT_MANAGER, MEMBER | Assigns a task to a specific team member. |

### 8. Labels Module (`/api/v1/labels`)
Labels are tags (e.g., "Bug", "Feature", "Urgent") applied to Tasks.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | PROJECT_MANAGER | Creates a new global label for a project. |
| `POST` | `/task/:taskId` | MEMBER | Attaches an existing label to a specific task. |

### 9. Comments Module (`/api/v1/comments`)
Handles discussion threads on tasks.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | ORG_MEMBER | Adds a comment to a task. |
| `GET` | `/task/:taskId` | ORG_MEMBER | Loads the comment history for a specific task. |
| `DELETE` | `/:id` | Comment Author | Deletes a comment. |

### 10. Attachments Module (`/api/v1/attachments`)
Handles file uploads (images, PDFs) attached to tasks or projects.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/upload` | ORG_MEMBER | Uploads a file and attaches it to a task. |
| `GET` | `/task/:taskId` | ORG_MEMBER | Gets all attached files for a task. |

### 11. Activities & Notifications (`/api/v1/activities` & `/notifications`)
Tracks an audit log of everything that happens and alerts users.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/activities` | ORG_ADMIN | Fetches the audit log of actions within the org. |
| `GET` | `/api/v1/organizations/:id/notifications` | Authenticated | Fetches unread alerts for the current user. |

### 12. Billing & Subscriptions (`/api/v1/billing`)
The SaaS monetization engine. Handles bKash payments and quotas.

**Organization Facing**
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/organizations/:id/get-billing` | ORG_ADMIN | Shows the org's current subscription, plan, and renewal date. |
| `GET` | `/organizations/:id/usage` | ORG_ADMIN | Compares current usage against the limits of their plan. |
| `POST` | `/organizations/:id/upgrade-billing` | ORG_ADMIN | Generates a bKash URL for the user to pay and upgrade. |
| `POST` | `/organizations/:id/downgrade` | ORG_ADMIN | Switches the user to a cheaper plan or the Free plan. |
| `POST` | `/organizations/:id/cancel` | ORG_ADMIN | Sets the subscription to cancel at the end of the month. |
| `POST` | `/organizations/:id/resume` | ORG_ADMIN | Reverses a cancellation if the month hasn't ended yet. |

**System/Admin Facing**
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/bkash/callback` | Public | The webhook that bKash hits automatically to confirm payment. |
| `GET` | `/plans` | SUPER_ADMIN | Lists all available plans (FREE, PRO, BUSINESS) and their prices. |
| `GET` | `/payments` | SUPER_ADMIN | A global route to view all payments ever made on the platform. |

## 📦 Request Formats
- JSON requests use `Content-Type: application/json`.
- Date values should be ISO-compatible strings.
- UUID route parameters must be valid PostgreSQL UUIDs.

## Standard Responses
Successful responses use the following envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "data": {}
}
```
Error responses are normalized by the global error handler.

## 🗃️ Data Model
The Prisma schema is heavily modularized under `prisma/schema/`.

**Important enum groups:**
- `PlatformRole`: SUPER_ADMIN
- `OrganizationRole`: ORG_ADMIN | PROJECT_MANAGER | MEMBER | GUEST
- `ProjectStatus`: PLANNING | ACTIVE | COMPLETED | ON_HOLD | ARCHIVED
- `SprintStatus`: PLANNED | ACTIVE | COMPLETED | CANCELLED
- `TaskStatus`: TODO | IN_PROGRESS | IN_REVIEW | DONE | BLOCKED
- `SubscriptionStatus`: ACTIVE | PAST_DUE | CANCELED | UNPAID
- `BillingInterval`: MONTHLY | YEARLY
- `PaymentStatus`: PENDING | SUCCESS | FAILED | REFUNDED

The models heavily rely on PostgreSQL UUIDs, cascading deletes, and strict relation constraints.

## Environment Variables
Create a `.env` file in the root directory. Never commit secrets.

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/project_management_saas
FRONTEND_URL=http://localhost:3000

BCRYPT_SALT_ROUNDS=12
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

REDIS_URL=redis://localhost:6379

BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=your-bkash-username
BKASH_PASSWORD=your-bkash-password
BKASH_APP_KEY=your-bkash-app-key
BKASH_APP_SECRET=your-bkash-app-secret
BKASH_CALLBACK_URL=http://localhost:5000/api/v1/billing/bkash/callback
```
*(Use production credentials and a public HTTPS callback URL in deployed environments).*

## Getting Started

**Prerequisites**
- Node.js 20 or newer
- PostgreSQL
- Redis
- bKash merchant credentials for payment flows

**Installation**
```bash
npm install
```

**Generate Prisma and Migrate**
```bash
npx prisma generate
npx prisma migrate dev
```

**Start the development server**
```bash
npm run dev
```

## Deployment
The repository includes `vercel.json` configured to serve the bundled API through `@vercel/node`.

Configure every environment variable in the Vercel dashboard before deploying. In particular, use production PostgreSQL, Redis, and bKash credentials, and set `FRONTEND_URL` to the correct deployed origins.

## 🔒 Security Notes
- Keep `.env`, JWT secrets, database credentials, Redis credentials, and provider keys out of source control.
- Use HTTPS in production for all routes and bKash callbacks.
- Restrict administrative endpoints to trusted `SUPER_ADMIN` accounts.
