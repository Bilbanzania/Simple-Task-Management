Enterprise Task Management Workspace
====================================

**Overview:** A production-ready, multi-tenant task management system built to demonstrate enterprise software patterns. It features strict data isolation, dynamic Role-Based Access Control (RBAC), and immutable audit logging within a tightly integrated Nx monorepo.

**Core Features:**

*   **Secure Multi-Tenancy:** Every database query is strictly scoped to the user's organizationId derived from their JWT, ensuring absolute data isolation between different companies.
    
*   **Dynamic RBAC & Team Provisioning:** Three distinct access tiers (Owner, Admin, Viewer). Owners can directly provision new accounts and assign roles instantly.
    
*   **Immutable Audit Trail:** A dedicated, color-coded logging system that records every mutation (Create, Update, Delete, Reorder), attributing actions to specific users and timestamps.
    
*   **Reactive Frontend:** Built with Angular Signals for pristine, glitch-free state management.
    
*   **Tactile UI/UX:** Features Angular CDK Drag-and-Drop task reordering, system-wide light/dark mode persistence, and responsive Tailwind CSS layouts.
    

**Technology Stack:**

*   **Frontend (Client):** Angular (Standalone Components, Signals), Tailwind CSS, Angular CDK.
    
*   **Backend (API):** NestJS, Passport.js (Custom JWT Strategies), TypeORM.
    
*   **Infrastructure & Data:** PostgreSQL, Nx Monorepo (Shared TypeScript interfaces/enums).
    

**Getting Started:**

*   **Prerequisites:** Node.js (v18 or higher) and PostgreSQL (running locally or via a cloud provider).
    
*   **1\. Environment Setup:** Navigate to the apps/api directory, create a .env file, and add your credentials:
    
    *   JWT\_SECRET=super\_secret\_development\_string
        
    *   DATABASE\_URL=postgres://username:password@localhost:5432/task\_management\_db
        
*   **2\. Installation:** Run npm install from the project root to install all monorepo dependencies.
    
*   **3\. Execution:** Run npx nx serve dashboard from the root directory to seamlessly spin up the environment.
    
    *   Frontend Dashboard runs at http://localhost:4200
        
    *   Backend API runs at http://localhost:3001/api
        

**Architecture & Security Highlights:**

*   **The Multi-Tenant Guard:** The backend extracts the organizationId from authenticated JWTs and injects it into all TypeORM queries. This prevents unauthorized access even if an attacker guesses a valid taskId from another organization.
    
*   **Role-Based Access Matrix:** Route guards and UI visibility are strictly enforced:
    
    *   _Owners:_ Can Create/Edit, Delete, Reorder, Manage Team Members, and View Audit Logs.
        
    *   _Admins:_ Can Create/Edit, Reorder, and View Audit Logs.
        
    *   _Viewers:_ Strictly read-only access.
        
*   **Append-Only Audit Logging:** Utilizes TypeORM's .insert() method rather than .save() to guarantee that log entries are strictly append-only, preventing accidental mutations to relational entities.
    

**Future Roadmap:**

*   **Real-Time WebSockets:** Integrating @nestjs/websockets and socket.io to instantly broadcast drag-and-drop movements and task updates to connected organization members.
    
*   **Advanced Analytics:** A visual dashboard featuring burn-down charts and task completion velocity metrics.
    
*   **Persisted Sorting:** Migrating the local UI drag-and-drop state to a persisted sortOrder linked list in the PostgreSQL database.
    
*   **Redis Caching:** Offloading RBAC and session validation to an in-memory datastore to improve query performance under high traffic.