# Restaurant QR Menu Application

Modern, mobile-friendly QR menu application for restaurants and cafes with a comprehensive admin panel.

## Features

### Public (Customer) Features
- **Landing Page**: Customizable welcome screen with logo, text, and button
- **Category Navigation**: Hierarchical category structure with subcategories
- **Product Display**: Grid layout with images, descriptions, and flexible pricing
- **Modal Details**: Click any product to see full details and all pricing options
- **Mobile-First Design**: Optimized for 360-430px screens

### Admin Panel Features
- **General Settings**: Customize landing page colors, logo, text, button styles, and grid layout
- **Category Management**: Create, edit, delete categories with parent/child relationships
- **Product Management**: Full CRUD operations with multiple price tiers
- **Filters**: Filter products by category and active status
- **Image Support**: URL-based image uploads for categories and products

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: bcrypt password hashing
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   The `.env` file should already contain your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**
   The database schema and seed data have been automatically created via migrations:
   - `settings` table with default pudra pink theme (#F2D7D5)
   - `admins` table with default admin account
   - `categories` table with sample categories
   - `products` table with sample products

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

## Usage

### Customer (Public) Access

1. Open the app in a browser (scan QR code in production)
2. View the customized welcome screen
3. Click "Menüye Git" to browse categories
4. Navigate through categories and subcategories
5. Click on any product to view full details and pricing

### Admin Access

1. Navigate to `/admin` or append `/admin` to your URL
2. Login with default credentials:
   - **Username**: admin
   - **Password**: 123456
3. Use the admin panel to:
   - Update general settings
   - Manage categories
   - Manage products

**IMPORTANT**: Change the default admin password in production!

## Database Schema

### settings
- `id`: Primary key
- `bg_color`: Background color (default: #F2D7D5)
- `logo_url`: Logo image URL
- `logo_width`: Logo width in pixels
- `welcome_text`: Welcome message
- `welcome_font_size`: Font size in pixels
- `welcome_color`: Text color
- `button_text`: Button label
- `button_bg_color`: Button background color
- `button_text_color`: Button text color
- `category_grid`: Grid layout ('one' or 'two' columns)

### categories
- `id`: Primary key
- `name`: Category name
- `image_url`: Category image URL
- `parent_id`: Parent category ID (null for top-level)
- `sort_order`: Display order
- `active`: Visibility status

### products
- `id`: Primary key
- `category_id`: Foreign key to categories
- `name`: Product name
- `image_url`: Product image URL
- `description`: Product description
- `price_single`: Single/default price
- `price_small`: Small size price
- `price_medium`: Medium size price
- `price_large`: Large size price
- `sort_order`: Display order
- `active`: Visibility status

### admins
- `id`: Primary key
- `username`: Admin username
- `password_hash`: Bcrypt hashed password

## Price Display Logic

Products can have up to 4 price types:
- **Single**: Displayed as "Fiyat"
- **Small**: Displayed as "Küçük"
- **Medium**: Displayed as "Orta"
- **Large**: Displayed as "Büyük"

Only filled price fields are shown to customers.

## Customization

### Theme Colors
- Default background: Pudra pink (#F2D7D5)
- Fully customizable via admin panel
- Color picker and text input support

### Grid Layout
- Switch between single and double column layouts
- Applies to both main and subcategories
- Instant updates via admin panel

## Security Notes

1. Default admin credentials should be changed immediately in production
2. Consider implementing additional authentication layers
3. Validate all file uploads if implementing direct upload functionality
4. Use HTTPS in production
5. Regularly update dependencies

## Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript type checking
npm run lint       # Run ESLint
```

## Support

For issues or questions, please refer to the documentation or create an issue in the project repository.
