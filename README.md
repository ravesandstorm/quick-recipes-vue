# Quick Recipes Vue

A comprehensive recipe sharing platform built with Nuxt 4, Vue 3, MongoDB and Tailwind CSS. Made for easy recipes with nutritional information and dietary restrictions on each dish to make recipe hunting ever so easier!

## Features

### ✅ Completed Features

- **Authentication System**
  - Email/password signup and login
  - Google OAuth integration (configured)
  - Password hashing with bcrypt
  - Session management

- **Dashboard Landing Page**
  - Featured recipes display
  - User statistics
  - Category-based navigation
  - Responsive design with animations

- **Recipe Management**
  - Create recipes with ingredient auto-suggest
  - Auto-saving to local storage
  - Macro calculation (calories, protein, carbs)
  - Dynamic recipe detail pages
  - Favorite functionality

- **Advanced Search System**
  - Text-based search
  - Advanced filtering (calories, protein, carbs, rating)
  - Ingredient-based filtering
  - Multiple sorting options
  - MongoDB search indexes

- **User Profile System**
  - Profile management
  - Recipe collections (created & favorites)
  - Follow/unfollow functionality (structure ready)

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS
- **Backend**: Nitro (Nuxt server)
- **Database**: MongoDB
- **Authentication**: @sidebase/nuxt-auth
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Pinia (configured)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure:
```bash
cp .env.example .env
```

Update `.env` with your values:
```env
# Authentication
NUXT_AUTH_SECRET=your-super-secret-key-here
NUXT_AUTH_URL=http://localhost:3000/api/auth

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/quick-recipes

# App
AUTH_ORIGIN=http://localhost:3000
```

### 3. Database Setup
Make sure MongoDB is running, then seed sample data:
```bash
# Start the development server first
npm run dev

# In another terminal, seed the database
curl -X POST http://localhost:3000/api/seed-data
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## VueBits Components Recommendations

Future enhancements for UI/UX, with VueBits components:

### 1. **Toast Notifications** (`VToast`)
- **Usage**: Success/error feedback for recipe creation, favorites, etc.
- **Location**: Global component for user feedback
- **Benefits**: Better user experience with action confirmations

### 2. **Modal/Dialog** (`VModal`)
- **Usage**: Recipe deletion confirmation, image upload, advanced filters
- **Location**: Recipe management, search filters
- **Benefits**: Clean interface without page navigation

### 3. **Skeleton Loaders** (`VSkeleton`)
- **Usage**: Replace current pulse animations
- **Location**: Recipe cards, profile pages, search results
- **Benefits**: More sophisticated loading states

### 4. **Dropdown Menu** (`VDropdown`)
- **Usage**: User profile menu, recipe actions, sort options
- **Location**: Navigation, recipe cards, search page
- **Benefits**: Better interaction patterns

### 5. **Image Upload** (`VImageUpload`)
- **Usage**: Recipe images, profile avatars
- **Location**: Recipe creation, profile editing
- **Benefits**: Visual recipe representation

### 6. **Rating Component** (`VRating`)
- **Usage**: Recipe ratings display and input
- **Location**: Recipe cards, recipe detail pages
- **Benefits**: Interactive rating system

### 7. **Tabs Component** (`VTabs`)
- **Usage**: Profile sections (recipes, favorites, following)
- **Location**: Profile pages, recipe categories
- **Benefits**: Better content organization

### 8. **Badge Component** (`VBadge`)
- **Usage**: Difficulty levels, dietary tags, new recipes
- **Location**: Recipe cards, search filters
- **Benefits**: Visual categorization

## Current Animations & Interactions

The application already includes:
- Fade-in animations for page loads
- Slide-up animations for cards and modals
- Bounce-in animations for interactive elements
- Hover effects on cards and buttons
- Smooth transitions between states
- Loading states with pulse animations

## API Endpoints

- `GET /api/recipes/featured` - Get featured recipes
- `GET /api/recipes/search` - Search recipes with filters
- `GET /api/recipes/[id]` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `GET /api/ingredients/search` - Search ingredients
- `GET /api/stats` - Get platform statistics
- `POST /api/auth/signup` - User registration
- `POST /api/seed-data` - Seed sample data
