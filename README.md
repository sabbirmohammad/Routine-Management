# University Routine Management System

A comprehensive web application for managing university class routines, built with Next.js, TypeScript, and Prisma.

## Features

### Admin Authentication
- Secure login/logout system
- Password reset functionality
- Role-based access control

### Course Management
- Add, edit, and delete courses
- Course search and filtering
- Bulk import via CSV/Excel

### Teacher Management
- Add, edit, and delete teachers
- Department assignment
- Teacher list with search functionality

### Room Management
- Add, edit, and delete rooms
- Room availability tracking
- Capacity management

### Time Slot Management
- Define time slots
- Set duration and breaks
- Configure maximum slots per day

### Routine Assignment
- Assign courses to teachers, rooms, and time slots
- Automatic conflict detection
- Department and semester-based organization

### Live Routine Dashboard
- Interactive weekly calendar view
- Drag-and-drop class assignment
- Color-coded schedule blocks
- Advanced filtering options

### Reports & Export
- Generate reports by teacher, department, or room
- Export routines in PDF and Excel formats
- Printable view

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **UI Components**: Headless UI, Heroicons
- **Form Handling**: React Hook Form, Zod
- **Date Handling**: date-fns
- **Drag and Drop**: react-beautiful-dnd
- **Table Management**: TanStack Table

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set up your PostgreSQL database and update the DATABASE_URL in .env
5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/routine_management"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
