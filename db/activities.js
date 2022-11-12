const client = require("./client")

// database functions
async function getAllActivities() {
  const { rows } = await client.query(`
      SELECT id, name, description 
      FROM activities;
    `);

  return rows;
}

async function getActivityById(id) {
  const { rows: [activity] } = await client.query(`
  SELECT *
  FROM activities
  WHERE id=$1;
  `, [id])
  return activity;

}

async function getActivityByName(name) {
  const { rows: [user] } = await client.query(`
      SELECT *
      FROM activities
      WHERE name=$1;
      `, [name]);

  return user;
}

// return the new activity
async function createActivity({ name, description }) {
  const { rows: [activity] } = await client.query(`
  INSERT INTO activities(name, description) 
  VALUES($1, $2) 
  RETURNING *;
`, [name, description]);

  return activity;
}

// select and return an array of all activities
async function attachActivitiesToRoutines(routines) {

  await Promise.all(routines.map(async (routine) => {
    const { rows: activities } = await client.query(`
    SELECT DISTINCT activities.*, ra.duration, ra.count, ra."routineId", ra.id AS "routineActivityId"
    FROM activities
    JOIN routine_activities as ra
    ON ra."activityId"=activities.id
    WHERE ra."routineId"=$1;
    `, [routine.id])
    routine.activities = activities
  }))

  return routines;

}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}"=$${index + 1}`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }
  const { rows: [user] } = await client.query(`
  UPDATE activities
  SET ${setString}
  WHERE id=${id}
  RETURNING *;
`, Object.values(fields));

  return user;
}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}