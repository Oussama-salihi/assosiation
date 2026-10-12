import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  firebaseAuthService,
  signInWithEmailAndPassword,
  auth,
  signOut,
} from '../src/services/firebaseAuth';
import { INITIAL_USERS, INITIAL_PARENTS, INITIAL_PLAYERS } from '../src/data/seedData';

describe('Parent Portal Authentication & Redirection Verification', () => {
  test('Parent account exists in seed users and matches parent record par-1', () => {
    const parentUser = INITIAL_USERS.find((u) => u.email === 'parent@asatlasfoot.ma');
    assert.ok(parentUser, 'Parent user account must exist');
    assert.strictEqual(parentUser.role, 'PARENT', 'Role must be PARENT');
    assert.strictEqual(parentUser.parentId, 'par-1', 'Parent ID must be par-1');

    const parentProfile = INITIAL_PARENTS.find((p) => p.id === parentUser.parentId);
    assert.ok(parentProfile, 'Parent record par-1 must exist');
    assert.strictEqual(parentProfile.firstName, 'Mohamed');
    assert.strictEqual(parentProfile.lastName, 'Amrani');

    const linkedChildren = INITIAL_PLAYERS.filter((p) => p.parentId === parentProfile.id);
    assert.ok(linkedChildren.length > 0, 'Parent must have linked children');
  });

  test('signInWithEmailAndPassword succeeds with parent@asatlasfoot.ma and Atlas2026!', async () => {
    const result = await signInWithEmailAndPassword(auth, 'parent@asatlasfoot.ma', 'Atlas2026!');
    assert.ok(result.user, 'Login must return authenticated user');
    assert.strictEqual(result.user.role, 'PARENT');
    assert.strictEqual(result.user.parentId, 'par-1');
    assert.strictEqual(result.user.email, 'parent@asatlasfoot.ma');
    await signOut(auth);
  });

  test('signInWithEmailAndPassword succeeds with parent contact email m.amrani@gmail.com', async () => {
    const result = await signInWithEmailAndPassword(auth, 'm.amrani@gmail.com', 'Atlas2026!');
    assert.ok(result.user, 'Login with contact email must resolve parent user');
    assert.strictEqual(result.user.role, 'PARENT');
    assert.strictEqual(result.user.parentId, 'par-1');
    await signOut(auth);
  });

  test('Authentication fails with invalid password and throws clear error', async () => {
    await assert.rejects(
      async () => {
        await signInWithEmailAndPassword(auth, 'parent@asatlasfoot.ma', 'WrongPassword123!');
      },
      (err: Error) => {
        assert.ok(err.message.includes('Mot de passe incorrect') || err.message.includes('incorrect'));
        return true;
      }
    );
  });

  test('Staff and direction credentials remain working with role-based routing', async () => {
    const adminResult = await signInWithEmailAndPassword(auth, 'direction@asatlasfoot.ma', 'Atlas2026!');
    assert.strictEqual(adminResult.user.role, 'SUPER_ADMIN');
    await signOut(auth);

    const coachResult = await signInWithEmailAndPassword(auth, 'rachid.coach@asatlasfoot.ma', 'Atlas2026!');
    assert.strictEqual(coachResult.user.role, 'ENTRAINEUR');
    await signOut(auth);
  });
});
