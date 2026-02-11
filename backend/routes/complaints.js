const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route - track complaint by ID
router.get('/track/:id', complaintController.getComplaintById);

// Create complaint (citizens)
router.post('/', auth, upload.array('images', 5), complaintController.createComplaint);

// Get complaints (with role-based filtering)
router.get('/', auth, complaintController.getComplaints);

// Get complaint by ID (authenticated)
router.get('/:id', auth, complaintController.getComplaintById);

// Update complaint status (admin and technician)
router.patch('/:id/status', auth, authorize('admin', 'technician'), complaintController.updateComplaintStatus);

// Assign complaint (admin only)
router.post('/:id/assign', auth, authorize('admin'), complaintController.assignComplaint);

// Resolve complaint (technician)
router.post('/:id/resolve', auth, authorize('technician'), upload.array('resolutionImages', 5), complaintController.resolveComplaint);

// Add internal note (admin only)
router.post('/:id/notes', auth, authorize('admin'), complaintController.addInternalNote);

// Get statistics (admin only)
router.get('/stats/overview', auth, authorize('admin'), complaintController.getComplaintStats);

module.exports = router;