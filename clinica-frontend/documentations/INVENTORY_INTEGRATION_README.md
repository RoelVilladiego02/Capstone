# Inventory Management Integration Guide

This guide explains how to set up and test the inventory management system integration between the frontend and backend.

## Backend Setup

### 1. Database Migrations
Run the following commands to set up the database:

```bash
cd clinica-backend
php artisan migrate:fresh
php artisan db:seed
```

This will:
- Create all necessary tables (suppliers, inventory_items, orders)
- Add the new fields (threshold, category, location, priority, etc.)
- Populate sample data for testing

### 2. New Database Fields Added

**Inventory Items Table:**
- `threshold` - Minimum stock level for alerts
- `category` - Item category for filtering
- `location` - Storage location

**Orders Table:**
- `priority` - Order priority (Low, Medium, High)
- `expected_delivery` - Expected delivery date

**Suppliers Table:**
- `category` - Supplier category
- `status` - Active/Inactive status
- `rating` - Supplier rating (0-5)

### 3. New API Endpoints

**Inventory:**
- `GET /api/inventory/low-stock` - Get items below threshold
- `GET /api/inventory/analytics` - Get inventory analytics
- `GET /api/inventory/usage-trends` - Get usage trends

**Orders:**
- `GET /api/orders/pending` - Get pending orders
- `PUT /api/orders/{id}/approve` - Approve an order
- `GET /api/orders/analytics` - Get order analytics

**Suppliers:**
- `GET /api/suppliers/active` - Get active suppliers
- `GET /api/suppliers/category/{category}` - Get suppliers by category

## Frontend Setup

### 1. API Services
New service files have been created:
- `src/services/api.js` - Base API configuration
- `src/services/inventoryService.js` - Inventory API calls
- `src/services/orderService.js` - Order API calls
- `src/services/supplierService.js` - Supplier API calls

### 2. Environment Variables
Make sure your `.env` file has the correct API URL:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Updated Components
- `InventoryManagerDashboard.js` - Now uses real API calls instead of mock data
- Added loading states and error handling
- Real-time data fetching from backend

## Testing the Integration

### 1. Start the Backend
```bash
cd clinica-backend
php artisan serve
```

### 2. Start the Frontend
```bash
cd clinica-frontend
npm start
```

### 3. Test the Dashboard
1. Login as an Inventory Manager
2. Navigate to the dashboard
3. You should see:
   - Real inventory statistics
   - Low stock alerts from the database
   - Pending orders from the database
   - Usage trends chart

### 4. Sample Data
The seeder creates:
- 3 suppliers (Medical Supplies Co., PharmaCare Inc., Safety Supplies Inc.)
- 8 inventory items with various stock levels
- 3 sample orders (2 pending, 1 approved)

## Key Features Implemented

### 1. Real-time Data
- Dashboard fetches live data from the database
- No more mock data
- Proper loading and error states

### 2. Low Stock Alerts
- Items below threshold are automatically flagged
- Visual indicators for critical vs low stock
- Quick order functionality

### 3. Order Management
- View pending orders with priorities
- Order approval workflow
- Order analytics

### 4. Analytics
- Total items count
- Low stock count
- Categories count
- Usage trends (mock data for now)

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure your Laravel backend has CORS configured
   - Check that the API URL is correct

2. **Authentication Errors**
   - Ensure you're logged in as an Inventory Manager
   - Check that the auth token is being sent correctly

3. **Database Errors**
   - Run `php artisan migrate:fresh --seed` to reset the database
   - Check that all migrations ran successfully

4. **API 404 Errors**
   - Verify that all routes are registered in `routes/api.php`
   - Check that the controllers exist and are properly namespaced

### Debug Mode:
Enable debug mode in your frontend to see API calls:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## Next Steps

1. **Real Usage Tracking**: Implement actual usage tracking for the trends chart
2. **Order Workflow**: Add order status updates and delivery tracking
3. **Notifications**: Add real-time notifications for low stock alerts
4. **Reporting**: Implement detailed inventory reports
5. **Barcode Integration**: Add barcode scanning for inventory management

## API Documentation

For detailed API documentation, check the Laravel routes in `routes/api.php` and the corresponding controller methods. 