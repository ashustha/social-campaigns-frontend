# User Platform — Documentation & User Manual

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
   - 2.1 [Accessing the Platform](#21-accessing-the-platform)
   - 2.2 [Creating an Account](#22-creating-an-account)
   - 2.3 [Logging In](#23-logging-in)
   - 2.4 [Session & Authentication](#24-session--authentication)
   - 2.5 [Logging Out](#25-logging-out)
3. [Navigation & Header](#3-navigation--header)
4. [Home Page — Browsing Campaigns](#4-home-page--browsing-campaigns)
   - 4.1 [Hero Section](#41-hero-section)
   - 4.2 [Campaign Filters](#42-campaign-filters)
   - 4.3 [Campaign Cards](#43-campaign-cards)
   - 4.4 [Loading & Empty States](#44-loading--empty-states)
5. [Campaign Details](#5-campaign-details)
   - 5.1 [Opening Campaign Details](#51-opening-campaign-details)
   - 5.2 [Detail Modal Layout](#52-detail-modal-layout)
   - 5.3 [Sharing Campaigns](#53-sharing-campaigns)
6. [Voting on Campaigns](#6-voting-on-campaigns)
   - 6.1 [How Voting Works](#61-how-voting-works)
   - 6.2 [Vote States & Colors](#62-vote-states--colors)
7. [Supporting a Social Cause](#7-supporting-a-social-cause)
   - 7.1 [Support Form Fields](#71-support-form-fields)
   - 7.2 [Submitting Support](#72-submitting-support)
8. [Inquiring About a Business](#8-inquiring-about-a-business)
   - 8.1 [Inquiry Form Fields](#81-inquiry-form-fields)
   - 8.2 [Phone Number Validation](#82-phone-number-validation)
   - 8.3 [Submitting an Inquiry](#83-submitting-an-inquiry)
9. [Creating a Campaign](#9-creating-a-campaign)
   - 9.1 [Accessing the Campaign Form](#91-accessing-the-campaign-form)
   - 9.2 [Form Fields Reference](#92-form-fields-reference)
   - 9.3 [Image Upload](#93-image-upload)
   - 9.4 [Date Rules](#94-date-rules)
   - 9.5 [Live Preview](#95-live-preview)
   - 9.6 [Validation Rules](#96-validation-rules)
   - 9.7 [Submission & What Happens Next](#97-submission--what-happens-next)
10. [User Dashboard — Managing Your Campaigns](#10-user-dashboard--managing-your-campaigns)
    - 10.1 [Viewing Your Campaigns](#101-viewing-your-campaigns)
    - 10.2 [Campaign Status Badges](#102-campaign-status-badges)
    - 10.3 [Deleting a Campaign](#103-deleting-a-campaign)
11. [Notifications & Toasts](#11-notifications--toasts)
12. [User Flows — Step-by-Step Walkthroughs](#12-user-flows--step-by-step-walkthroughs)
    - 12.1 [New User — From Registration to First Campaign](#121-new-user--from-registration-to-first-campaign)
    - 12.2 [Returning User — Supporting a Cause](#122-returning-user--supporting-a-cause)
    - 12.3 [Returning User — Inquiring About a Business](#123-returning-user--inquiring-about-a-business)
13. [API Reference (User Endpoints)](#13-api-reference-user-endpoints)
14. [Technical Architecture](#14-technical-architecture)
15. [Responsive Design & Layout](#15-responsive-design--layout)
16. [Troubleshooting](#16-troubleshooting)
17. [FAQ](#17-faq)

---

## 1. Overview

The **Social Awareness Platform** is a web application that connects communities across Australia. It allows users to:

- **Browse** active campaigns for social causes and small businesses
- **Vote** on campaigns (upvote or downvote) to express support
- **Financially support** social cause campaigns with a monetary contribution
- **Inquire** about small business campaigns via a contact form
- **Create** their own campaigns to raise awareness or promote a business
- **Manage** their campaigns from a personal dashboard
- **Share** campaigns on social media (Facebook, Twitter, LinkedIn)

The platform covers communities in **Melbourne, Sydney, Brisbane, Adelaide, and Perth**.

---

## 2. Getting Started

### 2.1 Accessing the Platform

Open your browser and navigate to:

```
http://localhost:5173/
```

The home page is accessible to everyone — no login required to browse campaigns. However, you must be logged in to:

- View full campaign details
- Vote on campaigns
- Support a cause or inquire about a business
- Create a new campaign
- Access your personal dashboard

### 2.2 Creating an Account

1. Click the **Login** button in the top-right corner of the header.
2. On the login page, click the **"Register here"** link at the bottom.
3. Fill in the registration form:

| Field            | Requirements                                        |
| ---------------- | --------------------------------------------------- |
| Full Name        | Required. Cannot be empty.                          |
| Email Address    | Required. Must be a valid email format.             |
| Password         | Required. Must meet all password rules (see below). |
| Confirm Password | Required. Must exactly match the password field.    |

#### Password Rules

When you focus on the password field, a live validation checklist appears. All four rules must be satisfied (indicated with a green checkmark ✓):

| Rule                       | Requirement                                               |
| -------------------------- | --------------------------------------------------------- | ------- |
| At least 6 characters      | Password must be 6 or more characters long                |
| One uppercase letter (A–Z) | Must contain at least one capital letter                  |
| One number (0–9)           | Must contain at least one digit                           |
| One special character      | Must contain at least one of: `!@#$%^&\*()\_+-=[]{};':"\\ | ,.<>/?` |

**After successful registration:**

- A green toast notification appears: **"Registration Successful!"**
- You are automatically redirected to the **Login** page after 1.5 seconds.
- You are **not** automatically logged in — you must sign in manually.

### 2.3 Logging In

1. Navigate to `/login` or click the **Login** button in the header.
2. Enter your **Email** and **Password**.
3. Click **Sign In**.

**On success:** You are redirected to the **Home** page and can now access all features.

**On failure:** A red toast notification appears with the error message (e.g., "Invalid credentials").

**Validation:**

- Email must be in a valid format (e.g., `user@example.com`).
- If the backend server is not running, a connection error message will appear.

### 2.4 Session & Authentication

- **Access Token**: Stored in the browser's `localStorage`. Valid for **15 minutes**.
- **Refresh Token**: Stored as an HTTP-only cookie. Valid for **7 days**.
- When the access token expires, the system **automatically refreshes** it in the background — you will not be interrupted.
- If the refresh token also expires (after 7 days of inactivity), you will be redirected to the login page.
- **Multi-tab support**: Logging out in one browser tab will automatically log you out in all open tabs.

### 2.5 Logging Out

1. Click your **user icon** (or name) in the top-right corner of the header.
2. A dropdown menu appears with a **Logout** option.
3. Click **Logout**.

**What happens:**

- Your session is cleared from the browser.
- A green toast notification confirms: logout was successful.
- You are redirected to the **Login** page.
- All other open tabs are also logged out (via event broadcast).

---

## 3. Navigation & Header

The header appears at the top of every page and provides:

| Element                 | Location   | Description                                            |
| ----------------------- | ---------- | ------------------------------------------------------ |
| **Brand Name**          | Left       | "Advanced Consulting Services" — click to return home  |
| **Page Title**          | Center     | Shows the current page name (if applicable)            |
| **Back Button**         | Left/Right | Appears on sub-pages to navigate back (e.g., "← Back") |
| **My Dashboard** button | Right      | Visible when logged in — navigates to `/dashboard`     |
| **Login** button        | Right      | Visible when not logged in — navigates to `/login`     |
| **User Dropdown**       | Right      | Visible when logged in — contains the Logout option    |

**Available Routes:**

| Path            | Page              | Auth Required? |
| --------------- | ----------------- | -------------- |
| `/`             | Home Page         | No             |
| `/login`        | Login Page        | No             |
| `/register`     | Registration Page | No             |
| `/dashboard`    | User Dashboard    | Yes            |
| `/campaign/new` | Create Campaign   | Yes            |

If you try to access a protected page without logging in, you will be redirected to the **Login** page.

---

## 4. Home Page — Browsing Campaigns

**Route:** `/`

The home page is the main landing page of the platform where all active campaigns are displayed.

### 4.1 Hero Section

At the top of the page, a large hero banner displays:

- **Main heading:** "Be the Change You Want to See"
- **Subtitle:** "Raise awareness for social causes & promote your small business"
- **Description:** "Connecting communities across Melbourne, Sydney, Brisbane, Adelaide, and Perth"
- **Create Campaign** button — navigates to `/campaign/new` (prompts login if not authenticated)

### 4.2 Campaign Filters

Below the hero section, two sets of filter buttons allow you to narrow the displayed campaigns:

#### Filter by Campaign Type

| Filter Button    | Behavior                             |
| ---------------- | ------------------------------------ |
| All Campaigns    | Shows all active campaigns (default) |
| Social Causes    | Shows only `cause` type campaigns    |
| Small Businesses | Shows only `business` type campaigns |

#### Filter by Location

| Filter Button | Behavior                                  |
| ------------- | ----------------------------------------- |
| All Locations | Shows campaigns from all cities (default) |
| Melbourne     | Shows only Melbourne campaigns            |
| Sydney        | Shows only Sydney campaigns               |
| Brisbane      | Shows only Brisbane campaigns             |
| Adelaide      | Shows only Adelaide campaigns             |
| Perth         | Shows only Perth campaigns                |

**How filtering works:**

- Filters are cumulative — selecting "Social Causes" and "Melbourne" shows only social cause campaigns in Melbourne.
- The active filter is highlighted visually.
- Location filtering uses a partial match — a campaign located in "Melbourne, VIC" will match the "Melbourne" filter.

### 4.3 Campaign Cards

Each campaign is displayed as a card in a responsive grid:

- **1 column** on mobile screens
- **2 columns** on medium screens (tablets)
- **3 columns** on large screens (desktops)

**Card contents:**

| Element          | Description                                                           |
| ---------------- | --------------------------------------------------------------------- |
| Campaign Image   | Header image (with fallback placeholder if none)                      |
| Category Badge   | Top-left corner — e.g., "Environment", "Health"                       |
| Type Badge       | Top-right corner — "Social Cause" (blue) or "Small Business" (purple) |
| Title            | Campaign title                                                        |
| Description      | Truncated to 3 lines with ellipsis                                    |
| Supporters Count | Number of supporters with a user icon                                 |
| Date Range       | Start date — End date (or just start date if no end date)             |
| Vote Buttons     | Upvote (▲) and Downvote (▼) with counts                               |
| Read More        | Button to open the full campaign detail modal                         |

### 4.4 Loading & Empty States

- **Loading:** While campaigns are being fetched, 6 skeleton placeholder cards are shown with a pulsing animation.
- **Empty state:** If no campaigns match your filters, the message **"No campaigns found matching your filters."** is displayed.
- **Error state:** If the API request fails, an error message is shown and the campaign list is empty.

---

## 5. Campaign Details

### 5.1 Opening Campaign Details

Click the **"Read More"** button on any campaign card to open the detail modal.

> **Note:** You must be logged in to view campaign details. If you are not logged in, you will be prompted to log in first.

### 5.2 Detail Modal Layout

The campaign detail modal opens as a full overlay and includes:

| Section           | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| **Header Image**  | Large campaign image or embedded video (if a video URL was provided) |
| **Title**         | Full campaign title                                                  |
| **Status Badge**  | Current campaign status (Active, Pending, etc.)                      |
| **Category**      | Campaign category                                                    |
| **Campaign Type** | Social Cause or Small Business                                       |
| **Location**      | Campaign location                                                    |
| **Contact Email** | Campaign creator's contact email                                     |
| **Date Range**    | Start date and end date                                              |
| **Description**   | Full campaign description text                                       |
| **Goals**         | Listed as bullet points                                              |
| **Supporters**    | Total supporter count                                                |

**Fixed Sidebar (right side):**

| Element       | Description                                                |
| ------------- | ---------------------------------------------------------- |
| Vote Buttons  | Upvote and Downvote buttons with current counts            |
| Share Buttons | Social media sharing (Facebook, Twitter, LinkedIn)         |
| CTA Button    | "Support This Cause" (causes) or "Learn More" (businesses) |

### 5.3 Sharing Campaigns

From the campaign detail modal, you can share to three social platforms:

| Platform | What happens                                    |
| -------- | ----------------------------------------------- |
| Facebook | Opens a new window with a Facebook share dialog |
| Twitter  | Opens a new window with a pre-filled tweet      |
| LinkedIn | Opens a new window with a LinkedIn share dialog |

Each share includes the campaign title and a link to the platform.

**To close the modal:** Click the **X** button in the top-right corner, or click outside the modal area.

---

## 6. Voting on Campaigns

### 6.1 How Voting Works

You can vote on any active campaign to express your support (upvote) or disapproval (downvote).

**Requirements:** You must be logged in to vote. If you are not logged in and click a vote button, you will see a prompt to log in.

**Voting behavior:**

- Click **▲ (Upvote)** to upvote a campaign. The upvote count increases by 1.
- Click **▼ (Downvote)** to downvote a campaign. The downvote count increases by 1.
- Clicking the same vote button again **toggles it off** (removes your vote).
- Switching from upvote to downvote (or vice versa) automatically removes the previous vote.
- Each user can have **only one active vote** per campaign at any time.

**Where you can vote:**

- On the **Campaign Card** (home page)
- In the **Campaign Detail Modal**

### 6.2 Vote States & Colors

| State             | Upvote Button                    | Downvote Button                |
| ----------------- | -------------------------------- | ------------------------------ |
| No vote (default) | Gray background, dark text       | Gray background, dark text     |
| Upvoted           | **Green background**, white text | Gray background, dark text     |
| Downvoted         | Gray background, dark text       | **Red background**, white text |
| Hover (no vote)   | Light green background           | Light red background           |

Vote counts are displayed next to each button and update in real-time.

---

## 7. Supporting a Social Cause

When viewing a **Social Cause** campaign, you can financially support it by clicking the **"Support This Cause"** button.

### 7.1 Support Form Fields

A modal form appears with the following fields:

| Field   | Type     | Pre-filled? | Editable? | Required? | Notes                                    |
| ------- | -------- | ----------- | --------- | --------- | ---------------------------------------- |
| Name    | Text     | Yes         | No        | —         | Auto-filled from your account            |
| Email   | Email    | Yes         | No        | —         | Auto-filled from your account            |
| Message | Textarea | No          | Yes       | No        | Optional message to the campaign creator |
| Amount  | Number   | No          | Yes       | **Yes**   | Dollar amount you want to contribute     |

### 7.2 Submitting Support

1. Enter the **Amount** (required — must be a number).
2. Optionally add a **Message** to the campaign creator.
3. Click **Submit** / **Support**.

**On success:** A toast notification confirms your support was submitted.

**On failure:** An error toast explains what went wrong.

**API call:** `POST /api/campaigns/{campaignId}/support` with `{ name, email, message, amount }`.

---

## 8. Inquiring About a Business

When viewing a **Small Business** campaign, you can reach out by clicking the **"Learn More"** button.

### 8.1 Inquiry Form Fields

A modal form appears with the following fields:

| Field   | Type     | Pre-filled? | Editable? | Required? | Notes                             |
| ------- | -------- | ----------- | --------- | --------- | --------------------------------- |
| Name    | Text     | Yes         | No        | —         | Auto-filled from your account     |
| Email   | Email    | Yes         | No        | —         | Auto-filled from your account     |
| Phone   | Tel      | No          | Yes       | **Yes**   | Must be a valid Australian number |
| Message | Textarea | No          | Yes       | No        | Optional message to the business  |

### 8.2 Phone Number Validation

The phone number field requires a **valid Australian phone number**. The following formats are accepted:

| Format              | Example        | Valid?                   |
| ------------------- | -------------- | ------------------------ |
| Mobile (0-prefix)   | `0412345678`   | ✅                       |
| Mobile (+61 prefix) | `+61412345678` | ✅                       |
| Landline (0-prefix) | `0212345678`   | ✅                       |
| With spaces         | `0412 345 678` | ✅ (spaces are stripped) |
| With dashes         | `0412-345-678` | ✅ (dashes are stripped) |
| International       | `+1 555-1234`  | ❌                       |
| Too short           | `041234`       | ❌                       |
| Letters included    | `0412abc678`   | ❌                       |

**Validation pattern (after removing spaces, dashes, and parentheses):** `^(\+61|0)[2-478]\d{8}$`

**Placeholder hint:** `0412345678 or +61412345678`

**Error message:** "Please enter a valid Australian phone number (e.g. 0412345678 or +61412345678)."

### 8.3 Submitting an Inquiry

1. Enter a valid **Phone** number (required).
2. Optionally add a **Message**.
3. Click **Submit** / **Learn More**.

**On success:** A toast notification confirms your inquiry was sent.

**On failure:** An error toast explains what went wrong. If the phone number is invalid, the error message appears inline below the field.

**API call:** `POST /api/campaigns/{campaignId}/inquiry` with `{ name, email, phone, message }`.

---

## 9. Creating a Campaign

### 9.1 Accessing the Campaign Form

There are three ways to access the campaign creation form:

1. Click **"Create Campaign"** in the hero section of the home page.
2. Click **"Create New Campaign"** in your User Dashboard.
3. Navigate directly to `/campaign/new`.

> **Note:** You must be logged in. If not authenticated, you will be redirected to the Login page.

### 9.2 Form Fields Reference

The campaign creation page has a full-page layout with the form on the right and a live preview on the left.

| Field          | Type     | Required? | Default Value          | Placeholder / Options                                         |
| -------------- | -------- | --------- | ---------------------- | ------------------------------------------------------------- |
| Campaign Title | Text     | **Yes**   | Empty                  | —                                                             |
| Category       | Text     | **Yes**   | Empty                  | "Environment, Education, Health..."                           |
| Campaign Type  | Dropdown | **Yes**   | `cause` (Social Cause) | Social Cause / Small Business                                 |
| Location       | Dropdown | **Yes**   | Empty (Select a state) | See location options below                                    |
| Start Date     | Date     | **Yes**   | Today's date           | —                                                             |
| End Date       | Date     | **Yes**   | Today + 30 days        | —                                                             |
| Contact Email  | Email    | **Yes**   | Empty                  | —                                                             |
| Image          | File     | No        | None                   | Accepted: JPG, JPEG, PNG                                      |
| Description    | Textarea | **Yes**   | Empty                  | "Explain what you are raising support for and why it matters" |
| Goals          | Textarea | **Yes**   | Empty                  | "List the concrete outcomes this campaign should achieve"     |

#### Location Options

| Value | Display Name                 |
| ----- | ---------------------------- |
| NSW   | New South Wales              |
| VIC   | Victoria                     |
| QLD   | Queensland                   |
| WA    | Western Australia            |
| SA    | South Australia              |
| TAS   | Tasmania                     |
| ACT   | Australian Capital Territory |
| NT    | Northern Territory           |
| Other | Other / Online               |

#### Campaign Type Options

| Value    | Display Name   |
| -------- | -------------- |
| cause    | Social Cause   |
| business | Small Business |

### 9.3 Image Upload

- Click the image upload area to select a file from your computer.
- **Accepted formats:** JPG, JPEG, PNG only.
- If you upload a file in an unsupported format (e.g., GIF, PDF, WEBP), an error toast appears: **"Only JPG, JPEG, PNG images are allowed."**
- After selecting a valid image, a preview thumbnail is shown in the form.
- The image is **optional** — campaigns can be created without one (a placeholder will be used).

### 9.4 Date Rules

| Rule                                    | Error Message                                  |
| --------------------------------------- | ---------------------------------------------- |
| Start date is required                  | "Start date is required."                      |
| Start date cannot be in the past        | "Start date cannot be in the past."            |
| End date is required                    | "End date is required."                        |
| End date cannot be in the past          | "End date cannot be in the past."              |
| End date must be on or after start date | "End date must be on or after the start date." |

- **Default start date:** Today
- **Default end date:** 30 days from today

### 9.5 Live Preview

As you fill in the form, a **live preview card** on the left side of the page updates in real-time:

- The preview mimics the appearance of a campaign card on the home page.
- It shows your title, description, category, campaign type badge, image (once uploaded), date range, and location.
- This lets you see exactly how your campaign will appear to other users before publishing.

### 9.6 Validation Rules

All required fields are validated when you click **"Publish Campaign"**. If any field is invalid, the form scrolls to the first error and shows:

- An inline error message below the field (in red text).
- A toast notification summarizing the issue.

| Field          | Validation                                       | Error Message                                                                                                |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Campaign Title | Cannot be empty or whitespace only               | "Campaign title is required."                                                                                |
| Category       | Cannot be empty or whitespace only               | "Category is required."                                                                                      |
| Location       | Must select a state                              | "Location is required."                                                                                      |
| Start Date     | Must be provided and ≥ today                     | "Start date is required." / "Start date cannot be in the past."                                              |
| End Date       | Must be provided, ≥ today, and ≥ start date      | "End date is required." / "End date cannot be in the past." / "End date must be on or after the start date." |
| Contact Email  | Must be a valid email format (`user@domain.com`) | "Contact email is required." / "Enter a valid email address."                                                |
| Description    | Cannot be empty or whitespace only               | "Description is required."                                                                                   |
| Goals          | Cannot be empty or whitespace only               | "Goals are required."                                                                                        |

**Email validation pattern:** `^[^\s@]+@[^\s@]+\.[^\s@]+$`

### 9.7 Submission & What Happens Next

1. Click **"Publish Campaign"**.
2. The button shows a loading state during submission.
3. **On success:**
   - A green toast notification appears: **"Campaign submitted"**
   - The form is reset.
   - You are redirected to your **Dashboard** (`/dashboard`).
4. **On failure:**
   - A red toast notification shows the error message.
   - The form remains open for corrections.

**Important:** Newly created campaigns are set to **`pending`** status by default. An administrator must review and **activate** your campaign before it becomes visible on the public home page. This is a moderation step to ensure quality and appropriateness.

---

## 10. User Dashboard — Managing Your Campaigns

**Route:** `/dashboard`

The User Dashboard is your personal campaign management page.

### 10.1 Viewing Your Campaigns

The dashboard displays a list of all campaigns you have created, with each item showing:

| Element         | Description                               |
| --------------- | ----------------------------------------- |
| Campaign Image  | Thumbnail of the campaign image           |
| Title           | Campaign title                            |
| Description     | Brief campaign description                |
| Category        | Campaign category label                   |
| Status Badge    | Current campaign status with color coding |
| Supporter Count | Number of supporters                      |
| Delete Button   | Red trash icon to delete the campaign     |

If you haven't created any campaigns yet, an **empty state** is shown with a message and a **"Create New Campaign"** call-to-action button.

**Loading state:** While your campaigns are being fetched, a skeleton placeholder with pulsing animation is displayed.

### 10.2 Campaign Status Badges

| Status    | Badge Color | Meaning                                            |
| --------- | ----------- | -------------------------------------------------- |
| Active    | Green       | Your campaign is live and visible on the home page |
| Pending   | Yellow      | Your campaign is awaiting admin approval           |
| Rejected  | Red         | Your campaign was rejected by an admin             |
| Completed | Blue        | Your campaign has been completed                   |

### 10.3 Deleting a Campaign

1. Click the **trash icon** (🗑) next to the campaign you want to delete.
2. A **confirmation modal** appears: asking if you are sure you want to delete this campaign.
3. Click **Confirm** to proceed or **Cancel** to abort.

**On confirm:**

- The campaign is permanently deleted.
- A success alert modal confirms the deletion.
- The campaign is removed from your list immediately.

**On failure:**

- An error alert modal appears with details.

**Warning:** Deletion is permanent. There is no undo or recycle bin.

---

## 11. Notifications & Toasts

The platform uses toast notifications (pop-up messages in the top-right corner) to provide feedback. Toasts automatically disappear after a few seconds.

| Toast Type | Color  | Used For                                                        |
| ---------- | ------ | --------------------------------------------------------------- |
| Success    | Green  | Account created, campaign submitted, support sent, logout, etc. |
| Error      | Red    | Login failed, validation errors, API errors, connection issues  |
| Warning    | Yellow | Advisory messages, partial failures                             |
| Info       | Blue   | General informational messages                                  |

---

## 12. User Flows — Step-by-Step Walkthroughs

### 12.1 New User — From Registration to First Campaign

```
1. Visit http://localhost:5173/
2. Click "Login" → Click "Register here"
3. Fill in: Full Name, Email, Password (meeting all rules), Confirm Password
4. Click "Create Account" → See success toast
5. Redirected to Login page → Enter Email + Password → Click "Sign In"
6. Redirected to Home page (now logged in)
7. Click "Create Campaign" in the hero section
8. Fill in all required fields + optional image
9. Preview your campaign in real-time on the left
10. Click "Publish Campaign" → See success toast
11. Redirected to Dashboard → Your new campaign appears with "Pending" status
12. Wait for an admin to review and activate your campaign
13. Once activated, your campaign appears on the home page for all users
```

### 12.2 Returning User — Supporting a Cause

```
1. Visit http://localhost:5173/ → Log in if needed
2. Browse campaigns or use filters (e.g., "Social Causes" + "Melbourne")
3. Find a social cause campaign → Click "Read More"
4. Review the full campaign details, goals, and description
5. Click "Support This Cause"
6. Your name and email are pre-filled
7. Enter an Amount (required) and optionally a Message
8. Click Submit → See success toast
9. Your support is recorded and visible to the campaign creator
```

### 12.3 Returning User — Inquiring About a Business

```
1. Visit http://localhost:5173/ → Log in if needed
2. Filter by "Small Businesses" to narrow results
3. Find a business campaign → Click "Read More"
4. Review the business details and goals
5. Click "Learn More"
6. Your name and email are pre-filled
7. Enter a valid Australian phone number (required)
8. Optionally add a Message
9. Click Submit → See success toast
10. Your inquiry is sent to the business owner
```

---

## 13. API Reference (User Endpoints)

All authenticated endpoints require a valid JWT access token sent as `Authorization: Bearer <token>`.

**Base URL:** `http://localhost:3000/api`

### Authentication

| Method | Endpoint         | Description                | Auth Required? |
| ------ | ---------------- | -------------------------- | -------------- |
| POST   | `/auth/login`    | Log in with email/password | No             |
| POST   | `/auth/register` | Create a new account       | No             |
| POST   | `/auth/refresh`  | Refresh access token       | Cookie only    |

**Login request:**

```json
{
  "email": "user@example.com",
  "password": "MyPass123!"
}
```

**Login response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "id": "42",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Register request:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "MyPass123!"
}
```

### Campaigns

| Method | Endpoint               | Description                  | Auth Required? |
| ------ | ---------------------- | ---------------------------- | -------------- |
| GET    | `/campaigns/campaigns` | List all active campaigns    | No             |
| GET    | `/user/my-campaigns`   | List your own campaigns      | Yes            |
| POST   | `/campaigns/create`    | Create a new campaign        | Yes            |
| DELETE | `/campaigns/{id}`      | Delete one of your campaigns | Yes            |

**Create campaign request (JSON):**

```json
{
  "title": "Save the Reef",
  "description": "A campaign to protect the Great Barrier Reef...",
  "contact_email": "reef@example.com",
  "location": "QLD",
  "category": "Environment",
  "campaign_type": "cause",
  "goals": "Raise $10K for reef restoration\nPartner with 5 local diving schools",
  "start_date": "2026-05-01",
  "end_date": "2026-06-30"
}
```

> **Note:** If an image is included, the request is sent as `multipart/form-data` with an `image` field containing the file.

### Voting

| Method | Endpoint                | Description                 | Auth Required? |
| ------ | ----------------------- | --------------------------- | -------------- |
| GET    | `/campaigns/{id}/votes` | Get vote counts + your vote | Yes            |
| POST   | `/campaigns/{id}/vote`  | Cast or toggle a vote       | Yes            |

**Vote request:**

```json
{
  "vote_type": "upvote"
}
```

Valid values: `upvote`, `downvote`

**Vote response:**

```json
{
  "upvotes": 15,
  "downvotes": 2,
  "userVote": "upvote"
}
```

### Support (Social Causes)

| Method | Endpoint                  | Description                | Auth Required? |
| ------ | ------------------------- | -------------------------- | -------------- |
| POST   | `/campaigns/{id}/support` | Submit a financial support | Yes            |

**Support request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Great cause, happy to help!",
  "amount": 50
}
```

### Inquiry (Small Businesses)

| Method | Endpoint                  | Description               | Auth Required? |
| ------ | ------------------------- | ------------------------- | -------------- |
| POST   | `/campaigns/{id}/inquiry` | Submit a business inquiry | Yes            |

**Inquiry request:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0412345678",
  "message": "I'd like to learn more about your services."
}
```

---

## 14. Technical Architecture

### Frontend Stack

| Technology     | Purpose                            |
| -------------- | ---------------------------------- |
| React 18       | UI component library               |
| TypeScript     | Type-safe JavaScript               |
| Vite           | Build tool and development server  |
| Tailwind CSS 4 | Utility-first CSS framework        |
| React Router 7 | Client-side routing and navigation |
| Lucide React   | Icon library                       |
| Sonner         | Toast notification library         |

### Project Structure (User-Facing)

```
src/
├── main.tsx                         # App entry point
├── app/
│   ├── App.tsx                      # Root component (AuthProvider + Router + Toasts)
│   ├── routes.tsx                   # Route definitions
│   ├── components/
│   │   ├── HomePage.tsx             # Campaign browsing & filtering
│   │   ├── LoginPage.tsx            # User login form
│   │   ├── RegisterPage.tsx         # Account registration form
│   │   ├── DashboardPage.tsx        # Dashboard route guard
│   │   ├── UserDashboard.tsx        # Campaign management dashboard
│   │   ├── NewCampaignPage.tsx      # Campaign creation form + live preview
│   │   ├── CreateCampaignWizard.tsx # Compact campaign creation modal (alternative)
│   │   ├── Header.tsx               # Navigation header
│   │   ├── CampaignCard.tsx         # Campaign card component
│   │   ├── CampaignDetailModal.tsx  # Full campaign detail overlay
│   │   ├── AlertModal.tsx           # Simple alert popup
│   │   └── ConfirmationModal.tsx    # Confirm/cancel dialog
│   ├── context/
│   │   └── AuthContext.tsx          # Global auth state management
│   ├── services/
│   │   └── campaignApi.ts           # All API calls (campaigns, votes, support, inquiry)
│   └── utils/
│       └── toast.ts                 # Toast notification helpers
├── styles/
│   ├── index.css                    # Base styles
│   ├── tailwind.css                 # Tailwind configuration
│   ├── theme.css                    # Theme variables
│   └── fonts.css                    # Font definitions
└── uploads/                         # Local upload assets
```

### Authentication Flow

```
Register → POST /auth/register → Success → Redirect to Login
                                                    ↓
Login → POST /auth/login → Access token (15min) + Refresh cookie (7 days)
                                    ↓
                       Stored in localStorage
                                    ↓
                     All API calls include Bearer token
                                    ↓
                On 401 → POST /auth/refresh (using cookie)
                                    ↓
                     New access token → Retry original request
                                    ↓
                On refresh failure → Dispatch 'auth:logout' event
                                    ↓
                     Clear localStorage → Redirect to /login
```

### Campaign Lifecycle

```
User creates campaign → Status: PENDING
         ↓
Admin reviews campaign
         ↓
  ┌──────┴──────┐
  ↓             ↓
ACTIVE       REJECTED
(visible     (not visible,
on home)     user sees status
              in dashboard)
```

---

## 15. Responsive Design & Layout

The platform is fully responsive and adapts to different screen sizes:

| Screen Size | Breakpoint | Campaign Grid | Layout Notes                        |
| ----------- | ---------- | ------------- | ----------------------------------- |
| Mobile      | < 768px    | 1 column      | Stacked layout, full-width elements |
| Tablet      | ≥ 768px    | 2 columns     | Side-by-side cards                  |
| Desktop     | ≥ 1024px   | 3 columns     | Full three-column grid              |

**Campaign Creation Page:**

- On desktop: Two-column layout (preview on left, form on right).
- On mobile: Single-column layout (form only, preview may stack above or below).

**Campaign Detail Modal:**

- On desktop: Full modal with fixed sidebar for votes and sharing.
- On mobile: Scrollable modal with sidebar content stacked below main content.

---

## 16. Troubleshooting

| Problem                                        | Solution                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Can't log in**                               | Check that your email and password are correct. Ensure the backend is running at `http://localhost:3000`.     |
| **"Connection error" on login/register**       | The backend API server is not running. Start it on port 3000.                                                 |
| **Redirected to login unexpectedly**           | Your session expired. The refresh token may have expired after 7 days of inactivity. Log in again.            |
| **"Registration Successful!" but can't login** | Registration does not auto-login. You must sign in manually on the login page.                                |
| **Password validation won't pass**             | Ensure your password has: 6+ chars, 1 uppercase, 1 number, 1 special character.                               |
| **Campaigns not appearing on home page**       | Only **active** campaigns are shown. New campaigns start as **pending** and need admin approval.              |
| **My campaign stuck on "Pending"**             | Contact the platform administrator to review and activate your campaign.                                      |
| **Campaign image not loading**                 | Ensure the backend `/uploads` directory is accessible. Check that the image was JPG/PNG.                      |
| **"Only JPG, JPEG, PNG images are allowed"**   | You tried uploading an unsupported format. Convert your image to JPG or PNG first.                            |
| **Phone number rejected in inquiry form**      | Must be a valid Australian number: `0412345678` or `+61412345678`. No international numbers.                  |
| **Vote buttons not responding**                | You must be logged in to vote. Check for login prompt.                                                        |
| **Toast notifications not appearing**          | Try refreshing the page. Toast component may not have mounted correctly.                                      |
| **Filters show no results**                    | Try resetting to "All Campaigns" and "All Locations" to confirm campaigns exist.                              |
| **Dashboard shows no campaigns**               | You haven't created any campaigns yet, or they were deleted. Click "Create New Campaign."                     |
| **Page shows a blank screen**                  | Check the browser console (F12) for JavaScript errors. Ensure all dependencies are installed (`npm install`). |
| **Form won't submit**                          | Check all required fields. Look for red error messages below each field.                                      |

---

## 17. FAQ

**Q: Do I need an account to browse campaigns?**
A: No. The home page is publicly accessible. You can browse and filter campaigns without logging in. However, you need an account to view details, vote, support, inquire, or create campaigns.

**Q: How long until my campaign appears on the home page?**
A: After you publish a campaign, it enters a **pending** state. An administrator must review and activate it. The time depends on the admin's review schedule.

**Q: Can I edit a campaign after creating it?**
A: Currently, campaigns cannot be edited after submission. You can delete a campaign from your dashboard and create a new one with updated information.

**Q: What happens to my support/inquiry after I submit it?**
A: Your support or inquiry is recorded in the system and visible to the campaign creator and platform administrators. For inquiries, the business owner will see your phone number and message.

**Q: Is my financial support processed as a real payment?**
A: The support form records your contribution intent. The actual payment processing depends on the platform's backend configuration. Contact the platform administrator for details.

**Q: Can I vote on my own campaign?**
A: The platform does not currently prevent voting on your own campaigns.

**Q: Why are some cities missing from the location filter?**
A: The home page filter shows the five major Australian cities (Melbourne, Sydney, Brisbane, Adelaide, Perth). When creating a campaign, you can select any Australian state/territory or "Other / Online."

**Q: What if I forget my password?**
A: The platform does not currently have a password reset feature. Contact the platform administrator for assistance.

**Q: Can I delete my account?**
A: Account deletion is not available through the user interface. Contact the platform administrator to request account removal.

**Q: Do my votes persist across sessions?**
A: Yes. Your votes are stored on the server and associated with your account. They will be visible whenever you log in.
