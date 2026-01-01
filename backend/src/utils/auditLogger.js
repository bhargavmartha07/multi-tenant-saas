const pool = require("../db/connection");

module.exports = async ({ tenantId, userId, action, entityType, entityId, ip }) => {
  await pool.query(
    `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id, ip_address)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
    [tenantId, userId, action, entityType, entityId, ip]
  );
};
