const express = require('express');
const routinesRouter = express.Router();
const { getAllPublicRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutine, addActivityToRoutine } = require('../db');
const { requireUser } = require('./utils');

// GET /api/routines
routinesRouter.get('/', async (req, res, next) => {
  try {
    const allRoutines = await getAllPublicRoutines();

    res.send(
      allRoutines
    );
  } catch ({ description, id, name }) {
    next({ description, id, name });
  }

});

// POST /api/routines
routinesRouter.post('/', requireUser, async (req, res, next) => {
  const { name, goal, isPublic, } = req.body;

  try {
    const routine = await createRoutine({
      name,
      goal,
      isPublic,
      creatorId: req.user.id
    });

    res.send(
      routine
    );


  } catch ({ name, message }) {
    next({ name, message })
  }
});
// PATCH /api/routines/:routineId
routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
  const { routineId } = req.params;
  const { isPublic, name, goal } = req.body;
  try {

    const routine = await getRoutineById(routineId);

    if (routine.creatorId === req.user.id) {
      const updatedRoutine = await updateRoutine({
        id: routineId,
        name,
        goal,
        isPublic,
      }
      );
      res.send(updatedRoutine)
    } else {
      res.status(403)
      next({
        name: 'UnauthorizedUserError',
        message: `User ${req.user.username} is not allowed to update ${routine.name}`,
        error: " Error can't edit "
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// DELETE /api/routines/:routineId
routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
  const { routineId } = req.params;

  try {

    const deleteRoutine = await getRoutineById(routineId);


    if (deleteRoutine.creatorId === req.user.id) {
      const deletedRoutine = await destroyRoutine(routineId)

      res.send(deletedRoutine[0])
    } else {

      res.status(403)
      next({
        name: 'UnauthorizedUserError',
        message: `User ${req.user.username} is not allowed to delete ${deleteRoutine.name}`,
        error: " Error can't edit "
      })
    }

  } catch ({ name, message }) {
    next({ name, message });
  }

})
// POST /api/routines/:routineId/activities
routinesRouter.post('/:routineId/activities', requireUser, async (req, res, next) => {
  const { routineId } = req.params

  const { activityId, count, duration } = req.body

  try {

    const routine = await getRoutineById(routineId);

    if (routine.creatorId === req.user.id) {
      const updatedActivity = await addActivityToRoutine({
        routineId,
        activityId,
        count,
        duration,
      }
      );
      res.send(updatedActivity)
    } else {
      res.status(403)
      next({
        error: " Error can't edit ",
        message: `Activity ${activityId} already exists in Routine ${routineId}`,
        name: 'UnauthorizedUserError',
      })
    }
  } catch ({ name, message }) {
    next({
      error: " Error can't edit ",
      message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`,
      name: 'DuplicateActivityError',
    })
  }
});
module.exports = routinesRouter;
