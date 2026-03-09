This project is a Secure Task Management System designed to handle multi-tenant data isolation and role-based access control (RBAC). It is built as an NX monorepo to ensure tight integration between the NestJS backend and the Angular frontend.

Technical Stack
---------------

*   **Monorepo Management:** NX
    
*   **Backend:** NestJS, TypeORM, Passport.js (JWT)
    
*   **Frontend:** Angular (Signals, Tailwind CSS, CDK)
    
*   **Database:** SQLite
    
*   **Shared Library:** TypeScript interfaces and enums for cross-stack type safety.
    

Setup Instructions
------------------

### Environment Configuration

The application uses a default configuration for local development. For a production environment, create a .env file in the apps/api directory with the following variables:

*   JWT\_SECRET: A secure string for token signing.
    
*   DATABASE\_PATH: Path to the SQLite database file.
    

### Installation

Open a PowerShell terminal in the project root and install all project dependencies:

PowerShell

`   npm install   `

### Execution

Run the API and the Dashboard in separate PowerShell instances or VS Code terminal tabs.

**Backend (API):**

PowerShell

`   npx nx serve api --no-tui   `

The API is configured to run on http://localhost:3001/api.

**Frontend (Dashboard):**

PowerShell

`   npx nx serve dashboard --no-tui   `

The Dashboard is available at http://localhost:4200.

Architecture Overview
---------------------

### Modular Design

The NX workspace is divided into specialized modules:

*   **apps/api:** The core server handling authentication, authorization, and task persistence.
    
*   **apps/dashboard:** A reactive frontend that leverages Angular Signals for state management and instant UI updates.
    
*   **libs/data:** A shared library containing global constants, enums (e.g., UserRole, TaskStatus), and interfaces (e.g., ITask, IUser).
    

### Multi-Tenancy and Security

The system enforces strict multi-tenancy. Every request is verified via a JWT strategy. The user's organizationId is extracted from the token and used to scope all database queries, ensuring that data is never leaked between organizations.

Data Model and RBAC
-------------------

### Entity Relationships

The database schema consists of:

*   **Organizations:** Supports a hierarchical structure.
    
*   **Users:** Each user is assigned a specific role and linked to an organization.
    
*   **Tasks:** Primary resources scoped to an organization.
    
*   **Audit Logs:** Records all mutations (Create, Update, Delete) to maintain a secure history.
    

### Permission Matrix

**ActionOwnerAdminViewerCreate Task**AllowedAllowedDenied**Edit Task**AllowedAllowedDenied**Delete Task**AllowedDeniedDenied**View Audit Logs**AllowedAllowedDenied

Implementation Details
----------------------

### Audit Logging

The audit logging system uses a write-only approach. To prevent side-effect issues during entity state management, the system uses TypeORM’s .insert() method. This ensures that logs are created as immutable records without attempting to update associated user or organization entities.

### UI/UX Enhancements

*   **Form Submission:** Forms are configured to submit on the "Enter" key for both login and task creation.
    
*   **Drag-and-Drop:** The Angular CDK is used to allow users to reorder tasks locally for better organization.
    
*   **Dark Mode:** A theme toggle is implemented to support both light and dark environments.
    

Trade-offs and Future Considerations
------------------------------------

### Current Trade-offs
* **Testing Coverage:** Priority was given to the implementation of the security infrastructure and core RBAC logic over comprehensive unit testing. 
* **State Persistence for Reordering:** Task reordering via drag-and-drop is handled in the local UI state and does not yet persist a custom sortOrder to the database.

### Future Improvements
* **User Management UI:** Currently, users are seeded via a backend script. A production iteration would include a "Team" module allowing Owners to invite users and manage role assignments directly through the interface, leveraging the existing RBAC guards.
* **Refresh Token Rotation:** To enhance session security and reduce the impact of token theft.
* **Organization Hierarchy Inheritance:** Expanding guards to allow parent-level owners to view and manage tasks in sub-departments.
* **RBAC Caching:** Integrating Redis to cache role permissions for improved performance under high loads.