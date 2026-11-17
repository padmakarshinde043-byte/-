# Firestore Security Specification

## 1. Data Invariants
1. **Bounded List Queries & No Arbitrary Get**: `/applications/{applicationId}` disallows single-document `get` (`allow get: if false;`) and enforces bounded list queries (`request.query.limit != null && request.query.limit <= 500`) to support the passcode-gated Admin Dashboard while preventing unbounded collection scans.
2. **View-Only Immutability**: Submitted applications are strictly immutable once created (`allow update, delete: if false;` on `/applications/{applicationId}`).
3. **Strict Schema & No Ghost Fields**: Every application creation must pass `isValidApplication()` enforcing `hasAll` on required keys, `hasOnly` on allowed keys, exact field types, strict `.size()` boundaries, `mobile` 10-digit regex, `agreedToTerms == true`, bounded `familyMembers` (`size() <= 15`), and `createdAt == request.time`.
4. **Admin-Only Settings**: `/settings/googleSheet` remains strictly restricted to verified admins (`isAdmin()`), while the dashboard caches sheet links locally in browser storage to conserve Firestore free-tier quota.

## 2. Adversarial Payloads
1. Unbounded `list` on `/applications` without `limit` or `limit > 500` -> PERMISSION_DENIED.
2. Direct `get` on `/applications/MSS-2026-100001` -> PERMISSION_DENIED.
3. Application `create` with ghost field `isAdmin: true` -> PERMISSION_DENIED (`hasOnly` check fails).
4. Application `create` with `id` mismatch (`docId != data.id`) -> PERMISSION_DENIED.
5. Application `create` with invalid path ID (`id: "bad id with spaces!"`) -> PERMISSION_DENIED (`isValidId` regex fails).
6. Application `create` with oversized `fullName` (> 150 chars) or `photoUrl` (> 260,000 chars) -> PERMISSION_DENIED.
7. Application `create` with invalid `mobile` (`"123"`) -> PERMISSION_DENIED.
8. Application `create` with client-forged `createdAt` instead of server timestamp (`request.time`) -> PERMISSION_DENIED.
9. Application `update` or `delete` even by signed-in user -> PERMISSION_DENIED (immutable view-only archive).
10. Non-admin `read` or `write` on `/settings/googleSheet` -> PERMISSION_DENIED.
