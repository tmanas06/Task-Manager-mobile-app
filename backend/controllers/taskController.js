const { validationResult } = require('express-validator');
const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    if (!req.orgId) {
      return res.status(400).json({
        success: false,
        message: 'A workspace must be active to create tasks.',
      });
    }

    // Role-based restrict (Admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only administrators can create tasks.',
      });
    }

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
      organizationId: req.orgId,
      createdBy: req.user.id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: populatedTask,
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getAllTasks = async (req, res) => {
  try {
    if (!req.orgId) {
      return res.status(400).json({
        success: false,
        message: 'A workspace must be active to view tasks.',
      });
    }

    // Build filter based on role
    // Admin sees everything in org, User views only assigned tasks
    const filter = { organizationId: req.orgId };
    if (req.user.role === 'user') {
      filter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get tasks assigned to logged in user
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    if (!req.orgId) {
      return res.status(400).json({
        success: false,
        message: 'A workspace must be active to view tasks.',
      });
    }

    const tasks = await Task.find({ 
      assignedTo: req.user.id,
      organizationId: req.orgId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({ _id: id, organizationId: req.orgId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in this workspace.',
      });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update entire task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.findOne({ _id: id, organizationId: req.orgId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in this workspace.',
      });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Task.deleteOne({ _id: id, organizationId: req.orgId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in this workspace.',
      });
    }

    res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
