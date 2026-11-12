NyotaOne Superadmin Dashboard – Phase 1

Files included:
- client/src/components/SuperadminDashboard.tsx
- client/src/components/SuperadminDashboard.css

These replace the existing SuperadminDashboard component and its stylesheet.
The component keeps the same props and navigation callbacks used by App.tsx.
It does not change authentication, APIs, database tables, or Plesk files.

Apply:
1. Back up your current two SuperadminDashboard files.
2. Copy these two files into the matching paths in your local project.
3. Do not replace App.tsx or any backend/Plesk files.
4. Do not start NyotaOne yet. We will review the result and then move to the next implementation step.

Metric values display dashes and service health is marked unknown because no dashboard metrics or monitoring endpoints have been connected yet.
