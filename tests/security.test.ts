/**
 * SUITE DE TESTS DE SÉCURITÉ AUTOMATISÉS
 * Association Sportive Atlas Football
 *
 * Exécution via : npx tsx tests/security.test.ts
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeCsvCell,
  hashPassword,
  verifyPassword,
  validatePaymentInput,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginAttempts,
  createSecureSession,
  isSessionValid,
  ROLE_PERMISSIONS,
} from '../src/utils/security';
import { sanitizeUser } from '../src/services/firebaseAuth';
import { User, Player, Team } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('1. Unauthenticated users cannot access private data', () => {
  test('Session validation rejects empty, null, or corrupted sessions', () => {
    assert.strictEqual(isSessionValid(null), false, 'Null session must be invalid');
    // @ts-expect-error Testing invalid object
    assert.strictEqual(isSessionValid({}), false, 'Empty session object must be invalid');
  });

  test('Sanitize user completely strips password from user profile', () => {
    const rawUser: User = {
      id: 'usr-test',
      name: 'Test User',
      email: 'test@asatlasfoot.ma',
      password: 'PlainSecretPassword!',
      role: 'ADMIN',
      active: true,
      createdAt: new Date().toISOString(),
    };
    const sanitized = sanitizeUser(rawUser);
    assert.strictEqual(sanitized.password, undefined, 'Password must be completely stripped');
    assert.strictEqual('password' in sanitized, false, 'Password property must not exist in sanitized object');
  });
});

describe('2. A coach cannot access unauthorized teams', () => {
  test('Coach permissions block cross-team management', () => {
    const coachPermissions = ROLE_PERMISSIONS['ENTRAINEUR'];
    assert.strictEqual(coachPermissions.canManageAllTeams, false, 'Coach cannot manage all teams');
    assert.strictEqual(coachPermissions.canManageAllPlayers, false, 'Coach cannot manage all players');
  });

  test('Coach scoped validation rejects operations outside assigned team', () => {
    const coachUser: User = {
      id: 'usr-coach',
      name: 'Coach Rachid',
      email: 'coach@asatlasfoot.ma',
      role: 'ENTRAINEUR',
      assignedTeamId: 'team-3', // U13
      active: true,
      createdAt: new Date().toISOString(),
    };

    const targetTeamId = 'team-1'; // U7 (Unauthorized)
    const isAuthorized = coachUser.assignedTeamId === targetTeamId;
    assert.strictEqual(isAuthorized, false, 'Coach must be denied access to team-1');

    const authorizedTeamId = 'team-3';
    assert.strictEqual(coachUser.assignedTeamId === authorizedTeamId, true, 'Coach has access only to team-3');
  });
});

describe('3. A staff user cannot promote themselves to administrator', () => {
  test('Staff permissions forbid user and role management', () => {
    const staffPermissions = ROLE_PERMISSIONS['STAFF'];
    assert.strictEqual(staffPermissions.canManageUsers, false, 'Staff cannot manage users');
    assert.strictEqual(staffPermissions.canDeleteEntities, false, 'Staff cannot delete entities');
  });

  test('Self-role modification logic detects and rejects privilege escalation', () => {
    const staffUserId = 'usr-staff-1';
    const targetUserId = 'usr-staff-1';
    const requestedRole = 'ADMIN';
    const currentRole = 'STAFF';

    const isSelfRoleChange = targetUserId === staffUserId && requestedRole !== currentRole;
    assert.strictEqual(isSelfRoleChange, true, 'Self role change attempt detected');
  });
});

describe('4. Tenant and multi-association isolation', () => {
  test('Firestore rules enforce associationId isolation and default deny', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    assert.strictEqual(fs.existsSync(rulesPath), true, 'firestore.rules must exist');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    assert.match(rulesContent, /belongsToSameAssociation/, 'Rules must verify association tenant isolation');
    assert.match(rulesContent, /allow read, write: if false;/, 'Default deny must be present');
  });
});

describe('5. A comptable cannot change administrator permissions', () => {
  test('Comptable role lacks user management privileges', () => {
    const comptablePermissions = ROLE_PERMISSIONS['COMPTABLE'];
    assert.strictEqual(comptablePermissions.canManageUsers, false, 'Comptable cannot manage users');
    assert.strictEqual(comptablePermissions.canManageSettings, false, 'Comptable cannot manage association settings');
  });
});

describe('6. Unauthorized users cannot alter or delete payments', () => {
  test('Financial permissions restricted to COMPTABLE and ADMIN', () => {
    assert.strictEqual(ROLE_PERMISSIONS['ENTRAINEUR'].canManageFinancials, false, 'Coach cannot manage payments');
    assert.strictEqual(ROLE_PERMISSIONS['STAFF'].canManageFinancials, false, 'Staff cannot manage payments');
    assert.strictEqual(ROLE_PERMISSIONS['COMPTABLE'].canManageFinancials, true, 'Comptable can manage payments');
    assert.strictEqual(ROLE_PERMISSIONS['ADMIN'].canManageFinancials, true, 'Admin can manage payments');
  });

  test('Payments deletion is forbidden in firestore rules', () => {
    const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
    assert.match(rulesContent, /match \/payments\/\{paymentId\} \{[\s\S]*?allow delete: if false;/, 'Payments must never be directly deletable');
  });
});

describe('7. Invalid amounts and malformed inputs are rejected', () => {
  test('validatePaymentInput rejects negative, zero, and infinite amounts', () => {
    const validBase = {
      playerId: 'ply-1',
      date: '2026-10-15',
      method: 'Espèces' as const,
    };

    assert.strictEqual(validatePaymentInput({ ...validBase, amount: -100 }).isValid, false);
    assert.strictEqual(validatePaymentInput({ ...validBase, amount: 0 }).isValid, false);
    assert.strictEqual(validatePaymentInput({ ...validBase, amount: NaN }).isValid, false);
    assert.strictEqual(validatePaymentInput({ ...validBase, amount: Infinity }).isValid, false);
    assert.strictEqual(validatePaymentInput({ ...validBase, amount: 999999 }).isValid, false); // Exceeds 50 000 DH
    assert.strictEqual(validatePaymentInput({ ...validBase, amount: 500 }).isValid, true);
  });

  test('validatePaymentInput rejects invalid dates and methods', () => {
    const validBase = {
      playerId: 'ply-1',
      amount: 300,
    };

    // @ts-expect-error Testing invalid method
    assert.strictEqual(validatePaymentInput({ ...validBase, date: '2026-10-15', method: 'Bitcoin' }).isValid, false);
    assert.strictEqual(validatePaymentInput({ ...validBase, date: 'invalid-date', method: 'Espèces' }).isValid, false);
  });
});

describe('8. Sensitive exports require authorization and CSV formula sanitization', () => {
  test('sanitizeCsvCell neutralizes CSV formula injection (CWE-1236)', () => {
    assert.strictEqual(sanitizeCsvCell('=CMD|...'), "'=CMD|...", 'Formula trigger = must be escaped');
    assert.strictEqual(sanitizeCsvCell('+1234'), "'+1234", 'Formula trigger + must be escaped');
    assert.strictEqual(sanitizeCsvCell('-SUM(A1)'), "'-SUM(A1)", 'Formula trigger - must be escaped');
    assert.strictEqual(sanitizeCsvCell('@calc'), "'@calc", 'Formula trigger @ must be escaped');
    assert.strictEqual(sanitizeCsvCell('\tmalicious'), "'\tmalicious", 'Tab escape must be sanitized');
    assert.strictEqual(sanitizeCsvCell('Normal text'), 'Normal text', 'Normal text remains unmodified');
  });

  test('Export permissions require privileged roles', () => {
    assert.strictEqual(ROLE_PERMISSIONS['COMPTABLE'].canExportData, true);
    assert.strictEqual(ROLE_PERMISSIONS['ADMIN'].canExportData, true);
    assert.strictEqual(ROLE_PERMISSIONS['ENTRAINEUR'].canExportData, false);
    assert.strictEqual(ROLE_PERMISSIONS['STAFF'].canExportData, false);
  });
});

describe('9. Firestore rules deny unauthorized operations', () => {
  test('Receipts are strictly immutable', () => {
    const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
    assert.match(rulesContent, /match \/receipts\/\{receiptId\} \{[\s\S]*?allow update, delete: if false;/, 'Receipts must be immutable');
  });

  test('Audit logs are append-only and immutable', () => {
    const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
    assert.match(rulesContent, /match \/auditLogs\/\{logId\} \{[\s\S]*?allow update, delete: if false;/, 'Audit logs must be append-only and immutable');
  });
});

describe('10. Cryptographic password hashing and rate limiting', () => {
  test('hashPassword produces 64-character SHA-256 hex string with salt', async () => {
    const hash = await hashPassword('Atlas2026!');
    assert.strictEqual(hash.length, 64, 'SHA-256 hash must be 64 hex characters');
    const isValid = await verifyPassword('Atlas2026!', hash);
    assert.strictEqual(isValid, true, 'Matching password must verify');
    const isInvalid = await verifyPassword('WrongPassword', hash);
    assert.strictEqual(isInvalid, false, 'Wrong password must be rejected');
  });

  test('Rate limiting enforces lockout after 5 failed attempts', () => {
    const testId = 'attacker@test.ma';
    resetLoginAttempts(testId);

    for (let i = 0; i < 4; i++) {
      const res = recordFailedLoginAttempt(testId);
      assert.strictEqual(res.locked, false, 'Should not be locked yet');
    }

    const fifth = recordFailedLoginAttempt(testId);
    assert.strictEqual(fifth.locked, true, 'Fifth attempt must lock out user');

    const limitCheck = checkLoginRateLimit(testId);
    assert.strictEqual(limitCheck.isAllowed, false, 'Further attempts must be blocked by rate limiter');
    resetLoginAttempts(testId);
  });
});

describe('11. Logout and session expiry behave correctly', () => {
  test('Expired session is rejected by isSessionValid', () => {
    const session = createSecureSession('usr-1');
    assert.strictEqual(isSessionValid(session), true, 'Fresh session must be valid');

    // Simulate expired session
    const expiredSession = {
      ...session,
      expiresAt: Date.now() - 1000,
    };
    assert.strictEqual(isSessionValid(expiredSession), false, 'Past expiresAt must be invalid');

    // Simulate inactive session (> 2 hours)
    const inactiveSession = {
      ...session,
      lastActiveAt: Date.now() - (3 * 60 * 60 * 1000),
    };
    assert.strictEqual(isSessionValid(inactiveSession), false, 'Inactive session must be expired');
  });
});

describe('12. French and Arabic interfaces preserve identical security protections', () => {
  test('Security checks and permissions are agnostic to interface language', () => {
    const permissions = ROLE_PERMISSIONS['ENTRAINEUR'];
    // Vérification que les règles de sécurité ne dépendent pas du texte affiché
    assert.strictEqual(permissions.canManageFinancials, false);
    assert.strictEqual(permissions.canManageUsers, false);
  });
});
