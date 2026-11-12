# NyotaOne — Development Roadmap

**Project:** NyotaOne unified digital services and commerce platform  
**Roadmap version:** 1.0  
**Last updated:** 12 November 2026  
**Status:** In progress — Superadmin dashboard Phase 1 prepared; local integration not yet confirmed.

> **How this roadmap is maintained:** Whenever a project change is completed in our work together, I will update this roadmap and provide a fresh copy. Keep the latest downloaded copy in your NyotaOne project folder, replacing the previous roadmap file. I cannot silently edit a file on your computer between messages, so each update will be delivered as a new file for you to save locally.

---

## 1. Where the project stands now

NyotaOne is being built as a custom application using **React 19 + Vite** for the frontend, **Node/Express + TypeScript** for the backend, and **MariaDB** for the database. The application is being developed locally and connected to the VPS database through an SSH tunnel.

**Current working position:** We have inspected the existing application, database structure, authentication and permissions, customer records, and Plesk integration. The first Superadmin dashboard UI files have been prepared in a ZIP. The next step is to integrate those two files into the local project and review the result before moving on.

### Current status at a glance

| Area | Status | Notes |
|---|---|---|
| Project foundation | In place | React/Vite frontend, Express/TypeScript backend, MariaDB |
| Local development setup | In place | Frontend on port 5173; backend on port 3000 |
| VPS database connection | Working previously | SSH tunnel to MariaDB on VPS port 3306 via local port 3307 |
| Database structure | Inspected | 17 existing tables; existing records must be preserved |
| Authentication | Inspected | JWT login, active-user reload, role and permission checks |
| Existing role permissions | Inspected | 29 permission keys and 58 role-permission assignments |
| Customer/account structure | Inspected | Accounts and customer profiles exist; current model needs account-level staff access |
| Plesk mailbox listing | Tested successfully | Mailbox list endpoint returned HTTP 200 |
| Plesk mailbox creation | Not yet tested | Local code has been changed; must inspect and test safely |
| Superadmin dashboard UI | Prepared | ZIP supplied; user has not yet confirmed copying it into the project |
| Customer workspace | Not started | Planned after dashboard integration and review |
| Live dashboard metrics | Not connected | Current dashboard uses placeholders until real data endpoints exist |

---

## 2. Completed work

### A. Application and development foundation
- Set up the NyotaOne project locally using React 19, Vite, Node/Express, TypeScript and MariaDB.
- Installed project dependencies and resolved earlier package/configuration issues.
- Built and ran the frontend and backend locally.
- Established the SSH tunnel approach for securely reaching the VPS MariaDB database.
- Confirmed the database connection successfully in an earlier development session.

### B. Database inspection
- Inspected the existing database and identified 17 tables:
  `accounts`, `audit_logs`, `blog_posts`, `customer_profiles`, `invoices`, `order_items`, `orders`, `payments`, `permissions`, `plesk_domains`, `portfolio_projects`, `products`, `role_permissions`, `service_leads`, `services`, `support_tickets`, and `users`.
- Inspected key table relationships and existing account, user, profile, domain, order, invoice, payment and ticket structures.
- Confirmed the database already contains service catalogue records and permission data.
- Identified that customer orders and support tickets are currently tied to individual users rather than consistently to a customer account.
- Identified that invoices do not currently have an account ownership field.
- Recorded existing data counts and important constraints so future changes can be planned without damaging current records.

### C. Authentication and permissions review
- Inspected `src/routes/auth.ts`.
- Confirmed JWT authentication reloads the current user and account status from the database.
- Confirmed Superadmin bypasses normal permission checks.
- Confirmed other users are checked against `role_permissions`.
- Identified a restriction that currently prevents non-customer staff roles from being linked to a customer account.
- Identified that role permissions alone do not enforce ownership of a specific customer account or resource.

### D. Customer/account model decisions
Agreed design:
- A customer account is the main ownership boundary.
- One business account can have multiple authorised users.
- Customer Administrator manages the account and its assigned services.
- Finance users should see finance-related information only.
- IT users should manage the technical services they are authorised to manage.
- Individual employees/mailbox users should only access their assigned resources.
- Backend checks must enforce account ownership and permissions; hiding a button in the frontend is not enough.
- Important changes should be recorded in audit logs.
- Plesk synchronisation must preserve the correct customer-account ownership.

### E. Plesk mailbox integration
- Updated local Plesk route/service code to support mailbox listing and mailbox creation.
- Mailbox listing was tested successfully and returned HTTP 200.
- Mailbox creation has not yet been tested.
- A new untracked route file exists and must be inspected before any further Plesk changes.
- Existing local Plesk changes must be preserved.

### F. Superadmin dashboard — first UI delivery
A first dashboard UI package was prepared:
- `client/src/components/SuperadminDashboard.tsx`
- `client/src/components/SuperadminDashboard.css`
- `README.txt`

Download: [NyotaOne Superadmin Dashboard — Phase 1](sandbox:/mnt/data/nyotaone-superadmin-dashboard-phase1.zip)

The package is designed to keep the existing `App.tsx` integration and callbacks. It does not change authentication, APIs, database tables or Plesk code.

**Important:** This package has not been confirmed as copied into the local project or tested in the user's application. Some dashboard metrics are placeholders until backend endpoints are connected.

---

## 3. Current position — the immediate next step

**Current phase**

### Phase 1 — Integrate and review the Superadmin dashboard

1. Extract the dashboard ZIP.
2. Copy only these two files into `client/src/components/`:
   - `SuperadminDashboard.tsx`
   - `SuperadminDashboard.css`
3. Replace only the matching existing dashboard component files.
4. Do not replace `App.tsx`, authentication files, API files, database files or Plesk files.
5. Confirm when the files have been copied.
6. Review the integrated dashboard and resolve any compile or layout issues before starting the next phase.

**Not yet confirmed:** The files have been copied into the project.

---

## 4. Roadmap — remaining work

The sequence below is the working plan. We will inspect existing code and database structures before making changes. Database migrations will be introduced only when a confirmed feature requires them.

| Phase | Workstream | Main deliverables | Status |
|---|---|---|---|
| 1 | Superadmin dashboard | Integrate and review dashboard; connect real summary data later | Prepared — integration pending |
| 2 | Customer workspace | Account overview, services, renewals, invoices, orders and support | Not started |
| 3 | Account users and access | Multiple users per account, customer admin, finance and IT access | Design agreed; implementation pending |
| 4 | Account-level security | Enforce account/resource ownership in backend APIs | Not started |
| 5 | Domains | Domain list, ownership, status, management and transfer workflow | Existing schema partly inspected; feature work pending |
| 6 | Business email | Mailbox list/create, allocations, limits, billing and customer controls | Plesk listing tested; creation and customer workflow pending |
| 7 | Hosting services | Hosting plans, service allocation, provisioning and management | Not started |
| 8 | Orders, invoices and payments | Account-linked records, payment confirmation, manual verification, receipts and VAT display | Existing tables inspected; account linkage and workflows pending |
| 9 | Customer support | Account-level tickets, staff assignment, messages and status tracking | Existing table inspected; account workflow pending |
| 10 | Products and inventory | Product catalogue, stock, procurement, delivery and sales workflows | Existing tables; implementation review pending |
| 11 | Website builder | Templates, pages, visual editor, media, SEO, forms, preview and publishing | Future phase |
| 12 | App marketplace | Optional business apps such as booking, school management, restaurant ordering, CRM and analytics | Future phase |
| 13 | Security and operations | Audit trail, backups, disaster recovery, monitoring and hardening | Requirements recorded; implementation pending |
| 14 | Launch preparation | End-to-end checks, production deployment, documentation and launch | Not started |

---

## 5. Key product rules to preserve

### Customer accounts and access
- Every customer-owned service or resource must be linked to the correct customer account.
- Users may have different permissions within the same account.
- The backend must enforce permissions and account ownership.
- Superadmin has platform-wide access.
- Mailbox users must not see other users' mailboxes unless explicitly authorised.

### Domains and email
- A domain hosted by NyotaOne includes one free mailbox.
- A domain hosted externally does not receive a free mailbox.
- Additional mailboxes: UGX 50,000 or USD 15 per mailbox per year.
- Target mailbox storage limit: up to 10 GB, subject to the final plan and Plesk capability.
- Customers must not create more mailboxes than their allocation allows.
- Additional mailbox charges should be prorated to the service's common renewal date.

### Billing and payments
- Supported payment options include Pesapal, PayPal and verified manual bank/mobile-money payments.
- Each order is charged in one selected currency: UGX or USD.
- Advertised prices are VAT-inclusive; show the 18% VAT portion separately as a cost borne by NyotaOne, not added again to the customer's price.
- Guest checkout may be used for eligible purchases; accounts are required for hosting and business email.

### Operations
- Backup retention target: 30 days.
- Disaster recovery target: 24 hours.
- Recovery point objective: 4 hours.
- Uptime target: 99.9%.

---

## 6. Technical safeguards

Before changing existing code or data:
1. Inspect the current file, route, API or table.
2. Identify what already works and what depends on it.
3. Make the smallest required change.
4. Preserve unrelated user changes and uncommitted work.
5. Run focused checks relevant to the change.
6. Update this roadmap with the completed work, current position and next action.

Do not:
- Replace whole files without inspecting them first.
- overwrite the user's existing Plesk changes.
- create duplicate tables or permissions without checking what already exists.
- treat a successful UI build as proof that the backend feature works.
- claim a feature is tested unless it has actually been tested.

---

## 7. Change log

| Version | Date | Update |
|---|---|---|
| 1.0 | 12 Nov 2026 | Created roadmap from the inspected project state and agreed architecture. Recorded completed foundation, database/auth review, Plesk mailbox listing test, dashboard package delivery and immediate integration step. |

**Next roadmap update:** After the Superadmin dashboard files are integrated and reviewed, record the actual result here and update the phase status.
