# Directive: 002_pos_revamp

## Objective
Revamp the existing POS project into a premium, modern application with enhanced features including RBAC, Sales Dashboard, CRUD for Categories and Menus, and Midtrans payment integration.

## Key Features & Requirements

### 1. UI/UX Design
- **Aesthetics**: Premium, modern, dark/light mode support, smooth transitions.
- **Layouts**:
    - **Cashier View**: Optimized for fast order entry (grid of items, sidebar for cart).
    - **Customer View**: Read-only display of menus/prices for customers.
    - **Admin Dashboard**: Visual insights using ApexCharts.

### 2. Functional Requirements
- **Dashboard**:
    - Sales summary (Today, Week, Month).
    - Sales chart (ApexCharts).
- **Staff Management (RBAC)**:
    - Roles: `Super Admin`, `Admin`, `User`.
    - Permissions:
        - `Super Admin`: Full access.
        - `Admin`: Manage Menu, Category, Reports.
        - `User`: Cashier operations only.
- **Category Management**:
    - CRUD for menu categories (e.g., Food, Drink, Snack).
- **Menu Management**:
    - CRUD for items (Name, Category, Price, Stock).
    - **Note**: No photo uploads; use default/placeholder images.
- **Payment Integration**:
    - **Gateway**: Midtrans.
    - **Configuration**: Use `.env` for Client Key and Server Key.

### 3. Technical Implementation
- **Framework**: Nuxt 3 with Nuxt UI (Tailwind CSS).
- **Charts**: `vue3-apexcharts`.
- **State Management**: Pinia (for cart and user session).
- **Icons**: Nuxt Icon (@iconify).

## Execution Strategy
1. **Foundation**: Update `nuxt.config.ts` for necessary modules (ApexCharts, Midtrans SDK if needed).
2. **Architecture**: Define Pinia stores for `cart`, `auth`, and `pos_data`.
3. **UI Components**: Create reusable components for POS (Item Card, Cart Sidebar, Sales Chart).
4. **Pages**:
    - `/dashboard`: Admin overview.
    - `/pos`: Cashier interface.
    - `/menu`: Customer view.
    - `/admin/staff`: RBAC management.
    - `/admin/categories`: Category CRUD.
    - `/admin/menus`: Menu CRUD.
5. **Integration**: Implement Midtrans payment flow.

## Verification
- RBAC validation: Ensure "User" role cannot access admin pages.
- Order flow: Item selection -> Cart -> Checkout -> Midtrans redirection/payment.
- CRUD: Verify data persistence for Categories and Menus.
