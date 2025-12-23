const pool = require("../db/connection");

exports.getMe = async (req, res) => {
  const { userId, tenantId, role } = req.user;

  try {
    const userResult = await pool.query(
      `SELECT id, email, full_name, role, is_active
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let tenant = null;

    if (tenantId) {
      const tenantResult = await pool.query(
        `SELECT id, name, subdomain, subscription_plan, max_users, max_projects
         FROM tenants
         WHERE id = $1`,
        [tenantId]
      );
      tenant = tenantResult.rows[0];
    }

    return res.status(200).json({
      success: true,
      data: {
        ...userResult.rows[0],
        tenant
      }
    });

  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
