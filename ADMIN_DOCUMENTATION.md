# Admin Panel — Documentation & User Manual

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
   - 2.1 [Accessing the Admin Panel](#21-accessing-the-admin-panel)
   - 2.2 [Logging In](#22-logging-in)
   - 2.3 [Session & Authentication](#23-session--authentication)
3. [Navigation](#3-navigation)
4. [Dashboard](#4-dashboard)
5. [Users Management](#5-users-management)
6. [Campaigns Management](#6-campaigns-management)
   - 6.1 [Campaign List](#61-campaign-list)
   - 6.2 [Campaign Detail Modal](#62-campaign-detail-modal)
   - 6.3 [Changing Campaign Status](#63-changing-campaign-status)
7. [Inquiries Management](#7-inquiries-management)
   - 7.1 [Inquiry List](#71-inquiry-list)
   - 7.2 [Inquiry Detail Modal](#72-inquiry-detail-modal)
8. [Supports Management](#8-supports-management)
9. [Common Table Features](#9-common-table-features)
10. [API Reference](#10-api-reference)
11. [Technical Architecture](#11-technical-architecture)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Overview

The Admin Panel is a web-based management interface for the Social Awareness Platform. It provides administrators with tools to monitor and manage users, campaigns, inquiries, and support contributions.

**Key capabilities:**

- View platform statistics at a glance (dashboard)
- Browse and search all registered users
- Review, activate, or reject campaigns
- View campaign inquiries and support/funding details
- Advanced table features: sorting, filtering, search, pagination

---

## 2. Getting Started

### 2.1 Accessing the Admin Panel

Navigate to:

```
http://localhost:5173/admin/login
```

The admin panel is completely separate from the user-facing site. All admin routes are prefixed with `/admin`.

### 2.2 Logging In

1. Open the **Admin Login** page.
2. Enter your **Email** and **Password**.
3. Click **Sign in**.

**Requirements:**

- The account must have the `admin` role in the database.
- Regular user or business accounts will be rejected with an "Access denied" message.

On successful login, you will be redirected to the **Dashboard**.

### 2.3 Session & Authentication

- **Access Token**: Valid for **15 minutes**. Stored in the browser's localStorage.
- **Refresh Token**: Valid for **7 days**. Stored as an HTTP-only cookie.
- When the access token expires, the system **automatically refreshes** it using the refresh cookie — no manual re-login required within the 7-day window.
- If the refresh token also expires, you will be redirected to the login page.

**Logging out:** Click the **Logout** button at the bottom of the sidebar. This clears your session and returns you to the login page.

---

## 3. Navigation

The sidebar on the left provides navigation to all admin sections:

| Menu Item | Icon             | Description                       |
| --------- | ---------------- | --------------------------------- |
| Dashboard | Layout Dashboard | Platform statistics overview      |
| Users     | Users            | Registered user list              |
| Campaigns | Megaphone        | Campaign management & moderation  |
| Inquiries | Message Square   | Campaign inquiry messages         |
| Supports  | Hand Heart       | Financial support/funding records |

The active page is highlighted in blue. The sidebar is always visible on the left side of the screen.

---

## 4. Dashboard

**Route:** `/admin/dashboard`

The dashboard provides a high-level overview of platform activity with **5 summary cards**:

| Card            | Description                             |
| --------------- | --------------------------------------- |
| Total Users     | Number of registered users              |
| Total Campaigns | Number of campaigns created             |
| Total Inquiries | Number of inquiry submissions           |
| Total Supports  | Number of support/funding contributions |
| Total Funding   | Combined dollar amount of all supports  |

**Clicking any card** navigates directly to the corresponding management page:

- Total Users → Users page
- Total Campaigns → Campaigns page
- Total Inquiries → Inquiries page
- Total Supports / Total Funding → Supports page

---

## 5. Users Management

**Route:** `/admin/users`

Displays a table of all registered users on the platform.

**Table Columns:**

| Column | Description                          |
| ------ | ------------------------------------ |
| SN     | Serial number (auto-incremented)     |
| Name   | User's full name                     |
| Email  | User's email address                 |
| Role   | Role badge (user / admin / business) |
| Joined | Account creation date                |

**This page is read-only.** No edit or delete actions are available. Use the search and filter features to find specific users (see [Common Table Features](#9-common-table-features)).

---

## 6. Campaigns Management

**Route:** `/admin/campaigns`

The primary moderation page for reviewing and managing campaigns.

### 6.1 Campaign List

**Table Columns:**

| Column   | Description               |
| -------- | ------------------------- |
| SN       | Serial number             |
| Title    | Campaign title            |
| Category | Campaign category         |
| Type     | `cause` or `business`     |
| Location | Campaign location         |
| Status   | Colored badge — see below |
| Created  | Campaign creation date    |

**Status Badge Colors:**

| Status   | Color  |
| -------- | ------ |
| Active   | Green  |
| Pending  | Yellow |
| Rejected | Red    |

**Click any row** to open the Campaign Detail Modal.

### 6.2 Campaign Detail Modal

When a campaign row is clicked, a modal opens showing complete campaign details:

- **Header Image** — The campaign's uploaded image
- **Title & Status Badge** — Campaign title with the current status
- **Meta Information:**
  - Category
  - Campaign Type (cause / business)
  - Location
  - Contact Email
- **Date Range** — Start date and end date
- **Description** — Full campaign description text
- **Goals** — Listed as bullet points (parsed from stored JSON)
- **Related Data:**
  - **Business campaigns** show a list of **Inquiries** (name, email, message, date)
  - **Cause campaigns** show a list of **Supports** (name, email, amount, date)

### 6.3 Changing Campaign Status

At the bottom of the Campaign Detail Modal, there are **status action buttons**:

| Button      | Color  | Action                             |
| ----------- | ------ | ---------------------------------- |
| Activate    | Green  | Sets campaign status to `active`   |
| Set Pending | Yellow | Sets campaign status to `pending`  |
| Reject      | Red    | Sets campaign status to `rejected` |

**Only buttons for statuses different from the current status are shown.** For example, if a campaign is already `active`, only "Set Pending" and "Reject" buttons appear.

**Important notes:**

- Only campaigns with `active` status are visible to users on the public homepage.
- Newly created campaigns default to `pending` status and require admin activation.
- Status changes take effect immediately — both the modal and the table update in real-time.

**Typical workflow:**

1. Navigate to the Campaigns page.
2. Filter by Status = "pending" to see campaigns awaiting review.
3. Click a campaign to review its details.
4. Click **Activate** to approve it (makes it visible on the public site) or **Reject** to deny it.

---

## 7. Inquiries Management

**Route:** `/admin/inquiries`

Displays all inquiry messages submitted by users on campaign pages.

### 7.1 Inquiry List

**Table Columns:**

| Column   | Description                             |
| -------- | --------------------------------------- |
| SN       | Serial number                           |
| Campaign | The campaign title the inquiry is about |
| Name     | Inquirer's name                         |
| Email    | Inquirer's email address                |
| Message  | Truncated message preview               |
| Date     | Submission date                         |

### 7.2 Inquiry Detail Modal

**Click any row** to open a modal with the full inquiry details:

- **Campaign** — Which campaign the inquiry is related to
- **Name** — Person who submitted the inquiry
- **Email** — Contact email
- **Message** — Full, untruncated message text
- **Date** — When the inquiry was submitted

This modal is **read-only** with a Close button.

---

## 8. Supports Management

**Route:** `/admin/supports`

Displays all financial support/funding contributions made to campaigns.

**Table Columns:**

| Column   | Description                           |
| -------- | ------------------------------------- |
| SN       | Serial number                         |
| Campaign | Campaign title the support is for     |
| Name     | Supporter's name                      |
| Email    | Supporter's email                     |
| Amount   | Dollar amount contributed (e.g., $50) |
| Date     | Contribution date                     |

**This page is read-only** with no detail modal. Use search and filter features to find specific records.

---

## 9. Common Table Features

All listing pages (Users, Campaigns, Inquiries, Supports) share these features powered by TanStack React Table:

### Global Search

- A **search input** at the top of each page filters across all columns simultaneously.
- Type any keyword to instantly filter the visible rows.

### Column Filters

- Each column header has a **filter input** below it.
- Type in a column filter to narrow results by that specific column.
- Filters are cumulative — multiple column filters work together.

### Sorting

- **Click any column header** to toggle sorting.
- First click: ascending order (↑)
- Second click: descending order (↓)
- Third click: remove sorting

### Pagination

- Tables display **10 rows per page**.
- Navigation controls at the bottom:
  - **First** / **Previous** / **Next** / **Last** page buttons
  - Current page indicator (e.g., "Page 1 of 5")

---

## 10. API Reference

All admin API endpoints require a valid JWT access token with `admin` role.

**Base URL:** `http://localhost:3000/api`

### Authentication

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| POST   | `/auth/login`   | Login (returns JWT)  |
| POST   | `/auth/refresh` | Refresh access token |

### Dashboard

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | `/admin/dashboard` | Get summary statistics |

**Response:**

```json
{
  "totalUsers": 25,
  "totalCampaigns": 12,
  "totalInquiries": 8,
  "totalSupports": 15,
  "totalFunding": 2500
}
```

### Users

| Method | Endpoint                 | Description    |
| ------ | ------------------------ | -------------- |
| GET    | `/admin/users?limit=100` | List all users |

### Campaigns

| Method | Endpoint                         | Description                  |
| ------ | -------------------------------- | ---------------------------- |
| GET    | `/admin/campaigns?limit=100`     | List all campaigns           |
| PATCH  | `/admin/campaigns/approve/:id`   | Change campaign status       |
| GET    | `/admin/campaigns/:id/inquiries` | Get inquiries for a campaign |
| GET    | `/admin/campaigns/:id/supports`  | Get supports for a campaign  |

**PATCH body for status change:**

```json
{
  "status": "active"
}
```

Valid values: `pending`, `active`, `rejected`

### Inquiries

| Method | Endpoint                               | Description        |
| ------ | -------------------------------------- | ------------------ |
| GET    | `/admin/campaigns/inquiries?limit=100` | List all inquiries |

### Supports

| Method | Endpoint                              | Description       |
| ------ | ------------------------------------- | ----------------- |
| GET    | `/admin/campaigns/supports?limit=100` | List all supports |

---

## 11. Technical Architecture

### Frontend Stack

- **React 18** with TypeScript
- **Vite** — Build tool and dev server
- **Tailwind CSS 4** — Utility-first styling
- **React Router 7** — Client-side routing
- **@tanstack/react-table** — Headless table with sorting, filtering, pagination
- **Lucide React** — Icon library
- **Sonner** — Toast notifications

### Backend Stack

- **Express.js** (ES modules)
- **MySQL** via `mysql2/promise`
- **JWT** — Authentication (access + refresh tokens)
- **bcrypt** — Password hashing

### Project Structure

```
src/app/admin/
├── components/
│   └── AdminSidebar.tsx        # Sidebar navigation
├── layout/
│   └── AdminLayout.tsx         # Page layout wrapper
├── pages/
│   ├── AdminLogin.tsx          # Login page
│   ├── AdminDashboard.tsx      # Dashboard with stats
│   ├── AdminUsers.tsx          # Users list
│   ├── AdminCampaigns.tsx      # Campaigns list + detail modal
│   ├── AdminInquiries.tsx      # Inquiries list + detail modal
│   └── AdminSupports.tsx       # Supports list
├── routes/
│   └── AdminRoute.tsx          # Auth guard component
├── services/
│   ├── adminAuth.ts            # Login, logout, token management
│   └── adminApi.ts             # API functions + auto-refresh
└── types/
    └── admin.types.ts          # TypeScript interfaces
```

### Authentication Flow

```
Login → POST /auth/login → JWT access token (15min) + refresh cookie (7 days)
                                  ↓
                     Stored in localStorage
                                  ↓
                   All API calls include Bearer token
                                  ↓
              On 401 → POST /auth/refresh (using cookie)
                                  ↓
                   New access token → retry request
                                  ↓
              If refresh fails → redirect to /admin/login
```

### Database Tables

| Table                | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `users`              | User accounts (role ENUM: user/admin/business)       |
| `campaigns`          | Campaign data (status ENUM: pending/active/rejected) |
| `campaign_inquiries` | Inquiry messages on campaigns                        |
| `supports`           | Financial contributions                              |

---

## 12. Troubleshooting

| Problem                            | Solution                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Login says "Access denied"         | Your account doesn't have the `admin` role in the database.                                |
| Redirected to login frequently     | The refresh token may have expired. Log in again.                                          |
| Dashboard shows all zeros          | Check that the backend server is running on port 3000.                                     |
| Campaign images not loading        | Ensure the backend `/uploads` directory is accessible and CORS is configured.              |
| Table shows no data                | Check browser console for API errors. Verify the backend is running.                       |
| Status change button not working   | Check browser console for 401/403 errors. Re-login if needed.                              |
| Campaigns not showing on user site | Only `active` campaigns appear on the public homepage. Activate them from the admin panel. |
