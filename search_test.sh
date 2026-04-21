#!/bin/bash

# Search Function Test Script
# Tests the working search implementation

echo "🔍 Search Function Testing Guide"
echo "================================"
echo ""

echo "✅ QUICK TEST STEPS:"
echo ""
echo "1. START THE APPLICATION:"
echo "   Terminal 1: cd backend && npm start"
echo "   Terminal 2: cd frontend && npm start"
echo ""

echo "2. OPEN BROWSER:"
echo "   Navigate to: http://localhost:3000"
echo ""

echo "3. TEST BASIC SEARCH:"
echo "   - Enter 'plumber' in search box"
echo "   - Click 'FIND HELP' button"
echo "   - Verify: Results appear with plumbers"
echo ""

echo "4. TEST CATEGORY FILTER:"
echo "   - Click on 'Repairs' category button"
echo "   - Verify: Results filter to repairs only (instant)"
echo "   - Try other categories"
echo ""

echo "5. TEST LOCATION FILTER:"
echo "   - Select 'Kathmandu' from location dropdown"
echo "   - Verify: Results filter to Kathmandu only (instant)"
echo "   - Try other locations"
echo ""

echo "6. TEST COMBINED FILTERS:"
echo "   - Enter search text: 'experienced'"
echo "   - Select category: 'Household'"
echo "   - Select location: 'Patan'"
echo "   - Click 'FIND HELP'"
echo "   - Verify: Shows household helpers in Patan"
echo ""

echo "7. CHECK NETWORK REQUESTS:"
echo "   - Open Browser DevTools (F12)"
echo "   - Go to Network tab"
echo "   - Perform a search"
echo "   - Verify: See request to /api/jobs?search=...&category=...&location=..."
echo ""

echo "📊 API TEST COMMANDS:"
echo "====================="
echo ""

echo "# Test basic search (returns all helpers/services)"
echo "curl 'http://localhost:5000/api/jobs'"
echo ""

echo "# Test search with keyword"
echo "curl 'http://localhost:5000/api/jobs?search=plumber'"
echo ""

echo "# Test search with category"
echo "curl 'http://localhost:5000/api/jobs?search=&category=Repairs'"
echo ""

echo "# Test search with location"
echo "curl 'http://localhost:5000/api/jobs?search=&location=Kathmandu'"
echo ""

echo "# Test combined filters"
echo "curl 'http://localhost:5000/api/jobs?search=cleaning&category=Household&location=Kathmandu'"
echo ""

echo "✨ EXPECTED RESULTS:"
echo "==================="
echo "- Search returns items from database (not hardcoded)"
echo "- Results change instantly when filters change"
echo "- Multiple filters work together"
echo "- Empty results handled gracefully"
echo "- No console errors"
echo ""

echo "🐛 TROUBLESHOOTING:"
echo "=================="
echo ""
echo "Problem: No results showing"
echo "  → Check database has data: db.services.find()"
echo "  → Add test data if needed"
echo ""

echo "Problem: Search not updating"
echo "  → Check browser console (F12) for errors"
echo "  → Verify backend server is running"
echo "  → Check Network tab for failed requests"
echo ""

echo "Problem: Category/location not filtering"
echo "  → Verify field names in database"
echo "  → Check that services/jobs have these fields"
echo "  → Restart both frontend and backend"
echo ""

echo "✅ DEPLOYMENT CHECKLIST:"
echo "======================="
echo "☐ Backend running on port 5000"
echo "☐ Frontend running on port 3000"
echo "☐ MongoDB connected"
echo "☐ Services/jobs exist in database"
echo "☐ Search returns real database results"
echo "☐ All filters work correctly"
echo "☐ No console errors"
echo "☐ Network requests show correct query params"
echo ""

echo "🚀 Ready to deploy!"
