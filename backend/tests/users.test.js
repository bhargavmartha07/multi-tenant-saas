// Ensure tests connect to the local docker database when running from host
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_NAME = process.env.DB_NAME || 'saas_db';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

const makeToken = (payload = {}) => {
  const secret = process.env.JWT_SECRET || 'testsecret';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

describe('Users API (integration)', () => {
  let superToken;
  let tenantId;
  let createdUserId;
  const unique = Date.now();

  beforeAll(() => {
    // Use seeded super admin id from seeds/seed_data.sql
    superToken = makeToken({ userId: '11111111-1111-1111-1111-111111111111', role: 'super_admin' });
  });

  test('create tenant (super_admin)', async () => {
    const res = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ name: `Test Tenant ${unique}`, subdomain: `test-${unique}` })
      .expect(201);

    expect(res.body.success).toBe(true);
    tenantId = res.body.data.id;
    expect(tenantId).toBeTruthy();
  });

  test('create user under tenant', async () => {
    const email = `u${unique}@example.com`;
    const payload = { email, password: 'Password123!', role: 'user', full_name: 'Test User', tenantId };
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${superToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    createdUserId = res.body.data.id;
  });

  test('list users for tenant', async () => {
    const res = await request(app)
      .get(`/api/tenants/${tenantId}/users`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    const found = res.body.data.find(u => u.id === createdUserId);
    expect(found).toBeTruthy();
  });

  test('update user', async () => {
    const res = await request(app)
      .put(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ full_name: 'Updated Name' })
      .expect(200);

    expect(res.body.data.full_name).toBe('Updated Name');
  });

  test('delete user (soft)', async () => {
    await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200);

    const res = await request(app)
      .get(`/api/tenants/${tenantId}/users`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200);

    const found = res.body.data.find(u => u.id === createdUserId);
    expect(found).toBeTruthy();
    expect(found.is_active).toBe(false);
  });

  test('enforce max_users on create', async () => {
    // set max_users = 1 for tenant
    await request(app)
      .put(`/api/tenants/${tenantId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ max_users: 1 })
      .expect(200);

    // creating another user should succeed because previous user was soft-deleted
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ email: `overflow${unique}@example.com`, password: 'Password123!', role: 'user', full_name: 'Overflow', tenantId })
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  afterAll(async () => {
    // close DB pool to allow Jest to exit cleanly
    const pool = require('../src/db/connection');
    try { await pool.end(); } catch (e) { /* ignore */ }
  });
});
