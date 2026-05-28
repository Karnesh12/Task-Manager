# Task Manager

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](#)
[![License: ISC](https://img.shields.io/badge/License-ISC-orange.svg)](backend/package.json)
[![React](https://img.shields.io/badge/React-v19-blue.svg?logo=react)](#)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=nodedotjs)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg?logo=tailwindcss)](#)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248.svg?logo=mongodb)](#)

A full-stack, production-grade task management system designed to support team-based workflows with robust security, real-time progress tracking, and detailed audit trails.

---

## What the Project Does

**Task Manager** is a collaborative platform that enables teams to create, assign, schedule, and track tasks. Built with a React frontend and a Node.js/Express/MongoDB backend, it bridges the gap between administrators and team members through role-based access control (RBAC). 

The application facilitates:
*   **Secure Authentication**: JWT-based user sign-up, login, and session persistence with distinct roles (`admin` and `member`).
*   **Task Assignment & Tracking**: Multi-assignee task distribution with status management (Pending, In Progress, Completed, Overdue, and Blocked) and custom due dates.
*   **Real-time Checklist Progression**: Sub-task todo checklists that dynamically recalculate overall task completion percentage and automatically trigger status updates.
*   **Activity Logging**: A granular, chronological activity history (audit trail) for every task, capturing details on who performed what action and when.
*   **Administrative Dashboards**: Graphical insights and metrics (task distribution and priority charts) to monitor overall team productivity.
*   **Data Export**: Generation of detailed Excel workbooks for archiving or external analysis.

---

## Why the Project is Useful

Task Manager provides developers and teams with a highly structured, scalable boilerplate for team collaboration. Key benefits include:

### 1. Robust Role-Based Access Control (RBAC)
*   **Admins** have unrestricted power to create, update, and delete tasks, manage the team, view global analytics, and generate reports.
*   **Members** have a tailored interface displaying only their assigned tasks, allowing them to focus on active responsibilities, toggle checklist items, and update statuses without compromising global configurations.

### 2. Live Task Auditing & Progress Automation
*   Every change in a task—from checklist toggles to title edits—is logged to the database. This eliminates confusion and creates a transparent audit trail.
*   Dynamic checklist completion updates the task progress bar and automatically transitions status (e.g., transitions to "Completed" when progress hits 100%, and moves back to "In Progress" or "Pending" if unchecked).

### 3. Smart Dependency Validation
*   Prevents database inconsistencies by ensuring that members cannot be deleted if they are the sole assignee on any active, uncompleted task.
*   Encourages administrators to re-assign tasks before removing users, preserving historical task records.

### 4. Background Overdue Processing
*   The system actively tracks due dates and automatically updates overdue statuses, ensuring that delay alerts are raised immediately on the dashboard without manual updates.

### 5. Detailed Analytics & Reporting
*   Equipped with responsive Pie and Bar charts (using Recharts) for visualization of tasks by priority and status.
*   One-click Excel reports generate spreadsheet workbooks for tasks and user metrics using ExcelJS, facilitating management reviews.

---

## Workspace Structure

The project is structured into two main components:

*   **[Backend Codebase](./backend)**: The Node.js and Express server handling database connections (MongoDB via Mongoose), authentication middleware, route handlers, file uploads (Multer), and report generation.
*   **[Frontend Codebase](./frontend/Task-Manager)**: A React application bundled with Vite, styled using Tailwind CSS, featuring routing via React Router, animations using Lottie React, and notifications via React Hot Toast.

---

## Who Maintains the Project

This project is actively developed and maintained by:

*   **[@Karnesh12](https://github.com/Karnesh12)** (Main Repository Owner)
*   The Task Manager Development Team

For inquiries regarding project maintenance, please refer to the main repository contacts.

---

## License

This project is licensed under the **ISC License**. For more information, please see the license details in the [backend package.json](./backend/package.json).
