# Search Function Implementation Guide

**Status:** ✅ **WORKING**  
**Date:** April 20, 2026  
**Last Updated:** Now

---

## 🎯 Overview

The search function for finding helpers and services has been fully implemented and integrated across the frontend and backend. Users can now search, filter by category, and filter by location to find helpers and services.

---

## ✨ What Was Fixed

### Previous State

- Search UI existed but only showed toast messages
- No actual API calls were made
- Local filtering was happening but couldn't search the database
- Only hardcoded SERVICES constant was displayed
- Category/location filters didn't trigger searches

### Current State ✅

- **Real API Search**: Calls `/api/jobs` endpoint with search parameters
- **Live Results**: Displays actual helpers and services from the database
- **Auto-Filtering**: Category and location changes automatically fetch new results
- **Combined Results**: Shows both jobs and services in one unified list
- **Responsive**: Searches update as filters change

---

## 🔧 How It Works

### 1. Backend Search Endpoint

**Endpoint:** `GET /api/jobs`

**Query Parameters:**

- `search` - Text search (searches name, description, tags, requirements)
- `category` - Filter by category ID or name
- `location` - Filter by location
- `status` - Filter by job status
- `workType` - Filter by work type
- `jobType` - Filter by job type
- `urgent` - Filter for urgent jobs only

**Example Requests:**

```bash
# Search for "plumbing" helpers
GET /api/jobs?search=plumbing

# Search in a specific location
GET /api/jobs?search=cleaning&location=Kathmandu

# Search in a category
GET /api/jobs?search=&category=Cleaning&location=Kathmandu

# Combine multiple filters
GET /api/jobs?search=maid&category=Household&location=Patan&urgent=true
```

**Response Format:**

```json
{
  "status": "success",
  "results": 15,
  "data": {
    "jobs": [
      {
        "_id": "...",
        "title": "House Cleaning",
        "name": "Cleaning Services",
        "provider": {
          "_id": "...",
          "name": "Helper Name",
          "rating": 4.5,
          "totalJobs": 20
        },
        "category": {
          "_id": "...",
          "name": "Cleaning"
        },
        "location": "Kathmandu",
        "tags": ["urgent", "professional"],
        "source": "service",
        "createdAt": "2025-04-20T10:30:00Z"
      }
    ]
  }
}
```

### 2. Frontend Search Logic

**Location:** `frontend/src/components/HomeTownHelper.jsx`

**Key Functions:**

#### `fetchServicesWithFilters(searchQuery, categoryFilter, locationFilter)`

```javascript
// Called when:
// 1. Component first loads (no params)
// 2. User clicks "FIND HELP" button
// 3. Category changes (auto-debounced)
// 4. Location changes (auto-debounced)

const fetchServicesWithFilters = async (
  searchQuery = "",
  categoryFilter = "All",
  locationFilter = "All Locations",
) => {
  // Builds query string with params
  // Calls /api/jobs API
  // Converts response to display format
  // Updates state with results
};
```

**Flow:**

1. Build query parameters from filters
2. Make axios GET request to `/api/jobs?...`
3. Receive job + service results
4. Convert to unified display format
5. Update `services` state
6. Component automatically re-renders with new results

### 3. Search UI Components

#### SearchSection Component

**Location:** `frontend/src/components/SearchSection.jsx`

**Props:**

- `search` - Current search text state
- `setSearch` - Update search text
- `locFilter` - Current location filter
- `setLocFilter` - Update location filter
- `activeCat` - Current category filter
- `setActiveCat` - Update category filter
- `onSearch` - Callback when search button clicked
- `scrollToServices` - Function to scroll to results

**Behavior:**

```
User enters search text → onSearch() called
User clicks category button → setActiveCat() called → auto-fetch triggered
User changes location → setLocFilter() called → auto-fetch triggered
User clicks "FIND HELP" → onSearch() called → fetch + scroll
```

#### Category Buttons

- Clicking a category button calls `setActiveCat(category)`
- This triggers the auto-fetch useEffect
- Results update automatically

#### Location Dropdown

- Changing location calls `setLocFilter(location)`
- This triggers the auto-fetch useEffect
- Results update automatically

---

## 📊 Example Searches

### Scenario 1: Search by Name

```
User enters: "Plumber"
Action: Click "FIND HELP"
Result:
  - Shows all helpers with "plumber" in name/description
  - In all locations
  - From all categories
```

### Scenario 2: Search with Category Filter

```
Initial: "All" category selected
User enters: "repair"
User clicks: "Repairs" category button
Action: Search + Filter by category
Result:
  - Shows helpers with "repair" in name/description
  - Only from "Repairs" category
  - Auto-fetches without clicking "FIND HELP"
```

### Scenario 3: Search with Location Filter

```
Initial: "All Locations" selected
User enters: "maid"
User selects: "Kathmandu" location
Action: Search + Filter by location
Result:
  - Shows maids with "maid" in name/description
  - Only in Kathmandu
  - Auto-fetches without clicking "FIND HELP"
```

### Scenario 4: Multi-Filter Search

```
User enters: "experienced"
User selects: "Household" category
User selects: "Lalitpur" location
Action: Click "FIND HELP"
Result:
  - Shows household helpers with "experienced" in profile
  - Only in Lalitpur
  - Only from Household category
```

---

## 🔄 Data Flow Diagram

```
User Input
    ↓
Search Text / Category / Location Changes
    ↓
SearchSection Component State Updates
    ↓
Triggers onSearch() OR Auto-fetch useEffect
    ↓
fetchServicesWithFilters(search, category, location)
    ↓
Build Query: /api/jobs?search=X&category=Y&location=Z
    ↓
Backend /api/jobs Endpoint
    ↓
Search Database (Jobs + Services)
    ↓
Return Combined Results
    ↓
Frontend Converts Format
    ↓
Update services State
    ↓
Re-render ServicesGrid with Results
    ↓
User Sees Updated Results
```

---

## 🧪 Testing the Search

### Test 1: Basic Search

```bash
# In browser console or app UI:
# 1. Go to homepage
# 2. Enter "plumber" in search box
# 3. Click "FIND HELP"
# 4. Verify: Results show helpers/services with "plumber" in name

Expected: Results appear with 3-5 items (if available)
```

### Test 2: Category Filtering

```bash
# 1. Click "Cleaning" category button
# 2. Verify: Results auto-update to show only Cleaning category
# 3. Results should change immediately (no button click needed)

Expected: Results filter automatically within 300ms
```

### Test 3: Location Filtering

```bash
# 1. Select "Kathmandu" from location dropdown
# 2. Verify: Results auto-update to show only Kathmandu location
# 3. Results should change immediately

Expected: Results filter automatically within 300ms
```

### Test 4: Combined Filters

```bash
# 1. Enter "experienced" search
# 2. Select "Household" category
# 3. Select "Patan" location
# 4. Click "FIND HELP"
# 5. Verify: Shows household helpers in Patan with "experienced"

Expected: Results match all 3 criteria
```

### Test 5: API Query String

```bash
# Inspect Network tab in browser DevTools
# Perform search: "plumber" + "Repairs" + "Kathmandu"
#
# Expected URL:
# /api/jobs?search=plumber&category=Repairs&location=Kathmandu
#
# Verify:
# - Search parameter present
# - Category parameter present
# - Location parameter present
```

### Test 6: No Results

```bash
# 1. Enter unusual search: "xyzabc123"
# 2. Click "FIND HELP"
# 3. Verify: Shows "No results found" or empty list
# 4. Verify: No errors in console

Expected: Graceful handling with empty state
```

---

## 🐛 Troubleshooting

### Issue: Search not returning any results

**Solution:**

1. Check if data exists in database: `db.users.find({role: "helper"})`
2. Verify services are created: `db.services.find()`
3. Check backend logs for errors
4. Try searching for common words like "helper", "cleaning"

### Issue: Category filter not working

**Solution:**

1. Verify categories exist: `db.categories.find()`
2. Check that services/jobs have category IDs
3. Use category ObjectId instead of name in query
4. Check browser console for API errors

### Issue: Location filter not working

**Solution:**

1. Verify location values in database
2. Check exact spelling (case-sensitive if needed)
3. Verify location format matches between frontend and backend
4. Check API response for location field

### Issue: Search slow or timeout

**Solution:**

1. Ensure database indexes exist on searchable fields
2. Add indexes to backend:
   ```javascript
   // In Job/Service models
   schema.index({ name: "text", description: "text" });
   schema.index({ category: 1 });
   schema.index({ location: 1 });
   ```
3. Limit results with pagination if needed

---

## 🔍 Backend Search Implementation

**File:** `backend/controllers/jobController.js`

**Search Logic:**

```javascript
exports.getAllJobs = async (req, res) => {
  const { category, location, search, ... } = req.query;

  const filter = {};

  // Category filter
  if (category && category !== 'All')
    filter.category = category;

  // Location filter
  if (location && location !== 'All Locations')
    filter.location = location;

  // Text search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Fetch results
  const jobs = await Job.find(filter)
    .populate('provider', 'name email role avatar rating')
    .populate('category', 'name icon');

  // Also fetch services with same filters
  const services = await Service.find(serviceFilter)...

  // Combine and return
  const combined = [...jobs, ...services];
  res.json({ status: 'success', data: { jobs: combined } });
};
```

---

## 📱 Frontend Search Implementation

**File:** `frontend/src/components/HomeTownHelper.jsx`

**Key Code:**

```javascript
// Fetch function with filters
const fetchServicesWithFilters = async (
  searchQuery = "",
  categoryFilter = "All",
  locationFilter = "All Locations",
) => {
  try {
    setIsSearching(true);

    // Build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (categoryFilter !== "All") params.append("category", categoryFilter);
    if (locationFilter !== "All Locations")
      params.append("location", locationFilter);

    // API call
    const url = `/api/jobs${params.toString() ? "?" + params.toString() : ""}`;
    const res = await axios.get(url);

    // Convert and display
    const services = res.data.data.jobs.map((item) => ({
      // ... convert format
    }));

    setServices(services);
    setIsSearching(false);
  } catch (error) {
    console.error(error);
    setIsSearching(false);
  }
};

// Auto-fetch when filters change
useEffect(() => {
  const timer = setTimeout(() => {
    fetchServicesWithFilters(search, activeCat, locFilter);
  }, 300); // Debounce 300ms
  return () => clearTimeout(timer);
}, [activeCat, locFilter]);

// Manual search on button click
const onSearch = (searchTerm, category, location) => {
  fetchServicesWithFilters(searchTerm, category, location);
};
```

---

## 📈 Performance Optimization

### Current Implementation

- **Debounce:** 300ms delay on category/location changes
- **Lazy Loading:** Only searches on demand or filter change
- **Batching:** Combines jobs + services in single API response

### Future Improvements

1. **Pagination:** Add `limit` and `skip` parameters
2. **Caching:** Cache recent searches
3. **Sorting:** Add sort by rating/date/price
4. **Full-Text Search:** Use MongoDB text indexes
5. **Autocomplete:** Suggest search terms

---

## 📚 API Documentation

### Jobs/Services Search Endpoint

**Endpoint:** `GET /api/jobs`

**Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| search | string | Text search term | "plumber" |
| category | string | Category ID or name | "Repairs" |
| location | string | Location name | "Kathmandu" |
| status | string | Job status | "active" |
| workType | string | Work type | "full-time" |
| jobType | string | Job type | "contract" |
| urgent | boolean | Urgent jobs only | "true" |

**Response:**

```json
{
  "status": "success",
  "results": 25,
  "data": {
    "jobs": [
      {
        "_id": "ObjectId",
        "title": "string",
        "name": "string",
        "provider": { "_id", "name", "rating", "totalJobs" },
        "category": { "_id", "name", "icon" },
        "location": "string",
        "tags": ["string"],
        "source": "job|service",
        "createdAt": "ISO-8601",
        "pay": "string",
        "jobType": "string",
        "workType": "string"
      }
    ]
  }
}
```

---

## ✅ Success Checklist

After implementing this fix, verify:

- ✅ Search bar accepts text input
- ✅ Clicking "FIND HELP" performs search
- ✅ Results update based on search text
- ✅ Category buttons trigger search
- ✅ Location dropdown triggers search
- ✅ Results display helpers from database
- ✅ No console errors
- ✅ Network tab shows API calls with correct parameters
- ✅ Results update automatically when filters change
- ✅ Multiple filters work together
- ✅ Empty state handled gracefully
- ✅ Loading state shows while searching

---

## 🚀 Deployment Notes

1. **Ensure Database Has Data:**

   ```bash
   # Check for services/jobs
   db.services.find().count()
   db.jobs.find().count()
   ```

2. **Verify API Endpoints:**
   - Test `/api/jobs` in Postman
   - Test with different query parameters
   - Check response format

3. **Frontend Build:**

   ```bash
   cd frontend
   npm run build
   # Verify no build errors
   ```

4. **Test in Production:**
   - Search with various terms
   - Filter by multiple categories
   - Verify results are accurate

---

## 📞 Support

**If search isn't working:**

1. Check browser console for errors
2. Check backend server logs
3. Verify database connection
4. Verify services/jobs exist in database
5. Test API endpoint directly in Postman
6. Review this guide for troubleshooting section

**Common Issues:**

- No results → Add sample data to database
- API 404 → Verify route is registered in server.js
- API timeout → Check database connection
- Filters not working → Verify field names match in backend

---

**Status: ✅ READY FOR PRODUCTION**

The search function is now fully integrated and working. Users can find helpers and services using text search, category filters, and location filters.
