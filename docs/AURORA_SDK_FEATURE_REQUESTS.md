# Aurora SDK – Feature requests for a fully functioning store

This list is based on building the aurora-starter-ecom template. We need these capabilities in the **Aurora SDK / API** to support a full e‑commerce flow: shipping, payment, checkout, user dashboard, stores by location, and nearby stores.

---

## 1. **Stores & location**

### 1.1 Nearby stores / stores by location
- **Current:** `client.site.stores()` returns all stores; the frontend sorts by distance using haversine on the client after fetching every store.
- **Ask:** Add a store list that accepts location so the backend can do geo filtering and ordering, e.g.:
  - `client.site.stores({ lat, lng, radiusKm?: number })` or
  - `client.site.storesNear(lat, lng, options?)`
- **Why:** Fewer round-trips, correct use of PostGIS/vendor locations, and ability to filter by delivery catchment (e.g. only stores that deliver to this point).

### 1.2 Store/vendor location in API response
- **Current:** Store records are assumed to have a `location` with `coordinates` (e.g. GeoJSON) for distance math; this may be implicit or vary by tenant.
- **Ask:** Document the store/vendor response shape (including `location` / coordinates) and guarantee that stores returned for “nearby” or list endpoints include location when available.

---

## 2. **Shipping & delivery**

### 2.1 Delivery slots
- **Current:** `client.store.deliverySlots(lat, lng)` exists and is used.
- **Ask:** Clarify or extend:
  - Is the slot list **per store/vendor** or global? If we have multiple vendors, we need slots scoped by selected store (e.g. `deliverySlots(lat, lng, { storeId })` or equivalent).
  - Document how slots relate to `vendor_catchments` and `delivery_slots` (per README) so frontends can show the right slots for the chosen store.

### 2.2 Shipping cost and rules
- **Current:** No SDK/API for shipping; the template uses a hardcoded `SHIPPING_CENTS`.
- **Ask:** Add one or both:
  - **Shipping cost:** e.g. `client.store.shipping.estimate({ storeId?, lat, lng, lineItems })` returning amount and optional breakdown (e.g. by rule: “free over £50”, “standard £2.50”).
  - **Store config:** Expose shipping-related config from store/tenant (e.g. free-shipping threshold, default shipping cost, carrier options) so the frontend can display and calculate consistently.

---

## 3. **Checkout & payment**

### 3.1 Checkout session and customer identity
- **Current:** `client.store.checkout.sessions.create(params)` takes `lineItems`, `successUrl`, `cancelUrl`, `deliverySlotId`. No customer or shipping address in the main flow; ACME flow collects shipping at completion.
- **Ask:**
  - Allow **customer identity** when creating the session, e.g. `customerId` and/or `customerEmail` (and optionally `userId` for your orders table), so that:
    - Orders are linked to the logged-in user.
    - “My orders” and receipts can be tied to the same identity.
  - Allow **shipping (and billing) address** in session create (for Stripe and ACME) so the backend can attach them to the order and prefill where applicable.

### 3.2 Checkout session params (types)
- **Ask:** Publish or document the full `CreateCheckoutSessionParams` (and any server-side validation) so frontends know what can be sent: e.g. `deliverySlotId`, `shippingAddress`, `customerId`, `metadata`, etc.

### 3.3 Payment methods (saved)
- **Current:** No SDK methods for saved payment methods; the account “Payment Methods” area has no backend.
- **Ask:** If Aurora supports saved payment methods, add e.g.:
  - `client.store.paymentMethods.list()` (for current user)
  - `client.store.paymentMethods.add(...)` / `remove(id)` (or equivalent)
  with clear auth contract (how “current user” is determined).

---

## 4. **User dashboard: orders**

### 4.1 List orders for the current user
- **Current:** Orders table has `user_id`, but there is no SDK/API to list “my orders”. The account “Orders” page is placeholder.
- **Ask:** Add e.g.:
  - `client.store.orders.list({ userId })` or
  - `client.site.orders.forUser(userId)` or
  - An authenticated endpoint that uses the request’s auth to return that user’s orders.
- **Why:** Needed for “My orders”, order history, and reorder flows.

### 4.2 Get a single order (customer view)
- **Current:** Vendor pickwalk uses tenant/vendor APIs; there is no customer-facing “order detail” in the SDK.
- **Ask:** Add e.g. `client.store.orders.get(orderId)` (or `client.site.orders.get(orderId)`) that:
  - Returns order + line items + status + delivery/shipping info.
  - Is scoped to the current user (or validated by order id + user id) so customers only see their own orders.

---

## 5. **User dashboard: addresses**

### 5.1 CRUD for user addresses
- **Current:** Schema has an `addresses` table with `user_id`, but there are no SDK methods to list or manage addresses. The “Addresses” page has no API.
- **Ask:** Add e.g.:
  - `client.store.addresses.list({ userId })` or `client.site.addresses.forUser(userId)`
  - `client.store.addresses.create({ userId, ...address })`
  - `client.store.addresses.update(id, { ... })`
  - `client.store.addresses.delete(id)` (with user scoping)
- **Why:** So “Your addresses” and checkout can use the same saved addresses and only show the current user’s data.

### 5.2 Default address
- **Ask:** If addresses support “default”, document it (e.g. `is_default`) and ensure list/create/update support it so the UI can set and display a default.

---

## 6. **Auth and identity**

### 6.1 Contract for “current user”
- **Current:** Auth is not part of the SDK; the template uses a placeholder login. Orders/addresses need a `user_id` but the SDK doesn’t define how that is provided or validated.
- **Ask:**
  - Document how the Aurora API expects **user identity** (e.g. JWT, API key per user, `X-User-Id` header, or integration with Supabase Auth / other IdP).
  - If the API can accept a “current user” from the request (e.g. via JWT), provide:
    - Optional helpers or middleware contract so that `orders.list()`, `addresses.list()`, etc. can be called without passing `userId` explicitly when the request is authenticated.

### 6.2 Session / tenant context
- **Ask:** Clarify whether store/checkout/orders endpoints are always tenant-scoped by API key (or tenant slug) and whether any endpoints are user-scoped (and how).

---

## 7. **Store and catalog config**

### 7.1 Store config shape
- **Current:** `client.store.config()` is used for `catalogTableSlug`, `categoryTableSlug`, `currency`, `enabled`. Shipping and payment config are not exposed.
- **Ask:**
  - Document the full config response (and any tenant-specific overrides).
  - Expose shipping-related config (e.g. free-shipping threshold, default shipping cost, supported delivery types) if available in the backend.

### 7.2 Search and filters
- **Current:** `client.site.search(params)` supports e.g. `vendorId`, `category`, `q`, `limit`, `offset`, `sort`, `order`.
- **Ask:** Document full `SearchParams` and any backend-specific behaviour (e.g. category filter by slug vs id, availability, store-specific inventory). If not yet supported, consider:
  - Filter by “in stock” or “available at this store”.
  - Price range or other faceted filters for catalogue pages.

---

## 8. **Summary table**

| Area              | Current SDK/API support                         | Missing for “full store” |
|-------------------|--------------------------------------------------|---------------------------|
| Stores by location| `site.stores()` only; client-side distance sort  | Geo/nearby stores API     |
| Delivery slots    | `store.deliverySlots(lat, lng)`                  | Store-scoped slots; docs |
| Shipping cost     | None                                             | Estimate + config         |
| Checkout          | Sessions create (Stripe/ACME); no customer/addr  | Customer id, shipping addr|
| Payment methods   | None                                             | List/add/remove saved     |
| Orders (customer) | None                                             | List + get by id          |
| Addresses          | None                                             | CRUD scoped by user       |
| Auth              | Not in SDK                                       | Contract for user identity|

---

Use this list when talking to the Aurora team so they can prioritise SDK and API work for a fully functioning store (shipping, payment, checkout, user dashboard, stores by location, nearby stores).
