const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { title, description, status, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'pending',
      assignedTo,
      createdBy: req.user.id,
    });

    // Re-fetch to populate refs
    const populatedTask = await Task.findById(task._id);

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: populatedTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task.',
    });
  }
};

// @desc    Get all tasks (Admin: all, User: only assigned)
// @route   GET /api/tasks
// @access  Private
const getAllTasks = async (req, res) => {
  try {
    let query = {};

    // If user is not admin, only show their assigned tasks
    if (req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Tasks fetched successfully.',
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Get All Tasks Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks.',
    });
  }
};

// @desc    Get tasks assigned to logged in user
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: 'Your tasks fetched successfully.',
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    console.error('Get My Tasks Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your tasks.',
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Users can only update status of tasks assigned to them
    if (
      req.user.role !== 'admin' &&
      task.assignedTo._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update the status of tasks assigned to you.',
      });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id);

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update Task Status Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task status.',
    });
  }
};

// @desc    Update entire task (Admin only)
// @route   PUT /api/tasks/:id
// @access  Private/Admin
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();

    const updatedTask = await Task.findById(id);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update Task Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task.',
    });
  }
};

// @desc    Delete task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: { id },
    });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task.',
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
