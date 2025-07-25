# Blog Web - Interactive React Blog Platform

A modern, interactive blog platform built with React and Supabase, featuring user authentication, profile management, and real-time content creation.

## Features

- **User Authentication**: Secure sign-up and sign-in functionality
- **Profile Management**: Customize username and avatar
- **Interactive Blog Posts**:
  - Create, read, update, and delete blog posts
  - Rich text content with image support
  - Preview posts before publishing
  - Expandable content with "read more" functionality
- **Content Filtering**: Toggle between personal posts and all community posts
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 19, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Deployment**: Create React App build system

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following Supabase tables:

### profiles
- `id`: UUID (references auth.users.id)
- `username`: String
- `avatar_url`: String
- `isModal`: Boolean

### posts
- `id`: UUID (primary key)
- `title`: String
- `content`: Text
- `image_url`: String (optional)
- `user_id`: UUID (references profiles.id)
- `created_at`: Timestamp

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`

Launches the test runner in interactive watch mode

### `npm run build`

Builds the app for production to the `build` folder

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Deployment

This application can be deployed to any static hosting service:

1. Run `npm run build`
2. Deploy the contents of the `build` folder

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License