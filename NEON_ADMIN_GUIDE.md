# GlobalMart — Neon Admin Command Book

Reference sheet for administrative database tasks: deleting a user, changing a role, fixing an
order, cleaning up sessions, etc. Two ways to run these are covered:

1. **Neon SQL Editor** (raw SQL) — fast, direct, good for reads and simple writes.
2. **`admin-tools.mjs`** (Node script using Prisma) — required for anything involving passwords
   (bcrypt hashing can't be done in plain SQL) and safer for deletes (it respects the app's
   foreign key rules and does things in the right order automatically).

**Where to run SQL:** Neon dashboard → your project → **SQL Editor**.
**Where to run the script:** your project folder, `node admin-tools.mjs <command> ...`

---

## ⚠️ Read this first

- Your database has **foreign key RESTRICT constraints**: you cannot delete a `User` who still
  has `Order`s or `Session`s, and you cannot delete a `Product` that has ever been ordered
  (it has `OrderItem`s pointing to it). Deleting the wrong thing first will fail loudly with a
  foreign key error — that's Postgres protecting your data, not a bug.
- **Always `SELECT` before you `DELETE` or `UPDATE`.** Confirm you're targeting the right row(s)
  first.
- **Always include a specific `WHERE id = '...'`.** Never run `DELETE FROM "Order";` or
  `UPDATE "Product" SET ...;` without a `WHERE` — that would touch every row in the table.
- Neon keeps point-in-time restore for a limited window on paid plans — check your plan before
  relying on it as a safety net for mistakes.

---

## 1. Read-only queries (safe to run anytime)

**List all users:**
```sql
SELECT id, "fullName", email, role, "businessName", "createdAt" FROM "User" ORDER BY "createdAt" DESC;
```

**List all vendors only:**
```sql
SELECT id, "fullName", email, "businessName" FROM "User" WHERE role = 'vendor';
```

**Find a user by email:**
```sql
SELECT * FROM "User" WHERE email = 'someone@example.com';
```

**List a user's orders:**
```sql
SELECT id, "totalAmount", status, "paymentStatus", "createdAt"
FROM "Order" WHERE "userId" = 'PASTE_USER_ID_HERE'
ORDER BY "createdAt" DESC;
```

**List a vendor's products:**
```sql
SELECT id, name, price, stock, category FROM "Product"
WHERE "vendorId" = 'PASTE_VENDOR_ID_HERE' OR vendor = 'Exact Business Name';
```

**Revenue for one vendor (paid orders only):**
```sql
SELECT SUM(oi.price * oi.quantity) AS revenue
FROM "OrderItem" oi
JOIN "Product" p ON p.id = oi."productId"
JOIN "Order" o ON o.id = oi."orderId"
WHERE (p."vendorId" = 'PASTE_VENDOR_ID_HERE' OR p.vendor = 'Exact Business Name')
  AND o."paymentStatus" = 'PAID';
```

**Find expired sessions (safe to clean up):**
```sql
SELECT * FROM "Session" WHERE "expiresAt" < NOW();
```

---

## 2. Simple writes (safe via SQL)

**Delete expired sessions (forces a re-login, nothing else affected):**
```sql
DELETE FROM "Session" WHERE "expiresAt" < NOW();
```

**Force-logout one user (delete their active sessions):**
```sql
DELETE FROM "Session" WHERE "userId" = 'PASTE_USER_ID_HERE';
```

**Promote a customer to vendor (rarely needed — normally they register as vendor directly):**
```sql
UPDATE "User" SET role = 'vendor', "businessName" = 'Their Shop Name'
WHERE id = 'PASTE_USER_ID_HERE';
```

**Manually mark an order as paid** (e.g. customer paid but the webhook/status-check missed it —
verify with NotchPay first before doing this):
```sql
UPDATE "Order" SET "paymentStatus" = 'PAID', status = 'PROCESSING'
WHERE id = 'PASTE_ORDER_ID_HERE';
```

**Cancel an order:**
```sql
UPDATE "Order" SET status = 'CANCELLED' WHERE id = 'PASTE_ORDER_ID_HERE';
```

**Delete a product that has NEVER been ordered** (check first — see section 3 if it has orders):
```sql
DELETE FROM "Product" WHERE id = 'PASTE_PRODUCT_ID_HERE';
```

---

## 3. Things that need `admin-tools.mjs` instead

Some operations are unsafe or impossible in plain SQL:

| Task | Why SQL alone isn't enough |
|---|---|
| Reset a user's password | Passwords are stored as bcrypt hashes — you can't write a valid one by hand in SQL |
| Delete a user who has orders | Would violate the RESTRICT constraint; needs the orders handled first, in the right order |
| Delete a product that has been ordered | Same — `OrderItem` rows reference it; the script decides whether to block or cascade correctly |

Use the companion script below for these. Run it from your project folder:

```bash
node admin-tools.mjs list-users
node admin-tools.mjs reset-password user@example.com NewPassword123
node admin-tools.mjs delete-user user@example.com
node admin-tools.mjs delete-product <productId>
node admin-tools.mjs make-vendor user@example.com "Business Name"
```

Each command prints exactly what it did (or why it refused) before making any change.

---

## 4. General safety checklist

- [ ] Ran a `SELECT` first and confirmed the exact row(s)?
- [ ] `WHERE` clause present and specific (an `id`, not a broad condition)?
- [ ] If deleting a `User` or `Product`: checked for related `Order`/`OrderItem`/`Session` rows first?
- [ ] For anything involving money (`paymentStatus`, `totalAmount`): double-checked against the
      NotchPay dashboard before overriding it by hand?
- [ ] Not running this against production data by accident during a test?
