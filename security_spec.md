# Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: `applications` documents contain sensitive PII (mobile numbers, emails, addresses, family member details, photos, signatures). Only verified central office administrators (`isAdmin()`) may `get` or `list` `/applications/{applicationId}`. Unauthenticated and non-admin users cannot read any submitted application.
2. **View-Only Immutability**: Submitted applications are strictly immutable once created (`allow update, delete: if false;` on `/applications/{applicationId}`).
3. **Strict Schema & No Ghost Fields**: Every application creation must pass `isValidApplication()` enforcing `hasAll` on required keys, `hasOnly` on allowed keys, exact field types, strict `.size()` boundaries, `mobile` 10-digit regex, `agreedToTerms == true`, bounded `familyMembers` (`size() <= 15`), and `createdAt == request.time`.
4. **Admin-Only Configuration**: `/settings/googleSheet` can only be read, created, updated, or deleted by verified admins (`isAdmin()`), with `updatedAt == request.time` and `affectedKeys().hasOnly(...)` on update.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated `get` on `/applications/MSS-2026-100001` -> PERMISSION_DENIED.
2. Unauthenticated `list` on `/applications` -> PERMISSION_DENIED.
3. Authenticated non-admin (`random@gmail.com`) `list` on `/applications` -> PERMISSION_DENIED.
4. Spoofed admin (`email: "padmakarshinde043@gmail.com"`, `email_verified: false`) `list` on `/applications` -> PERMISSION_DENIED.
5. Application `create` with ghost field `isAdmin: true` -> PERMISSION_DENIED (`hasOnly` check fails).
6. Application `create` with `id` mismatch (`docId != data.id`) -> PERMISSION_DENIED.
7. Application `create` with invalid path ID (`id: "bad id with spaces!"`) -> PERMISSION_DENIED (`isValidId` regex fails).
8. Application `create` with oversized `fullName` (> 150 chars) or `photoUrl` (> 260,000 chars) -> PERMISSION_DENIED.
9. Application `create` with invalid `mobile` (`"123"`) -> PERMISSION_DENIED.
10. Application `create` with client-forged `createdAt` instead of server timestamp (`request.time`) -> PERMISSION_DENIED.
11. Application `update` or `delete` even by signed-in user -> PERMISSION_DENIED (immutable view-only archive).
12. Non-admin `read` or `write` on `/settings/googleSheet` -> PERMISSION_DENIED.
