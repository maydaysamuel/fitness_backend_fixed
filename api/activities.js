const express = require('express');
const activitiesRouter = express.Router();
const {
  getAllActivities,
  getPublicRoutinesByActivity,
  getActivityByName,
  getActivityById,
  createActivity,
  updateActivity,
} = require('../db');
const { requireUser } = require('./utils');

// GET /api/activities/:activityId/routines
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {

  const { activityId } = req.params;

  try {
    const routines = await getPublicRoutinesByActivity({ id: activityId });

    if (routines.length) {
      res.send(routines)
    } else {

      next({
        error: "Error",
        name: 'UnauthorizedError',
        message: `Activity ${activityId} not found`
      })
    }

  } catch ({ name, message }) {

    next({ name, message })
  }
});

// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
  try {
    const allActivities = await getAllActivities();

    res.send(allActivities);
  } catch ({ description, id, name }) {
    next({ description, id, name });
  }

});
// POST /api/activities
activitiesRouter.post('/', requireUser, async (req, res, next) => {
  const { name, description } = req.body;

  try {
    const activitiy = await getActivityByName(name);

    if (activitiy) {

      res.send({
        error: "Error",
        message: `An activity with name ${name} already exists`,
        name: 'Activities ex',
      });
    }

    await createActivity({
      name,
      description,
    });

    res.send({
      message: "Successfully created an Activity",
      name,
      description
    });

  } catch ({ name, message }) {
    next({ name, message })
  }
});

// PATCH /api/activities/:activityId
activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;

  try {

    const activitiy = await getActivityByName(name);

    if (activitiy) {

      res.send({
        error: "Error",
        message: `An activity with name ${name} already exists`,
        name: 'Activities ex',
      });
    }
    const originalActivity = await getActivityById(activityId);

    if (originalActivity) {
      const updatedActivity = await updateActivity({ id: activityId, name, description });
      res.send(updatedActivity)
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: `Activity ${activityId} not found`,
        error: " Error can't edit "
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = activitiesRouter;
