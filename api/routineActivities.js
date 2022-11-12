const express = require('express');
const { updateRoutineActivity, getRoutineActivityById, getRoutineById, destroyRoutineActivity } = require('../db');
const { requireUser } = require('./utils');
const routineActivitiesRouter = express.Router();


// PATCH /api/routine_activities/:routineActivityId
routineActivitiesRouter.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { count, duration } = req.body;
    const updateFields = {};

    if (count) {
        updateFields.count = count;
    }
    if (duration) {
        updateFields.duration = duration;
    }

    try {

        const originalRoutineActivity = await getRoutineActivityById(routineActivityId)

        const originalRoutine = await getRoutineById(originalRoutineActivity.routineId)
        if (originalRoutine.creatorId === req.user.id) {
            updateFields.id = routineActivityId
            const updatedRoutineActivity = await updateRoutineActivity(updateFields)

            res.send(updatedRoutineActivity)
        } else {
            res.status(403)
            next({
                error: 'UnauthorizedUser',
                name: 'UnauthorizedUserError',
                message: `User ${req.user.username} is not allowed to update ${originalRoutine.name}`
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message })
    }

})
// DELETE /api/routine_activities/:routineActivityId
routineActivitiesRouter.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;

    try {
        const originalRoutineActivity = await getRoutineActivityById(routineActivityId)

        const originalRoutine = await getRoutineById(originalRoutineActivity.routineId)
        if (originalRoutine.creatorId === req.user.id) {

            const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId)

            res.send(deletedRoutineActivity)
        } else {
            res.status(403)
            next({
                error: 'UnauthorizedUser',
                name: 'UnauthorizedUserError',
                message: `User ${req.user.username} is not allowed to delete ${originalRoutine.name}`
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message })
    }
})
module.exports = routineActivitiesRouter;