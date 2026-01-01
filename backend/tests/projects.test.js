// Ensure DB uses local docker instance
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

describe('Projects delete API', () => {
  let superToken;
  const tenantId = '22222222-2222-2222-2222-222222222222'; // seeded demo tenant
  let projectId;
  let taskId;

  beforeAll(() => {
    superToken = makeToken({ userId: '11111111-1111-1111-1111-111111111111', role: 'super_admin' });
  });

  test('create project under tenant', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${superToken}`)
      .send({ name: 'DeleteTestProject', description: 'Will be deleted', tenantId })
      .expect(201);

    expect(res.body.success).toBe(true);
    projectId = res.body.data.id;
  });

  test('create active task in project', async () => {
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ title: 'Active Task' })
      .expect(201);

    expect(res.body.success).toBe(true);
    taskId = res.body.data.id;
  });

  test('delete project should fail when active tasks exist', async () => {
    await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(400);
  });

  test('archive project with force', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}?force=true`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('archived');
  });

  test('project remains archived', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${superToken}`)
      .expect(200);

    expect(res.body.data.status).toBe('archived');
  });

  afterAll(async () => {
    const pool = require('../src/db/connection');
    try { await pool.end(); } catch (e) {}
  });
});