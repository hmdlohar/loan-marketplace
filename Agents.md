# AGENTS.md

> AI Agent System Guidelines & Architecture for the Loan Marketplace Platform.
> This is a self-improving file. If you make architectural choices, discover mistakes, or introduce structural ideas, update this file immediately so future agents follow the conventions exactly.

---

## 1. Project Directory Structure

We use a `pnpm` monorepo with strict package boundaries:

- **`packages/commonlib`**: Shared static enums, pure utilities, and automated TS types generators.
- **`packages/backendsdk`**: Auto-generated Axios SDK client (`BackendSDK.ts`) and types (`types.ts`). **NEVER edit files in this folder manually**.
- **`packages/backend`**: Express + Mongoose API server. Exposes **RPC-only** endpoints (no default CRUD REST).
- **`packages/frontend`**: Next.js **Pages Router** app (landing + borrower flows on same domain). Uses `backendsdk` via `services/BackendSDKService.ts` — never raw `fetch` to backend.

---

## 2. Coding Guidelines & Strict Rules

These rules ensure clean, uniform, error-free execution across the codebase.

### 2.1 Avoid Destructuring
* **Rule**: Almost never use destructuring. Assign values individually instead.
* **Why**: Destructuring creates copies of references which can lead to unexpected mutation bugs, makes debugging harder, and obscures data origins.
* **Bad**: `const { name, age } = user;`
* **Good**: 
  ```typescript
  const name = user.name;
  const age = user.age;
  ```

### 2.2 No Single-Use Wrapper Functions
* **Rule**: Do not wrap standard operations in single-use functions (e.g., creating `openModal` just to do `setOpen(true)`).
* **Why**: Unnecessary wrappers add cognitive load and extra lines of code without any reuse benefit.

### 2.3 No Single-Use Variables
* **Rule**: Do not assign values to variables if they are only referenced once. Call them inline instead.
* **Bad**:
  ```typescript
  const isSystemAdmin = AuthServices.isSystemAdmin();
  if (isSystemAdmin) { ... }
  ```
* **Good**:
  ```typescript
  if (AuthServices.isSystemAdmin()) { ... }
  ```

### 2.4 Prefer Type Inference
* **Rule**: Let TypeScript infer types whenever possible (e.g., `yup.InferType<typeof schema>`). Do not hand-write types that can be inferred from validators or schemas.

### 2.5 Comment Only Where It Saves Reader Time
* **Rule**: Do not write comments that narrate what the code does (e.g., `// close modal` above `setOpen(false)`). Only use comments to explain **non-obvious intent**, **edge cases**, or **business logic choices**.

---

## 3. Backend Architecture & Core Concepts

### 3.1 Contexted Service Execution (`serviceWithContext`)
Every service extends `BaseService<T>` and is instantiated on-the-fly per request with context via `serviceWithContext`. This injects request context (`SystemUserID`, `IsAdmin`, `req`, `res`, etc.) automatically.
* Services are registered as context-aware singleton exporters:
  ```typescript
  class LoanServiceClass extends BaseService<ILoan> {
    constructor(context: ICMSContext) {
      super(LoanCollectionKey, context);
    }
  }
  const LoanService = serviceWithContext<LoanServiceClass>(LoanServiceClass);
  export default LoanService;
  ```
* Calling services is strictly context-bound:
  ```typescript
  // Call inside controllers or RPCs passing the request context:
  const result = await LoanService.context(context).get(loanId);
  ```

### 3.2 RPC-Only Controller Registry
There are **no default REST CRUD endpoints**. The backend registers strictly defined RPC methods using `rpcItem` wrappers in controllers.
* Custom RPC functions live inside `api/{collection}/fns/{FunctionName}.ts`.
* Controllers map endpoints to these files:
  ```typescript
  import MyFnDefinition from "./fns/MyFn";
  import { createController, rpcItem } from "@lib/BaseController";

  export default createController(MyCollectionKey, [
    rpcItem({
      route: "/MyFn",
      definition: MyFnDefinition,
    }),
  ]);
  ```

### 3.3 Database-Backed Cron & `CronComment` Logger
The scheduler schedules jobs defined in `packages/backend/src/cron/cron.ts`. Every execution logs status (`RUNNING`, `SUCCESS`, `FAILED`) and a real-time progress stream to the `cron-log` collection.
* Inside scheduled jobs, use `CronComment` to log step-by-step updates:
  ```typescript
  callback: async (objComment: CronComment) => {
    await objComment.do("Step 1: Check eligibility", async () => {
      objComment.push("Fetching matching criteria...");
      // Your code...
    });
  }
  ```

---

## 4. CLI Commands & Scaffolding Guides

### 4.1 Create a New Collection
1. In `packages/backend`, run:
   ```bash
   node scripts/generateCollection.js <collection-key>
   # e.g., node scripts/generateCollection.js customer-loan
   ```
   This scaffolds the Schema, Collection, Controller, and Service inside `src/api/<collection-key>/`.
2. Edit `<collection-key>Schema.ts` and specify mongoose fields.
3. Run `npx tsx src/cmd/index.ts generateTypes` to generate TS interfaces in `backendsdk`.

### 4.2 Create a New API Endpoint (RPC)
1. Run:
   ```bash
   node scripts/generateFN.js <collection-key> <FunctionName>
   # e.g., node scripts/generateFN.js customer-loan ApplyForLoan
   ```
   This scaffolds the Yup-validated handler inside `src/api/<collection-key>/fns/<FunctionName>.ts` and registers it in `<collection-key>Controller.ts`.
2. Implement your business logic inside the callback.
3. Run `npm run cmd syncSDK` to auto-regenerate SDK client methods and types inside `packages/backendsdk`.

### 4.3 Create a New Cron Job
1. Add your job details (key, title, callback, cronExpression) to `packages/backend/src/cron/cron.ts`.
2. Write your business logic callback. Use `objComment.do` to log execution boundaries cleanly.

---

## 5. Frontend Architecture

### 5.1 MUI & Theme
- **MUI v7** with Lending Core design tokens in `theme/tokens.ts` and `theme/lendingCoreTheme.ts`.
- Light/dark mode via MUI `colorSchemes` + shared `modeStorageKey` (`lending-core-color-mode`) in `_app` and `_document`.
- For mode-specific styles use `theme.applyStyles('dark', {...})` in `theme/styleHelpers.ts` — **not** `theme.palette.mode` checks (unreliable with CSS variables).
- `_app.tsx` is generic: theme, CssBaseline, react-query only — **no layout or auth logic**.

### 5.2 Layout Rules (strict)
- **Per-page layout only.** Each page wraps its content explicitly:
  - Public/marketing (`/`, `/about`, `/contact`, …) → `<LandingLayout>`
  - App/authenticated (`/app/**`) → `<AuthGuard><AppLayout>…</AppLayout></AuthGuard>`
- **No** global layout in `_app` / `_document`. **No** pathname conditionals there.
- **No** `/login` route. `AuthGuard` renders `LoginPanel` inline when unauthenticated.

### 5.3 Routing
| Area | Path | Layout |
|------|------|--------|
| Landing & static | `/`, `/about`, `/contact` | `LandingLayout` |
| Borrower app flow | `/app/products`, `/app/apply`, `/app/apply/documents`, `/app/matching`, `/app/offers`, `/app/dashboard` | `AppLayout` + `AuthGuard` |

### 5.4 Mock Data (current phase)
- UI-first: `services/mock/applicationMock.ts` supplies products, offers, application state.
- Pages call mock services today; swap to `bSdk` RPC when backend collections exist.
- Mock data shapes must align with `commonlib` enums (`LOAN_PRODUCT`, `APPLICATION_STATUS`, etc.).

### 5.5 SDK Usage
- Import `bSdk` from `services/BackendSDKService` only. Do not instantiate `BackendSDK` elsewhere.
- After backend RPC changes, run `npm run cmd syncSDK` in `packages/backend`, then `pnpm watchlib` from root.
- Env: copy `packages/frontend/.env.local.example` → `.env.local`. Set `NEXT_PUBLIC_ROOT_URL` to backend origin.

### 5.6 Auth (frontend)
- `services/AuthServices.ts` holds token/user in localStorage. Pass token via `bSdk` `getAuthToken`.
- `AuthGuard` checks auth per page; shows `LoginPanel` (mock login for now) when not authenticated.
- Extend when borrower auth RPC exists — no route changes needed.

---

## 6. Dev and Build Workflow

Run **three terminals** (user starts all; agents do not unless asked):

| Terminal | Directory | Command |
|----------|-----------|---------|
| 1 | repo root | `pnpm watchlib` — rebuilds `commonlib` + `backendsdk` on change |
| 2 | `packages/backend` | `pnpm dev` — Express + tsx watch |
| 3 | `packages/frontend` | `pnpm dev` — Next.js on port 3000 |

- **Agent Restrictions**: **NEVER start or restart** `pnpm watchlib`, `pnpm dev`, or similar long-running processes unless the user explicitly asks. Codegen (`syncSDK`, `generateTypes`, `tsc`) is allowed.
- **Build libs**: `npx tsc --project packages/commonlib/tsconfig.json` and `packages/backendsdk/tsconfig.json`.
- **Frontend typecheck**: `pnpm --filter frontend ts` (no emit).
- **Syncing Code changes**: Always run `npm run cmd syncSDK` after modifying RPC function arguments or adding controllers.
