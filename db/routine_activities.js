/* eslint-disable no-useless-catch */
const client = require('./client')

async function getRoutineActivityById(id){
  try {
    const { rows: [routineActivity] } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE id = $1;
    `, [id]);

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    INSERT INTO routine_activities("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *;
    `, [routineId, activityId, count, duration])

    return routineActivity;
  } catch (error) {
    throw error
  }
    
}

async function getRoutineActivitiesByRoutine({id}) {
  try {
    const { rows } = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"=${id};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity ({id, ...fields}) {
  const setString = Object.keys(fields)
  .map((key, index) => `"${key}"=$${index + 1}`)
  .join(', ')

  if (setString.length === 0) {
    return;
  }

  try {
    const { rows: [routineActivity] } = await client.query(`
    UPDATE routine_activities
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `, Object.values(fields));

    return routineActivity;
  } catch (error) {
    throw error
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    DELETE FROM routine_activities
    WHERE id = $1
    RETURNING *;
    `, [id])

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [routineActivity] } = await client.query(`
    SELECT *
    FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id AND routine_activities.id = ${routineActivityId}
    `);

    return routineActivity.creatorId === userId
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
