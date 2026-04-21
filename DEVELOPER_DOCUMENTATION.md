# Developer Documentation — User Platform

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Prerequisites](#3-prerequisites)
4. [Environment Setup](#4-environment-setup)
   - 4.1 [Clone & Install](#41-clone--install)
   - 4.2 [Environment Variables](#42-environment-variables)
   - 4.3 [Running Locally](#43-running-locally)
   - 4.4 [Building for Production](#44-building-for-production)
5. [Project Structure](#5-project-structure)
6. [Routing](#6-routing)
7. [Authentication](#7-authentication)
   - 7.1 [AuthContext](#71-authcontext)
   - 7.2 [Token Lifecycle](#72-token-lifecycle)
   - 7.3 [Protected Routes](#73-protected-routes)
8. [API Service Layer](#8-api-service-layer)
   - 8.1 [campaignApi.ts — Types](#81-campaignapits--types)
   - 8.2 [campaignApi.ts — Functions](#82-campaignapits--functions)
   - 8.3 [HTTP Client Pattern](#83-http-client-pattern)
9. [Component Reference](#9-component-reference)
   - 9.1 [Header](#91-header)
   - 9.2 [HomePage](#92-homepage)
   - 9.3 [CampaignCard](#93-campaigncard)
   - 9.4 [CampaignDetailPage](#94-campaigndetailpage)
   - 9.5 [NewCampaignPage](#95-newcampaignpage)
   - 9.6 [UserDashboard](#96-userdashboard)
   - 9.7 [AlertModal & ConfirmationModal](#97-alertmodal--confirmationmodal)
10. [State Management Patterns](#10-state-management-patterns)
11. [Responsive Design Conventions](#11-responsive-design-conventions)
12. [Toast Notifications](#12-toast-notifications)
13. [Image Handling](#13-image-handling)
14. [Deployment](#14-deployment)
15. [Known Patterns & Conventions](#15-known-patterns--conventions)
16. [Extending the Platform](#16-extending-the-platform)

---

## 1. Project Overview

The **Social Awareness Platform** is a single-page React application that enables users to:

- Browse, filter, and paginate active campaigns (social causes and small businesses)
- View full campaign details on a dedicated page
- Vote, support, and inquire on campaigns
- Create and manage their own campaigns from a personal dashboard

The frontend communicates with a REST API backend deployed on Railway. Authentication uses short-lived JWT access tokens (stored in `localStorage`) combined with HTTP-only refresh token cookies.

---

## 2. Technology Stack

| Technology   | Version | Purpose                                     |
| ------------ | ------- | ------------------------------------------- |
| React        | 18      | UI component library                        |
| TypeScript   | 5       | Static typing                               |
| Vite         | 6       | Build tool and dev server                   |
| Tailwind CSS | 4       | Utility-first CSS framework                 |
| React Router | 7       | Client-side routing (`createBrowserRouter`) |
| Lucide React | latest  | Icon components                             |
| Sonner       | latest  | Toast notification library                  |
| PostCSS      | —       | CSS processing (Tailwind pipeline)          |

---

## 3. Prerequisites

| Requirement | Version |
| ----------- | ------- |
| Node.js     | ≥ 18.x  |
| npm         | ≥ 9.x   |

---

## 4. Environment Setup

### 4.1 Clone & Install

```bash
git clone https://github.com/ashustha/social-campaigns-frontend
cd social-campaigns-frontend
npm install
```

### 4.2 Environment Variables

Two `.env` files control the API base URL:

| File               | Mode            | Variable                                                                                |
| ------------------ | --------------- | --------------------------------------------------------------------------------------- |
| `.env.development` | `npm run dev`   | `VITE_API_BASE_URL=http://localhost:3000/api`                                           |
| `.env.production`  | `npm run build` | `VITE_API_BASE_URL=https://social-awareness-campaigns-team5-project.up.railway.app/api` |

All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser bundle via `import.meta.env.VITE_*`.

The API base URL is consumed in `src/app/services/campaignApi.ts`:

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
```

### 4.3 Running Locally

```bash
npm run dev
# Server starts at http://localhost:5173
```

### 4.4 Building for Production

```bash
npm run build
# Output in /dist
npm run start
# Preview the production build locally
```

---

## 5. Project Structure

```
src/
├── main.tsx                          # React entry point — mounts <App />
├── vite-env.d.ts                     # Vite type declarations
├── app/
│   ├── App.tsx                       # Root: wraps AuthProvider, BrowserRouter, Toaster
│   ├── routes.tsx                    # createBrowserRouter route tree
│   ├── components/
│   │   ├── Header.tsx                # Responsive top navigation bar
│   │   ├── HomePage.tsx              # Landing page: hero, filters, paginated grid
│   │   ├── LoginPage.tsx             # Login form
│   │   ├── RegisterPage.tsx          # Registration form (individual + business)
│   │   ├── DashboardPage.tsx         # Route guard → renders UserDashboard
│   │   ├── UserDashboard.tsx         # User's campaign list + delete
│   │   ├── NewCampaignPage.tsx       # Full-page campaign creation form
│   │   ├── CreateCampaignWizard.tsx  # Campaign form logic (used by NewCampaignPage)
│   │   ├── CampaignCard.tsx          # Card component used in home grid & preview
│   │   ├── CampaignDetailPage.tsx    # Full-page campaign detail (/campaign/:id)
│   │   ├── ProtectedRoute.tsx        # Role-based route guard (user/business only)
│   │   ├── CampaignDetailModal.tsx   # Legacy modal (kept but not used on home page)
│   │   ├── AlertModal.tsx            # Simple dismissible alert dialog
│   │   ├── ConfirmationModal.tsx     # Confirm / Cancel dialog
│   │   └── figma/
│   │       └── ImageWithFallback.tsx # <img> with graceful error fallback
│   ├── context/
│   │   └── AuthContext.tsx           # Global auth state, login, logout, token refresh
│   ├── services/
│   │   └── campaignApi.ts            # All API interactions — typed request/response
│   └── utils/
│       └── toast.ts                  # Thin wrappers over Sonner toast calls
├── styles/
│   ├── index.css                     # CSS reset and globals
│   ├── tailwind.css                  # Tailwind @import
│   ├── theme.css                     # CSS custom properties / design tokens
│   └── fonts.css                     # @font-face definitions
public/
├── _redirects                        # Netlify SPA routing: /* /index.html 200
└── uploads/                          # Static uploaded assets (development)
```

---

## 6. Routing

Routes are defined in `src/app/routes.tsx` using React Router v7's `createBrowserRouter`.

### Route Tree

| Path            | Component            | Auth Required       | Notes                                                                                     |
| --------------- | -------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `/`             | `HomePage`           | No                  | Public landing page                                                                       |
| `/login`        | `LoginPage`          | No                  | Redirects to `/` if already authenticated                                                 |
| `/register`     | `RegisterPage`       | No                  |                                                                                           |
| `/dashboard`    | `DashboardPage`      | Yes (user/business) | Wrapped in `ProtectedRoute`; redirects to `/login` if not auth'd, `/admin/login` if admin |
| `/campaign/new` | `NewCampaignPage`    | Yes (user/business) | Wrapped in `ProtectedRoute`; must appear before `/campaign/:id`                           |
| `/campaign/:id` | `CampaignDetailPage` | Yes                 | Dynamic route; `:id` maps to campaign ID                                                  |
| `/admin/*`      | Admin sub-tree       | Admin only          | Separate from user routes; guarded by `AdminRoute`                                        |

> **Important:** `/campaign/new` must appear before `/campaign/:id` in the route array to prevent the string "new" from being matched as a campaign ID.

### Programmatic Navigation

Components use the `useNavigate` hook for imperative navigation:

```tsx
const navigate = useNavigate();
navigate('/campaign/new');
navigate(-1); // browser back
```

---

## 7. Authentication

### 7.1 AuthContext

**File:** `src/app/context/AuthContext.tsx`

Wraps the application in a React context that provides:

```ts
interface AuthContextValue {
  user: User | null; // null if not logged in
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
}
```

The context reads the stored user from `localStorage` on mount and subscribes to the custom `auth:logout` browser event for multi-tab logout synchronisation.

### 7.2 Token Lifecycle

```
POST /auth/login
  → Access token (JWT, 15 min) stored in localStorage as "token" / "accessToken"
  → Refresh token (HTTP-only cookie, 7 days)

On any 401 response:
  → POST /auth/refresh (sends cookie automatically)
  → New access token stored in localStorage
  → Original request retried

On refresh 401:
  → window.dispatchEvent(new Event('auth:logout'))
  → localStorage cleared
  → Redirected to /login
```

All authenticated API calls send the header:

```
Authorization: Bearer <accessToken>
```

### 7.3 Protected Routes

Two guard components are used:

**`ProtectedRoute`** (`src/app/components/ProtectedRoute.tsx`)

Wraps routes that require a logged-in `user` or `business` account. Redirects:

- Unauthenticated visitors → `/login`
- Authenticated admins → `/admin/login` (admins may not use the user portal)

```tsx
const ALLOWED_ROLES = ['user', 'business'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!ALLOWED_ROLES.includes(user.role))
    return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
```

Used in `routes.tsx` to wrap `/dashboard` and `/campaign/new`.

**`AdminRoute`** (`src/app/admin/routes/AdminRoute.tsx`)

Guards all `/admin/*` routes. Redirects to `/admin/login` if `getAdminUser()?.role !== 'admin'` or no admin session is present.

**`AuthContext.login()` gate**

Before storing any session, `login()` checks the returned role:

```ts
if (userData.role === 'admin')
  return {
    success: false,
    message: 'Admin accounts must use the admin portal.',
  };
if (!['user', 'business'].includes(userData.role))
  return { success: false, message: 'Access denied. Invalid account type.' };
```

This prevents admin credentials from ever being stored in the user-facing auth context.

---

## 8. API Service Layer

**File:** `src/app/services/campaignApi.ts`

All API interactions are centralised here. Each function returns a typed response object (never throws). Error messages come from the API response body or a fallback string.

### 8.1 campaignApi.ts — Types

```ts
// Campaign type discriminator
type CampaignType = 'cause' | 'business';

// Used in home page grid and campaign detail
interface CampaignListItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  type: CampaignType;
  category: string;
  startDate: string;
  endDate?: string;
  supporters: string;
  location: string;
  contact: string;
  goals: string[];
  upvotes: number;
  downvotes: number;
  videoUrl?: string;
  userId?: string; // ID of the campaign owner (used to detect ownership in the UI)
}

// Used in the user's dashboard
interface UserCampaignItem {
  id: string;
  title: string;
  description: string;
  image: string;
  type: CampaignType;
  category: string;
  status: 'Active' | 'Pending' | 'Completed';
  supporters: string;
  startDate: string;
}

// Vote state returned after fetching or casting a vote
interface CampaignVotesResponse {
  success: boolean;
  message: string;
  data?: {
    upvotes: number;
    downvotes: number;
    userVote: 'upvote' | 'downvote' | null;
  };
}

// A single supporter entry (returned for campaign owners)
interface CampaignSupportItem {
  id: string | number;
  name: string;
  email: string;
  amount: number;
  message?: string;
  createdAt: string;
}

// A single inquiry entry (returned for campaign owners)
interface CampaignInquiryItem {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  createdAt: string;
}
```

### 8.2 campaignApi.ts — Functions

| Function                       | Method | Endpoint                      | Auth? | Description                                        |
| ------------------------------ | ------ | ----------------------------- | ----- | -------------------------------------------------- |
| `fetchCampaigns()`             | GET    | `/campaigns/campaigns`        | No    | All active campaigns                               |
| `fetchCampaignById(id)`        | GET    | `/campaigns/:id`              | No    | Single campaign by ID                              |
| `fetchMyCampaigns()`           | GET    | `/user/my-campaigns`          | Yes   | Campaigns owned by the logged-in user              |
| `createCampaign(input)`        | POST   | `/campaigns/create`           | Yes   | Create a new campaign (multipart)                  |
| `deleteCampaign(id)`           | DELETE | `/campaigns/:id`              | Yes   | Delete a campaign (owner only)                     |
| `fetchCampaignVotes(id)`       | GET    | `/campaigns/:id/votes`        | Yes   | Vote counts + current user's vote                  |
| `voteCampaign(id, voteType)`   | POST   | `/campaigns/:id/vote`         | Yes   | Cast or toggle an upvote/downvote                  |
| `supportCampaign(id, payload)` | POST   | `/campaigns/:id/support`      | Yes   | Submit financial support for a cause               |
| `inquiryCampaign(id, payload)` | POST   | `/campaigns/:id/inquiry`      | Yes   | Submit a business inquiry                          |
| `fetchCampaignSupporters(id)`  | GET    | `/campaigns/:id/my-supports`  | Yes   | Owner-only: get supporters for a specific campaign |
| `fetchCampaignInquiries(id)`   | GET    | `/campaigns/:id/my-inquiries` | Yes   | Owner-only: get inquiries for a specific campaign  |

### 8.3 HTTP Client Pattern

Each function follows this pattern:

```ts
async function fetchCampaigns(): Promise<FetchCampaignsResponse> {
  try {
    const token = localStorage.getItem('accessToken') ?? localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/campaigns/campaigns`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.message ?? 'Request failed', data: [] };
    }
    return { success: true, message: 'OK', data: /* mapped data */ };
  } catch {
    return { success: false, message: 'Connection error. Please try again.', data: [] };
  }
}
```

**Key decisions:**

- Functions never throw — callers always receive `{ success, message, data? }`.
- Token is read from `localStorage` at call time (not cached in module scope).
- Image uploads use `FormData` (multipart); JSON-only calls use `Content-Type: application/json`.
- `fetchCampaignById` tries the direct endpoint first, with a full-list fallback for compatibility.

---

## 9. Component Reference

### 9.1 Header

**File:** `src/app/components/Header.tsx`

Responsive top navigation bar rendered on every page.

**Props:**

```ts
interface HeaderProps {
  title?: string; // Page title shown in the centre
  subtitle?: string; // Sub-text below the title
  back?: {
    position: 'left' | 'right';
    to: string; // Navigation target
    label: string; // Accessible label
  };
}
```

**Behaviour:**

- Brand name shows "Advanced Consulting Services" on desktop, "ACS" on mobile (`sm:inline hidden`).
- When `user` is authenticated: shows "My Dashboard" button (icon-only on mobile) and a user dropdown with Logout.
- When not authenticated: shows "Login" button.
- When `back` prop is provided: a back-arrow button appears at the specified `position`.

---

### 9.2 HomePage

**File:** `src/app/components/HomePage.tsx`

Main landing page. Manages:

- Fetching all campaigns on mount (`fetchCampaigns`)
- Filter state: `filterType` (`'all' | 'cause' | 'business'`) and `filterLocation` (string)
- Pagination state: `currentPage` (integer, 1-based), `PAGE_SIZE = 12`

**Derived values:**

```ts
const filteredCampaigns = campaigns.filter(/* type + location match */);
const totalPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE);
const paginatedCampaigns = filteredCampaigns.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE,
);
```

**Important:** Changing any filter resets `currentPage` to `1`.

**Filter UI:**

- Type buttons and a location `<select>` rendered in a column on mobile, row on desktop.
- Campaign count badge shown next to the location select.

**Pagination UI:**

- Rendered only when `totalPages > 1`.
- Previous / Next buttons with disabled state on boundaries.
- Numbered page buttons — all pages are rendered (no ellipsis for large page counts).

---

### 9.3 CampaignCard

**File:** `src/app/components/CampaignCard.tsx`

Renders a single campaign as a card.

**Props:**

```ts
interface CampaignCardProps {
  campaign: CampaignListItem;
  onVoteUpdate?: (id: string, upvotes: number, downvotes: number) => void;
}
```

> `onReadMore` prop was removed. The card now navigates directly to `/campaign/:id` via `useNavigate`.

**Behaviour:**

- "Read More" button calls `navigate('/campaign/${campaign.id}')`.
- Vote buttons call `voteCampaign` from the API service.
- If the user is not authenticated, clicking vote triggers a confirmation modal to redirect to login.

---

### 9.4 CampaignDetailPage

**File:** `src/app/components/CampaignDetailPage.tsx`

**Route:** `/campaign/:id`

Full-page campaign detail view. Replaces the previous modal-based approach.

**Data loading:**

```
1. Try fetchCampaignById(id)   → use if successful
2. Fallback: fetchCampaigns()  → find campaign by id in the list
3. If still not found → show error message
```

Vote state is loaded separately via `fetchCampaignVotes(id)` after the campaign loads.

**Ownership detection:**

```ts
const isOwner =
  campaign?.userId != null &&
  user?.id != null &&
  String(campaign.userId) === String(user.id);
```

`isOwner` is a derived constant (not state). It is used to:

- Show/hide the **CTA button** (`{!isOwner && <button ...>}`)
- Conditionally render the **Owner Activity Panel**
- Guard the `useEffect` that fetches supporter/inquiry data

**Layout strategy:**

| Viewport          | Implementation                        |
| ----------------- | ------------------------------------- |
| Mobile + Tablet   | `lg:hidden` fixed bottom action bar   |
| Desktop (≥1024px) | `hidden lg:flex` sticky right sidebar |

The bottom bar contains vote buttons and share toggle. The CTA button appears in the main content column (not the bottom bar) and is hidden for owners.

**Owner Activity Panel:**

Rendered only when `isOwner === true`. Fetches data from owner-specific authenticated endpoints:

| Campaign Type | Endpoint                          | Data Shown      |
| ------------- | --------------------------------- | --------------- |
| `cause`       | `GET /campaigns/:id/my-supports`  | Supporters list |
| `business`    | `GET /campaigns/:id/my-inquiries` | Inquiries list  |

No tabs — the panel shows only the relevant data type based on `campaign.type`.

**Support modal:** Uses local state (`showSupportModal`, `supportForm`). On submit calls `supportCampaign(id, payload)`.

**Inquiry modal:** Uses local state (`showLearnMoreModal`, `learnMoreForm`). Validates Australian phone number with regex `^(\+61|0)[2-478]\d{8}$`. On submit calls `inquiryCampaign(id, payload)`.

**Share menu:** Toggle state `showShareMenu`. Opens platform URLs with `window.open(..., '_blank')`.

---

### 9.5 NewCampaignPage

**File:** `src/app/components/NewCampaignPage.tsx`

**Route:** `/campaign/new`

Campaign creation page with form validation and live preview.

**Layout:**

```
<div class="grid grid-cols-1 lg:grid-cols-12">
  <aside class="hidden lg:block lg:col-span-4">  <!-- Live preview: desktop only -->
    <CampaignCard campaign={previewCampaign} />
  </aside>
  <section class="lg:col-span-8">               <!-- Form: always visible -->
    ...
  </section>
</div>
```

> The live preview (`<aside>`) is hidden on mobile/tablet via `hidden lg:block`. It only renders on `lg` breakpoint and above.

**Form state:** A single `formData` object + a `touchedFields` set for progressive error display (errors shown only after a field has been blurred).

**`previewCampaign`:** A `CampaignListItem` object derived from `formData` used as the `campaign` prop for the preview `CampaignCard`. Updates reactively as the user types.

**Image handling:** File input is validated for MIME type (`image/jpeg`, `image/jpg`, `image/png`). Rejected files show a toast. Valid files are read via `FileReader` to produce a base64 `imagePreview` string.

**Campaign type:** Auto-assigned from `user.role`. Not editable by the user.

**On submit:** Calls `createCampaign(formData)` which sends a `FormData` (multipart) POST. On success, navigates to `/dashboard`.

---

### 9.6 UserDashboard

**File:** `src/app/components/UserDashboard.tsx`

**Route:** `/dashboard` (rendered by `DashboardPage`)

Manages the user's own campaigns: list, status display, and deletion.

**Props:**

```ts
interface UserDashboardProps {
  onCreateCampaign: () => void; // Called by DashboardPage to navigate to /campaign/new
}
```

**Data loading:** On mount, calls `fetchMyCampaigns()`. Uses `isMounted` flag to prevent state updates after unmount.

**Deletion flow:**

```
Click trash icon
  → setCampaignToDelete(id) + setShowDeleteModal(true)
  → User confirms
  → deleteCampaign(id) API call
  → On success: remove from local state array + show AlertModal
  → On failure: show AlertModal with error
```

**Status colour mapping:**

```ts
'Active'    → 'bg-green-100 text-green-800'
'Pending'   → 'bg-yellow-100 text-yellow-800'
'Completed' → 'bg-gray-100 text-gray-800'
default     → 'bg-blue-100 text-blue-800'  // covers 'Rejected' and unknowns
```

**Responsive layout:**

- Campaign cards: `flex-col lg:flex-row` — stacked on mobile/tablet, side-by-side on desktop (≥1024px)
- Campaign image: `w-full lg:w-64 h-48` — full width when stacked, fixed 256px when side-by-side
- Heading: `text-xl sm:text-3xl`
- "Create New Campaign" button label: `<span class="sm:hidden">New</span><span class="hidden sm:inline">Create New Campaign</span>`
- Delete button: icon-only on mobile, icon + "Delete" label on desktop
- Campaign title: `text-lg sm:text-2xl truncate`

---

### 9.7 AlertModal & ConfirmationModal

**AlertModal** (`src/app/components/AlertModal.tsx`)

Simple single-button dialog for displaying a message. Used after delete operations.

```ts
interface AlertModalProps {
  title: string;
  message: string;
  onClose: () => void;
}
```

**ConfirmationModal** (`src/app/components/ConfirmationModal.tsx`)

Two-button dialog (Confirm / Cancel). Used for delete confirmation and login prompts.

```ts
interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string; // defaults to "Confirm"
  cancelLabel?: string; // defaults to "Cancel"
}
```

---

## 10. State Management Patterns

The application uses **local component state** (`useState`, `useEffect`) — no global state library. The only shared state is in `AuthContext`.

### Pattern: API call in useEffect with isActive guard

```tsx
useEffect(() => {
  let isActive = true;

  async function load() {
    const response = await fetchCampaigns();
    if (!isActive) return; // Prevent state updates after unmount
    if (response.success) {
      setData(response.data);
    } else {
      setError(response.message);
    }
    setIsLoading(false);
  }

  void load();

  return () => {
    isActive = false;
  };
}, [dependency]);
```

This pattern is used in `HomePage`, `CampaignDetailPage`, and `UserDashboard`.

### Pattern: Optimistic vote UI

Vote counts are stored in local state and updated from the API response:

```tsx
const submitVote = async (voteType: 'upvote' | 'downvote') => {
  if (isSubmittingVote || !id) return;
  setIsSubmittingVote(true);
  const response = await voteCampaign(id, voteType);
  if (response.success && response.data) {
    setUpvotes(response.data.upvotes);
    setDownvotes(response.data.downvotes);
    setUserVote(response.data.userVote);
  }
  setIsSubmittingVote(false);
};
```

Counts come from the server response (not incremented client-side) to remain accurate.

---

## 11. Responsive Design Conventions

Tailwind CSS breakpoints used throughout:

| Prefix | Minimum Width | Usage                                                                 |
| ------ | ------------- | --------------------------------------------------------------------- |
| (none) | 0px           | Mobile-first default styles                                           |
| `sm:`  | 640px         | Show desktop labels, hide mobile variants                             |
| `md:`  | 768px         | 2-column campaign grid, hero section adjustments                      |
| `lg:`  | 1024px        | 3-column grid, live preview, side-by-side card layout, sticky sidebar |

### Patterns used in this codebase

**Hide on mobile, show on desktop:**

```html
<span class="hidden sm:inline">Create New Campaign</span>
```

**Show on mobile, hide on desktop:**

```html
<span class="sm:hidden">New</span>
```

**Mobile + tablet fixed bottom bar (CampaignDetailPage):**

```html
<div
  class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t ..."
></div>
```

**Desktop-only sticky sidebar (CampaignDetailPage):**

```html
<div class="hidden lg:flex flex-col fixed right-8 ..."></div>
```

**Live preview desktop-only (NewCampaignPage):**

```html
<aside class="hidden lg:block lg:col-span-4"></aside>
```

**Dashboard campaign card layout:**

```html
<div class="flex flex-col lg:flex-row">
  <div class="w-full lg:w-64 h-48 flex-shrink-0"><!-- image --></div>
  <div><!-- content --></div>
</div>
```

---

## 12. Toast Notifications

**File:** `src/app/utils/toast.ts`

Thin wrappers over the Sonner library:

```ts
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  warning: (message: string) => sonnerToast.warning(message),
  info: (message: string) => sonnerToast.info(message),
};
```

The `<Toaster />` component is mounted once in `App.tsx` with the `closeButton` prop:

```tsx
<Toaster position="top-right" closeButton />
```

This renders an ✕ close button on every toast, allowing users to dismiss notifications immediately.

**Usage:**

```ts
import { toast } from '../utils/toast';

toast.success('Campaign submitted');
toast.error('Failed to load campaigns');
```

---

## 13. Image Handling

### Upload (campaign creation)

- File input accepts `image/jpeg`, `image/jpg`, `image/png` only.
- Validated by MIME type check in the `onChange` handler.
- Valid files are read with `FileReader.readAsDataURL` to produce a base64 preview string.
- The actual `File` object is stored in `formData.imageFile`.
- On submit, if `imageFile` is set, the request is sent as `multipart/form-data`; otherwise as JSON.

### Display (`ImageWithFallback`)

**File:** `src/app/components/figma/ImageWithFallback.tsx`

Wraps `<img>` with an `onError` handler that swaps in a placeholder when the image URL is broken or missing.

```tsx
<ImageWithFallback
  src={campaign.image}
  alt={campaign.title}
  className="w-full h-48 object-cover"
/>
```

The backend serves uploaded images from the `/uploads` directory. In development, images are served directly from the backend. In production, the image URL from the API response is used as-is.

---

## 14. Deployment

### Frontend — Netlify

| Setting              | Value                                        |
| -------------------- | -------------------------------------------- |
| Build command        | `npm run build`                              |
| Publish directory    | `dist`                                       |
| Environment variable | `VITE_API_BASE_URL` = production backend URL |

**SPA routing:** `public/_redirects` contains:

```
/* /index.html 200
```

This ensures that direct navigation to any client-side route (e.g., `/campaign/abc123`) is handled by the React app rather than returning a 404.

### Backend — Railway

The backend API is hosted at:

```
https://social-awareness-campaigns-team5-project.up.railway.app
```

The frontend reads this URL from `VITE_API_BASE_URL` at build time.

### Build Process

```bash
npm run build
# 1. Vite processes all TypeScript/TSX through esbuild
# 2. Tailwind CSS is processed via PostCSS
# 3. Assets are hashed and written to /dist
# 4. index.html references the hashed bundles
```

---

## 15. Known Patterns & Conventions

### API Response Shape

All API functions return a consistent shape:

```ts
{
  success: boolean;   // true = usable data
  message: string;    // human-readable status
  data?: T;           // present when success = true
}
```

Callers always check `response.success` before using `response.data`.

### No Default Exports for Pages

Page components use **named exports**:

```ts
export function HomePage() { ... }
export function CampaignDetailPage() { ... }
```

Imported in `routes.tsx` as:

```ts
import { HomePage } from '../components/HomePage';
```

### Date Formatting

Dates from the API are formatted for display using:

```ts
function formatDisplayDate(dateValue: string) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;
  return parsedDate.toLocaleDateString('en-GB'); // DD/MM/YYYY
}
```

### `void` for floating promises

Async functions not awaited (e.g., in `useEffect`) are prefixed with `void` to satisfy the TypeScript `@typescript-eslint/no-floating-promises` rule:

```ts
void loadCampaigns();
```

---

## 16. Extending the Platform

### Adding a New Page

1. Create `src/app/components/MyNewPage.tsx` with a named export.
2. Add a route in `src/app/routes.tsx`:
   ```ts
   import { MyNewPage } from '../components/MyNewPage';
   // ...
   { path: '/my-new-route', element: <MyNewPage /> }
   ```
3. If it requires authentication, add a guard check using `useAuth`:
   ```ts
   const { isAuthenticated } = useAuth();
   useEffect(() => {
     if (!isAuthenticated) navigate('/login');
   }, [isAuthenticated, navigate]);
   ```
4. Add a link in `Header.tsx` if needed.

### Adding a New API Function

1. Define the request/response types in `campaignApi.ts`.
2. Write the function following the existing pattern (try/catch, return `{ success, message, data? }`).
3. Use the function in the relevant component.

### Changing the Page Size for Pagination

In `HomePage.tsx`, update the constant:

```ts
const PAGE_SIZE = 12; // Change to desired number
```

### Adding a New Filter

1. Add a `useState` for the new filter value.
2. Add it to the `filteredCampaigns` `filter()` predicate.
3. Reset `currentPage` to 1 in the filter's `onChange` / `onClick` handler.
4. Add the UI control (button or select) in the filters section.
