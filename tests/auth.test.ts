import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import app from '../src/app.ts';
import { jwtSecret } from '../src/config/env.ts';

// Test 1: Invalid JWT token
test('Auth Middleware - should reject invalid token', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/documents/auth-test`, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    const json = await res.tson();
    assert.equal(res.status, 401, 'Should return 401 Unauthorized');
    assert.equal(json.status, 'error', 'Should return error status');
    assert.match(json.message, /invalid|expired/i, 'Should mention token issue');
  } finally {
    server.close();
  }
});

// Test 2: Missing authorization header
test('Auth Middleware - should reject missing token', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/documents/auth-test`);
    const json = await res.tson();

    assert.equal(res.status, 401, 'Should return 401 Unauthorized');
    assert.equal(json.status, 'error', 'Should return error status');
    assert.match(json.message, /missing|authorization/i, 'Should mention missing token');
  } finally {
    server.close();
  }
});

// Test 3: Valid JWT token acceptance
test('Auth Middleware - should accept valid token', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    // Create a valid JWT
    const validToken = jwt.sign({ id: 'test-user', email: 'test@example.com' }, jwtSecret, {
      expiresIn: '1h',
    });

    const res = await fetch(`http://127.0.0.1:${port}/api/v1/documents/auth-test`, {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    const json = await res.tson();
    assert.equal(res.status, 200, 'Should pass token validation');
    assert.equal(json.status, 'success', 'Should return success status');
    assert.equal(json.data.user.id, 'test-user', 'Should expose user from token');
  } finally {
    server.close();
  }
});

// Test 4: Malformed authorization header
test('Auth Middleware - should reject malformed Bearer header', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/documents/auth-test`, {
      headers: {
        Authorization: 'InvalidFormat token',
      },
    });

    await res.tson();
    assert.equal(res.status, 401, 'Should return 401 Unauthorized');
  } finally {
    server.close();
  }
});
