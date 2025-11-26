# Promotions System - Quick Reference

## Links & Locations

### For Admins
- **Access:** http://localhost:3000/admin → Click "Promotions" in sidebar
- **Or Direct:** http://localhost:3000/admin/index.html (navigate to promotions page)

### For Users
- **Public Link:** http://localhost:3000/promo.html
- **Share this link** to users who should claim their promotional trial

---

## Admin Tasks

### Import Promotional Users (CSV Bulk)

**Steps:**
1. Go to Admin → Promotions
2. Prepare CSV file with columns:
   ```
   twitter_handle,phone_number
   user123,+234-803-123-4567
   ```
3. Click "Import CSV" button
4. Select file and click button again
5. See success message and updated trials list

**Result:** Each user gets 14 days of Pro tier

---

### View All Trials

**Location:** Promotions admin page, "Active & Expired Trials" section

**Columns:**
- User ID (shortened)
- Twitter Handle
- Phone Number
- Trial Tier (pro/premium)
- Start Date
- Expiry Date
- Status (Active/Expired in green/red)
- Action Buttons

---

### Extend User Trial

**Steps:**
1. Find user in trials table
2. Click "Extend" button
3. Enter additional days (1-90)
4. Optionally add reason (e.g., "customer retention")
5. Click "Extend" in modal
6. See confirmation message

---

### Cancel User Trial

**Steps:**
1. Find user in trials table
2. Click "Cancel" button
3. Confirm in dialog
4. User immediately downgraded to free tier
5. Trial removed from active list

---

## User Tasks

### Claim Promotional Trial

**Steps:**
1. Open http://localhost:3000/promo.html
2. Enter Twitter Handle (with @): @username
3. Enter Phone Number: +1-415-555-0123
4. Click "Claim Trial"
5. See success modal with checkmark
6. Click "Go to Dashboard"

**What happens:**
- Gets 2 weeks of Pro access
- Access to all Pro features
- Trial is one-time use only

---

## API Integration

### For Backend Developers

All promo endpoints available in `/assets/js/api.js`:

```javascript
// Import users
API.importPromoUsers(formData)

// Get trials
API.getActiveTrials(status)  // status: 'active', 'expired', 'all'

// Get user trial
API.getUserTrial(userId)

// Extend trial
API.extendTrial(userId, additionalDays, reason)

// Cancel trial
API.cancelTrial(userId)

// Check expirations (scheduled)
API.checkTrialExpirations()
```

### Endpoint URLs
```
POST /api/promo/import-csv
GET  /api/promo/active-trials
GET  /api/promo/user/{user_id}/trial
POST /api/promo/extend/{user_id}
POST /api/promo/cancel/{user_id}
POST /api/promo/check-expirations
```

---

## Validation Rules

### Twitter Handle
- Must start with `@`
- Cannot be empty
- Example: `@elonmusk`

### Phone Number
- Must be valid format
- Stored as provided
- Example: `+1-415-555-0123`

### Trial Extension
- Days: 1-90 maximum
- Can add reason for record keeping
- Updates expiry date

---

## Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Please select a CSV file" | No file chosen | Select CSV before import |
| "Please fill in all fields" | Missing input | Enter both handle and phone |
| "Twitter handle must start with @" | Invalid format | Use format @username |
| "Failed to redeem trial" | User not found or already used | Check handle/phone, or already claimed |
| "Trial extended by X days" | Success message | User can now use extended trial |

---

## CSV Template

Create a file `promos.csv`:

```csv
twitter_handle,phone_number
user1,+234-803-123-4567
user2,+1-415-555-0123
user3,+44-20-7946-0958
sarah_dev,+33-1-42-34-56-78
```

**Notes:**
- Include header row
- One user per line
- Must have both columns
- Phone format flexible (any format accepted)

---

## Success Modal Details

When user claims trial:
- ✅ Animated green checkmark
- Message: "Success! Your promotional trial has been activated"
- Shows: "Trial Duration: 14 days" and "Tier: Professional"
- Button to go to dashboard

---

## Troubleshooting

### "This promotional code can only be used once per user"
- User already claimed their trial
- Backend prevents duplicates
- Contact admin if needs reset

### CSV Import Shows No Errors But Users Not Added
- Check CSV format (must have twitter_handle,phone_number)
- Verify phone numbers match backend records
- Check admin token is valid

### User Can't See Extended Trial
- Refresh page to see updated expiry date
- Check status in admin panel
- Wait for page refresh (cache may be 10 minutes)

---

## Notes for Developers

### Frontend State
- Promo page has `hasRedeemed` flag to track one-time use
- Session-based, resets on page reload

### Backend Validation
- Should validate twitter_handle and phone_number match registered user
- Should prevent duplicate trial activations
- Should handle CSV parsing and validation

### Database Fields
- Trial should store: user_id, twitter_handle, phone_number, trial_tier, created_at, expiry_date

---

## Support Information

**Issue:** Users can redeem multiple times
- **Solution:** Backend must check for existing active trial before creating new one

**Issue:** CSV import fails silently
- **Solution:** Check API response handling and return meaningful error messages

**Issue:** Admin can't see imported users
- **Solution:** Verify API is returning trials, check status filter, refresh page

---

**Last Updated:** November 23, 2025
**System Status:** ✅ Ready for Production
