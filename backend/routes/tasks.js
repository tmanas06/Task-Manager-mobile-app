const express = require('express');
const { body } = require('express-validator');
const { protect: verifyToken } = require('../middleware/auth');
const requireRole = require('../middleware/role');
const {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(verifyToken);

// @route   GET /api/tasks
// @desc    Get all tasks (admin: all, user: only assigned)
router.get('/', getAllTasks);

// @route   GET /api/tasks/my
// @desc    Get tasks assigned to current user
router.get('/my', getMyTasks);

// @route   POST /api/tasks
// @desc    Create a new task
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required.')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters.'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage('Status must be pending, in-progress, or completed.'),
    body('assignedTo')
      .notEmpty()
      .withMessage('assignedTo user ID is required.')
      .isMongoId()
      .withMessage('assignedTo must be a valid user ID.'),
  ],
  createTask
);

// @route   PATCH /api/tasks/:id/status
// @desc    Update task status (user: own tasks, admin: any task)
router.patch(
  '/:id/status',
  [
    body('status')
      .notEmpty()
      .withMessage('Status is required.')
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage('Status must be pending, in-progress, or completed.'),
  ],
  updateTaskStatus
);

// @route   PUT /api/tasks/:id
// @desc    Update full task
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters.'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed'])
      .withMessage('Status must be pending, in-progress, or completed.'),
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('assignedTo must be a valid user ID.'),
  ],
  updateTask
);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
router.delete('/:id', deleteTask);

module.exports = router;
