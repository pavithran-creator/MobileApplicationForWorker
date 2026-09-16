# Design System & Token Specifications

**Project:** ON-DEMAND — Cooperative Intelligent Workforce Marketplace  
**Domain Identity:** Civic Trust, Labour Cooperative Solidarity, Skilled Trades, Dignified Work  
**Version:** 1.0.0

---

## 1. Core Color Palette

The color system avoids generic consumer gradients and neon tech palettes. It uses deep cooperative forest greens paired with civic slate, trusted cobalt, and warm brass amber to communicate institutional trust, fair wages, and worker dignity.

| Token Name | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `--color-brand-primary` | `#0F5132` | Primary brand green, headers, primary action buttons, cooperative identity |
| `--color-brand-hover` | `#0B3D26` | Darker green for button hover and active states |
| `--color-brand-light` | `#E8F5E9` | Soft green tint for primary backgrounds and highlights |
| `--color-brand-accent` | `#198754` | Cooperative growth accent, secondary actions, badge borders |
| `--color-surface-bg` | `#F8FAFC` | Page background, clean neutral surface |
| `--color-surface-card` | `#FFFFFF` | Card surface, modal surface, elevated layers |
| `--color-surface-border` | `#E2E8F0` | Subtle, clean card borders and dividers |
| `--color-text-primary` | `#0F172A` | Primary typography, maximum readability and contrast |
| `--color-text-secondary` | `#475569` | Subheadings, field labels, metadata |
| `--color-text-muted` | `#64748B` | Footers, helper text, timestamps |
| `--color-status-success` | `#16A34A` | Verified status, payment success, completed jobs |
| `--color-status-warning` | `#D97706` | Pending verification, under review, slot warnings |
| `--color-status-danger` | `#DC2626` | Emergency booking, rejected, cancelled, slot conflict |
| `--color-status-info` | `#2563EB` | Active bookings, scheduled slots, mock/demo indicators |

---

## 2. Typography Scale

Uses **Outfit** for clean contemporary headers and **Inter** for dense, readable tabular data and forms.

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 32px (2rem) | 800 (Bold) | 1.2 | Landing page hero header |
| **H1** | 24px (1.5rem) | 700 (Bold) | 1.3 | Page titles, primary dashboard headings |
| **H2** | 18px (1.125rem) | 600 (Semibold) | 1.4 | Section titles, card headers |
| **H3** | 15px (0.9375rem) | 600 (Semibold) | 1.4 | Modal titles, subsection groupings |
| **Body** | 14px (0.875rem) | 400 (Regular) | 1.5 | Standard body text, descriptions |
| **Label** | 13px (0.8125rem) | 500 (Medium) | 1.4 | Form labels, table header cells |
| **Caption** | 12px (0.75rem) | 400 (Regular) | 1.4 | Timestamps, badge text, helper hints |

---

## 3. Spacing & Layout Rules

* **Base Unit:** 4px / 8px grid (`p-2`, `p-4`, `p-6`, `gap-3`, `gap-6`).
* **Container Max Width:** `max-w-6xl` (1152px) for public pages; `max-w-7xl` (1280px) for admin dashboards.
* **Border Radius:**
  * Base cards: `rounded-xl` (12px)
  * Badges & Pills: `rounded-full` (9999px)
  * Form inputs & buttons: `rounded-lg` (8px)
* **Shadows:**
  * Cards: `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`) with `border border-slate-200`
  * Dropdowns & Modals: `shadow-lg` (`0 10px 15px -3px rgb(0 0 0 / 0.1)`)

---

## 4. Status & Trust Badge Matrix (Universal Component)

To guarantee consistent trust visualization, every status in the application is rendered via a single universal `StatusBadge` component using this exact mapping:

| Domain | Status Value | Background | Text | Icon Symbol | Label |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Verification** | `VERIFIED` | `#DCFCE7` | `#15803D` | ✓ | Cooperative Verified |
| **Verification** | `UNDER_REVIEW` | `#FEF3C7` | `#B45309` | ⏳ | Under Review |
| **Verification** | `PENDING` | `#FEF9C3` | `#854D0E` | ⏱ | Verification Pending |
| **Verification** | `REJECTED` | `#FEE2E2` | `#B91C1C` | ✕ | Rejected |
| **Certification** | `VERIFIED` | `#DBEAFE` | `#1E40AF` | 🎓 | Certified |
| **Certification** | `PENDING` | `#FEF3C7` | `#B45309` | ⏱ | Cert Pending |
| **Certification** | `NOT_PROVIDED` | `#F1F5F9` | `#475569` | ℹ | Uncertified |
| **Booking** | `REQUESTED` | `#FEF3C7` | `#B45309` | 📩 | Requested |
| **Booking** | `CONFIRMED` | `#DBEAFE` | `#1E40AF` | 📅 | Confirmed |
| **Booking** | `WORKER_ACCEPTED` | `#E0E7FF` | `#4338CA` | 👍 | Worker Assigned |
| **Booking** | `IN_PROGRESS` | `#F3E8FF` | `#6B21A8` | ⚙ | In Progress |
| **Booking** | `COMPLETED` | `#DCFCE7` | `#15803D` | ★ | Completed |
| **Booking** | `CANCELLED` | `#F1F5F9` | `#475569` | ✕ | Cancelled |
| **Payment** | `SUCCESS` | `#DCFCE7` | `#15803D` | 💳 | Paid |
| **Payment** | `PENDING` | `#FEF3C7` | `#B45309` | ⏱ | Payment Due |
| **Payment** | `FAILED` | `#FEE2E2` | `#B91C1C` | ⚠ | Payment Failed |
| **Integration** | `LIVE` | `#DCFCE7` | `#15803D` | ● | Live |
| **Integration** | `SYNCED` | `#DBEAFE` | `#1E40AF` | ↻ | Synced |
| **Integration** | `DEMO` | `#FEF3C7` | `#92400E` | 🧪 | Sandbox Demo |

---

## 5. Definition of Done Checklist (Per Screen)

- [x] Responsive on Mobile (~375px), Tablet (~768px), and Desktop (~1280px).
- [x] Skeleton loading placeholder during async fetch.
- [x] Clear empty state with call-to-action button.
- [x] Inline error state with retry button.
- [x] Toast notification feedback on all form submissions / mutations.
- [x] Bilingual rendering in English & Tamil (`ta.json`).
- [x] Zero browser console errors and zero warnings.
