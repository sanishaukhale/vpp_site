# Vivekanand Prerna Social and Educational Society (VPP) Website

This is the official website and Content Management System (CMS) for the Vivekanand Prerna Social and Educational Society (VPP) NGO. It is built using React, Vite, and Firebase.

## Features
- **Public Facing Website**: Home, About, Activities, Projects, Articles, Team, Contact, and Support pages.
- **Admin Dashboard**: Comprehensive CMS to manage Activities, Projects, Articles, and Team members.
- **Firebase Integration**: Real-time database (Firestore) for all dynamic content, and Authentication for secure Admin access.
- **EmailJS Integration**: Fully functional Contact form.
- **Responsive Design**: Mobile-friendly layout across all pages and the admin dashboard.

## Tech Stack
- React 19
- Vite
- Firebase (Firestore & Auth)
- React Router DOM
- React Hook Form + Zod
- Framer Motion

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd vpp_site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

To run this project, you will need to add the following environment variables to a `.env.local` file in the root directory. You can copy the contents from `.env.example`:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration (for Contact Form)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Admin Access
The admin portal is available at `/admin`. You will need to create a super admin user in your Firebase Authentication and manually set their role to `super_admin` in the Firestore `users` collection to get full access to the CMS and Approval Center. (Note: The first user to log in to the newly setup database is automatically assigned the `super_admin` role via a self-seeding routine).

### Firebase Security Rules & CORS Setup
To ensure the CMS operates securely and image uploads are successful, deploy the included configuration files using the Firebase CLI and Google Cloud Shell.

1. **Deploy Firestore and Storage Rules**
   Run the following from your terminal:
   ```bash
   firebase login
   firebase deploy --only firestore:rules,storage
   ```

2. **Configure Storage CORS (For Image Uploads)**
   Cross-Origin Resource Sharing must be configured on your Storage Bucket to allow frontend uploads. Using Google Cloud Shell or the `gsutil` CLI, run:
   ```bash
   gsutil cors set cors.json gs://<your-project-id>.firebasestorage.app
   ```

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```
