# Product & Price Sync Status Guide

This guide explains the different sync statuses you may encounter when managing products and prices in the admin panel, and how to resolve them.

## Table of Contents

- [Sync Statuses Overview](#sync-statuses-overview)
- [Understanding Each Status](#understanding-each-status)
- [How to Fix Sync Issues](#how-to-fix-sync-issues)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Sync Statuses Overview

The system tracks the synchronization state between your local database and Stripe. Each product and price can have one of the following statuses:

| Status          | Badge Color | Meaning                                                 |
| --------------- | ----------- | ------------------------------------------------------- |
| **Synced**      | Green       | Perfectly synchronized between local DB and Stripe      |
| **Local Only**  | Gray        | Exists only in your database, never synced to Stripe    |
| **Stripe Only** | Blue        | Exists only in Stripe, not in your database             |
| **Out of Sync** | Orange      | Exists in both but data differs                         |
| **Orphaned**    | Red         | Local DB has Stripe ID but item was deleted from Stripe |
| **Unverified**  | Gray        | Status not yet checked                                  |

## Understanding Each Status

### ✅ Synced

**What it means:**

- The product/price exists in both your database and Stripe
- All data matches perfectly (name, description, active status, etc.)
- No action needed

**When you see this:**

- Everything is working correctly
- The item is ready for use in checkout

---

### 📦 Local Only

**What it means:**

- The product/price exists only in your local database
- It has never been synced to Stripe
- The `stripeId` starts with `local_` or `local_price_`

**Common causes:**

- Created in admin panel without enabling "Sync to Stripe"
- Product/price was created before Stripe integration

**How to fix:**

1. Click the **"Sync"** button next to the item
2. Or use **"Push to Stripe"** from the dropdown menu
3. Or enable "Sync to Stripe" when creating/editing

---

### ☁️ Stripe Only

**What it means:**

- The product/price exists only in Stripe
- It's not in your local database
- This usually happens when items are created directly in Stripe Dashboard

**Common causes:**

- Created manually in Stripe Dashboard
- Imported from another Stripe account
- Database was reset but Stripe data remained

**How to fix:**

1. Use **"Pull from Stripe"** from the dropdown menu
2. Or use the Reconciliation Panel to import all Stripe-only items

---

### ⚠️ Out of Sync (DRIFT)

**What it means:**

- The product/price exists in both your database and Stripe
- **BUT** the data differs between them
- The system detected differences in: name, description, active status, or (for prices) amount/currency/interval

**Common causes:**

- Changed name/description in admin panel but Stripe wasn't updated
- Changed active status in one place but not the other
- For prices: Changed amount, currency, or interval locally but Stripe still has old values
- Manual edits in Stripe Dashboard that weren't synced back

**Example scenarios:**

- You renamed "Basic Plan" to "Starter Plan" in admin, but Stripe still shows "Basic Plan"
- You deactivated a product in admin, but it's still active in Stripe
- You changed a price from $10 to $15 locally, but Stripe still has $10

**How to fix:**

**Option 1: Pull from Stripe (Recommended)**

- Updates your local database with Stripe's data
- Use when: Stripe has the correct/current data
- Click **"Pull from Stripe"** from the dropdown menu

**Option 2: Push to Stripe**

- Updates Stripe with your local database data
- Use when: Your local database has the correct/current data
- Click **"Push to Stripe"** from the dropdown menu

**Option 3: Manual Sync**

- Edit the item in admin panel and enable "Sync to Stripe"
- This will update Stripe with your local changes

---

### 🔗 Orphaned

**What it means:**

- Your database has a `stripeId` for this product/price
- **BUT** that item no longer exists in Stripe (was deleted)
- The system gets a 404 error when trying to verify it in Stripe

**Common causes:**

- Product/price was deleted in Stripe Dashboard
- Stripe account was changed or reset
- Manual deletion in Stripe
- Stripe test/live mode mismatch

**Example:**

- Your database says `stripeId = "prod_abc123"`
- When system checks Stripe, that product doesn't exist (404 error)
- This creates a "broken link" - your DB references something that's gone

**How to fix:**

**Option 1: Push to Stripe (Recreate)**

- Creates a new product/price in Stripe with your local data
- Assigns a new Stripe ID to replace the broken one
- **Recommended** if you want to keep using this item
- Click **"Push to Stripe"** from the dropdown menu

**Option 2: Unlink from Stripe**

- Removes the broken Stripe reference
- Converts the item to "Local Only" status
- Use when: You don't need it synced to Stripe anymore
- Click **"Unlink from Stripe"** from the dropdown menu

**Option 3: Delete**

- If the item is no longer needed, you can delete it
- This removes it from both your database and (if it existed) Stripe

---

### ❓ Unverified

**What it means:**

- The sync status hasn't been checked yet
- The system hasn't verified if the item exists in Stripe
- This is the default state before verification

**How to fix:**

- Click **"Verify Sync Status"** from the dropdown menu
- Or wait for automatic verification (happens when viewing products)
- The status will update to one of the other statuses after verification

---

## How to Fix Sync Issues

### Quick Fixes from Product/Price Table

1. **Verify Status First**

   - Click the three-dot menu (⋮) next to the item
   - Select **"Verify Sync Status"**
   - This will show you the actual current status

2. **Fix Based on Status:**
   - **Local Only** → Click **"Sync"** button or **"Push to Stripe"**
   - **Orphaned** → Click **"Push to Stripe"** to recreate, or **"Unlink from Stripe"** to remove reference
   - **Out of Sync** → Click **"Pull from Stripe"** (if Stripe is correct) or **"Push to Stripe"** (if local is correct)
   - **Stripe Only** → Click **"Pull from Stripe"** to import

### Using the Reconciliation Panel

For bulk operations and a complete overview:

1. Navigate to **Admin → Products → Reconciliation**
2. View the full sync report showing all statuses
3. Use bulk actions:
   - **Push All Local** - Syncs all local-only and orphaned items
   - **Pull All Stripe** - Imports all Stripe-only items
   - **Sync Missing** - Does both (comprehensive sync)

### Manual Sync During Edit

When creating or editing a product/price:

1. Enable **"Sync to Stripe"** checkbox
2. This will automatically sync changes to Stripe
3. For prices: If editing immutable fields (amount, currency, interval) on a synced price, it will create a new price and mark the old one as "legacy"

---

## Best Practices

### ✅ Do's

- **Always verify sync status** before making changes
- **Use "Sync to Stripe"** checkbox when creating/editing to keep things in sync
- **Pull from Stripe** if you made changes directly in Stripe Dashboard
- **Regular reconciliation** - Check the Reconciliation Panel weekly
- **Keep Stripe as source of truth** for production data

### ❌ Don'ts

- **Don't delete in Stripe** without unlinking first (creates orphaned items)
- **Don't manually edit Stripe IDs** in the database
- **Don't ignore "Out of Sync" warnings** - they can cause checkout issues
- **Don't create products/prices directly in Stripe** without importing them

### 🔄 Recommended Workflow

1. **Create products/prices in admin panel** with "Sync to Stripe" enabled
2. **Verify sync status** after creation
3. **Use Reconciliation Panel** weekly to catch any drift
4. **Fix issues immediately** - don't let them accumulate
5. **Test checkout** after any price changes to ensure Stripe integration works

---

## Troubleshooting

### "I see Out of Sync but I didn't change anything"

**Possible causes:**

- Someone else edited it in Stripe Dashboard
- Webhook failed to update your database
- Database was restored from backup but Stripe wasn't

**Solution:**

- Click "Pull from Stripe" to sync with current Stripe data
- Check webhook logs if this keeps happening

### "I see Orphaned but the product exists in Stripe"

**Possible causes:**

- Wrong Stripe account (test vs live mode)
- Stripe API key changed
- Product was moved to different Stripe account

**Solution:**

- Verify you're using the correct Stripe account
- Check your Stripe API keys in environment variables
- Use "Push to Stripe" to recreate with correct account

### "Price shows Out of Sync but I can't change it"

**This is normal for synced prices:**

- Stripe prices are **immutable** (can't change amount, currency, interval)
- To update: Enable "Replace Price in Stripe" when editing
- This creates a new price and marks the old one as "legacy"

### "Multiple products showing Orphaned"

**Possible causes:**

- Stripe account was reset or changed
- Bulk deletion in Stripe Dashboard
- Test/live mode mismatch

**Solution:**

- Use Reconciliation Panel → "Push All Local" to recreate all orphaned items
- Or "Unlink from Stripe" if you don't need them synced

### "Status keeps changing back to Unverified"

**Possible causes:**

- Verification is failing due to API errors
- Rate limiting from Stripe
- Network issues

**Solution:**

- Wait a few minutes and verify again
- Check Stripe API status
- Check your network connection

---

## Status Badge Reference

| Badge              | Status            | Action Needed      |
| ------------------ | ----------------- | ------------------ |
| 🟢 **Synced**      | Perfect sync      | None               |
| ⚪ **Local Only**  | Not in Stripe     | Push to Stripe     |
| 🔵 **Stripe Only** | Not in DB         | Pull from Stripe   |
| 🟠 **Out of Sync** | Data differs      | Pull or Push       |
| 🔴 **Orphaned**    | Deleted in Stripe | Recreate or Unlink |
| ⚪ **Unverified**  | Not checked       | Verify Status      |

---

## Additional Resources

- **Stripe Documentation**: [Products and Prices](https://stripe.com/docs/products-prices/overview)
- **Price Immutability**: Remember that Stripe prices cannot be changed - updates create new prices
- **Legacy Prices**: Old prices are kept in database with "legacy" status for subscription history

---

## Need Help?

If you encounter sync issues that aren't resolved by this guide:

1. Check the Reconciliation Panel for detailed error messages
2. Review the differences shown in the sync status
3. Check Stripe Dashboard to verify the item exists
4. Verify your Stripe API keys are correct
5. Check application logs for detailed error messages
