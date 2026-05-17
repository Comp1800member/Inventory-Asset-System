# CLAUDE.md

## Project Overview

This is a full-stack Inventory & Warehouse Management System designed for learning and demonstrating:

- Relational database design (PostgreSQL)
- Backend API design (FastAPI)
- Frontend application development (React)
- SQL best practices and query optimization
- Docker-based local development
- Cloud-ready architecture (AWS-compatible deployment)

The system is intentionally **simple in architecture but strong in data modeling**.

---

## Core Philosophy

This system is **ledger-based (event-driven inventory model)**.

### Critical Rule:
- Inventory stock is NOT stored directly.
- All inventory changes are recorded as immutable movement events.
- Current stock is derived from aggregating inventory_movements.

This is a core architectural constraint and must NOT be violated.

---

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic

### Frontend
- React (Vite preferred)
- TypeScript (preferred but optional)
- Axios or Fetch API

### Infrastructure
- Docker + Docker Compose (local dev)
- Optional AWS deployment (EC2/RDS/S3)

---

## Core Entities (Database Schema)

### users
- id (PK)
- email (UNIQUE, NOT NULL)
- name (NOT NULL)
- created_at (NOT NULL)

---

### warehouses
- id (PK)
- name (UNIQUE, NOT NULL)
- location (NOT NULL)
- created_at (NOT NULL)

---

### inventory_items
- id (PK)
- sku (UNIQUE, NOT NULL)
- name (NOT NULL)
- description (nullable)
- created_at (NOT NULL)

---

### vendors
- id (PK)
- name (NOT NULL)
- contact_email (NOT NULL)
- created_at (NOT NULL)

---

### inventory_movements (CORE TABLE)
- id (PK)
- inventory_item_id (FK → inventory_items)
- warehouse_id (FK → warehouses)
- user_id (FK → users)
- vendor_id (FK → vendors, nullable)
- movement_type (NOT NULL)
- quantity (NOT NULL, must be > 0)
- notes (nullable)
- created_at (NOT NULL)

---

## Movement Types

Allowed values:
- INBOUND (stock received)
- OUTBOUND (stock shipped)
- ADJUSTMENT (manual correction)

Must be enforced using ENUM or CHECK constraint in PostgreSQL.

---

## Business Rules (CRITICAL)

### Inventory Model
- Inventory is derived from inventory_movements.
- DO NOT store current stock in any table.
- Stock must be computed using SQL aggregation.

### Quantity Rules
- quantity must always be > 0
- movement_type defines direction

### Data Integrity
- All foreign keys must be enforced
- Use transactions for movement creation

---

## Backend Architecture

### Layering

- routes/ → API endpoints only
- services/ → business logic
- models/ → database models
- schemas/ → request/response validation (Pydantic)
- database/ → DB connection/session management

### Rules
- Routes must NOT contain business logic
- Services handle all workflow logic
- Models define structure only
- Schemas define API contracts

---

## Frontend Architecture

### Structure

- pages/ → route-level screens
- components/ → reusable UI components
- services/ → API calls (backend communication)
- hooks/ → reusable React logic (optional)

---

## Frontend Pages (MVP)

### Required Pages

1. Inventory Items Page
   - list all items
   - create new item

2. Inventory Movements Page
   - view movement history
   - filter by item or warehouse

3. Create Movement Page
   - INBOUND / OUTBOUND / ADJUSTMENT form

4. Warehouses Page
   - list warehouses
   - create warehouse

---

## API Design (Backend)

RESTful endpoints:

### Users
- GET /users
- POST /users

### Inventory Items
- GET /items
- POST /items
- GET /items/{id}

### Warehouses
- GET /warehouses
- POST /warehouses

### Vendors
- GET /vendors
- POST /vendors

### Inventory Movements
- GET /movements
- POST /movements

---

## Performance & Indexing Guidelines

Add indexes for:
- foreign keys used in joins
- SKU field (frequent lookup)
- created_at (time-based queries)

Avoid unnecessary indexing.

---

## Docker Requirements

Local environment must run fully via:

- frontend container
- backend container
- PostgreSQL container

Using docker-compose.

No manual setup steps should be required.

---

## Development Rules

### Keep It Minimal
- No microservices
- No Kafka or event streaming
- No Redis unless explicitly needed
- No Kubernetes
- No over-engineering

---

## Migration Rules (Alembic)

- All schema changes must be done via migrations
- No manual DB schema edits
- Migrations must be reproducible

---

## Frontend Rules

- Frontend must NOT implement business logic
- Frontend only:
  - displays data
  - sends API requests
  - handles UI state
- All validation should be backend-authoritative

---

## API Communication

Frontend communicates with backend via:

- REST JSON APIs
- Axios or fetch
- Environment-based API URL configuration

---

## Current MVP Scope

### Must Have
- Create inventory items
- Create warehouses
- Record inventory movements
- View movement history
- Basic stock calculation via SQL
- Simple frontend UI for all above

---

### Not in Scope (for now)
- Authentication / login system
- Role-based access control
- Advanced analytics dashboards
- Real-time updates (WebSockets)
- Microservices architecture

---

## Claude Code Instructions

When generating or modifying code:

1. Follow existing architecture strictly
2. Do not introduce unnecessary frameworks
3. Keep code simple and readable
4. Avoid over-abstraction
5. Ensure backend remains source of truth
6. Prefer explicit logic over “magic” abstractions

---

## Expected Outcome

A full-stack system that demonstrates:

- strong relational database design
- clean backend architecture
- functional frontend integration
- real-world inventory modeling
- containerized local development
- production-ready deployment structure

---

## Success Criteria

Project is successful when:

- docker-compose up starts full system
- frontend loads and communicates with backend
- backend persists data in PostgreSQL
- inventory items can be created and viewed
- movements can be recorded and queried
- stock is correctly derived from movement data