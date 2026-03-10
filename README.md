Enterprise Task Management Workspace
====================================

**Overview:** A production-ready, multi-tenant task management system built to demonstrate enterprise software patterns. It features strict data isolation, real-time collaboration, dynamic Role-Based Access Control (RBAC), and immutable audit logging within a tightly integrated Nx monorepo.

**Core Features:**

*   **Real-Time Collaboration (WebSockets):** The board is alive! Task movements, creations, and updates are instantly synced across all active clients in your organization using Socket.io, eliminating the need for page refreshes.
    
*   **Live Activity & Comments Feed:** Tasks feature an integrated, real-time chat feed. Team members can discuss roadblocks, post updates, and ask questions directly inside the task modal.
    
*   **Rich Task Workloads:** Break massive projects down into manageable pieces using interactive subtask checklists with automatic progress bars, and keep everyone on schedule with visual due dates and deadlines.
    
*   **Secure Multi-Tenancy:** Every database query and WebSocket room is strictly scoped to the user's organizationId derived from their JWT, ensuring absolute data isolation between different companies.
    
*   **Dynamic RBAC & Team Provisioning:** Three distinct access tiers (Owner, Admin, Viewer). Owners can directly provision new accounts and assign roles instantly.
    
*   **Immutable Audit Trail:** A dedicated, color-coded logging system that records every mutation (Create, Update, Delete, Reorder), attributing actions to specific users and timestamps.
    
*   **"Neon Oceanic" UI/UX:** A stunning, fully responsive Tailwind CSS interface featuring a custom dark/light mode toggle. Built with Angular Signals for pristine state management and the Angular CDK for tactile, glitch-free drag-and-drop interactions.
    

**Technology Stack:**

*   **Frontend (Client):** Angular (Standalone Components, Signals), Tailwind CSS, Angular CDK, Socket.io-Client.
    
*   **Backend (API):** NestJS, WebSockets (@nestjs/websockets), Passport.js (Custom JWT Strategies), TypeORM.
    
*   **Infrastructure & Data:** PostgreSQL, SQLite, Nx Monorepo (Shared TypeScript interfaces/enums).
    

**Getting Started:**

*   **Prerequisites:** Node.js (v18 or higher) and PostgreSQL (running locally or via a cloud provider).
    
*   **1\. Environment Setup:** Navigate to the apps/api directory, create a .env file, and add your credentials:
    
    *   JWT\_SECRET=super\_secret\_development\_string
        
    *   DATABASE\_URL=postgres://username:password@localhost:5432/task\_management\_db
        
*   **2\. Installation:** Run npm install from the project root to install all monorepo dependencies.
    
*   **3\. Execution:** Run npx nx serve dashboard --no-tui from the root directory to seamlessly spin up the environment.
    
    *   Frontend Dashboard runs at http://localhost:4200
        
    *   Backend API runs at http://localhost:3001/api
        
    *   WebSocket Gateway runs at ws://localhost:3001
        

**Architecture & Security Highlights:**

*   **The Multi-Tenant Guard:** The backend extracts the organizationId from authenticated JWTs and injects it into all TypeORM queries. This prevents unauthorized access even if an attacker guesses a valid taskId from another organization.
    
*   **Isolated Socket Rooms:** WebSocket connections automatically map clients to a private broadcast room corresponding to their organizationId, preventing cross-company data leakage during real-time emits.
    
*   **Role-Based Access Matrix:** Route guards and UI visibility are strictly enforced:
    
    *   _Owners:_ Can Create/Edit, Delete, Reorder, Manage Team Members, and View Audit Logs.
        
    *   _Admins:_ Can Create/Edit, Reorder, and View Audit Logs.
        
    *   _Viewers:_ Strictly read-only access.
        
*   **Append-Only Audit Logging:** Utilizes TypeORM's .insert() method rather than .save() to guarantee that log entries are strictly append-only, preventing accidental mutations to relational entities.
    

**Future Roadmap:**

*   **File Attachments:** Direct S3 integration allowing users to drag and drop PDFs and images directly onto task cards.
    
*   **Automated Email Triggers:** Integration with Nodemailer/Resend to automatically dispatch organization invites and daily digest reminders for overdue tasks.
    
*   **Advanced Analytics:** A visual dashboard featuring burn-down charts and task completion velocity metrics.
    
*   **Redis Caching:** Offloading RBAC and session validation to an in-memory datastore to improve query performance under high traffic.