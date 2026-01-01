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

describe('Tasks API', () => {
  const tenantId = '22222222-2222-2222-2222-222222222222';
  const projectId = '66666666-6666-6666-6666-666666666666'; // Project Alpha

  const userToken = makeToken({ userId: '44444444-4444-4444-4444-444444444444', role: 'user', tenantId });
  const adminToken = makeToken({ userId: '33333333-3333-3333-3333-333333333333', role: 'tenant_admin', tenantId });
  const superToken = makeToken({ userId: '11111111-1111-1111-1111-111111111111', role: 'super_admin' });

  let createdTaskId;

  test('user can create task with assignee, priority and dueDate', async () => {
    const payload = {
      title: 'Task With Assignee',
      description: 'Assign to Demo User 2',
      assignedTo: '55555555-5555-5555-5555-555555555555',
      priority: 'low',
      dueDate: '2030-01-01'
    };

    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.assigned_to).toBe(payload.assignedTo);
    expect(res.body.data.assigned_to_name).toBe('Demo User 2');
    expect(res.body.data.priority).toBe(payload.priority);
    expect(res.body.data.due_date).toBeTruthy();

    createdTaskId = res.body.data.id;
  });

  test('list tasks supports filters and pagination', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}/tasks?priority=high&page=1&limit=2`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(2);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('tenant admin can delete a task', async () => {
    // create a task as admin
    const createRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'To be deleted' })
      .expect(201);

    const tid = createRes.body.data.id;

    await request(app)
      .delete(`/api/tasks/${tid}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // verify delete
    const listRes = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const found = listRes.body.data.find(t => t.id === tid);
    expect(found).toBeUndefined();
  });

  test('creating task with invalid assignee fails', async () => {
    // use an assignee from another tenant or non-existent id
    const res = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Bad Assignee', assignedTo: '11111111-1111-1111-1111-111111111111' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  afterAll(async () => {
    const pool = require('../src/db/connection');
    try { await pool.end(); } catch (e) {}
  });
});