const Complaint = require('../models/Complaint');
const Technician = require('../models/Technician');

// Create new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { category, description, location, citizenPhone, citizenName, priority } = req.body;

    // Validate required fields
    if (!category || !description || !location || !citizenPhone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    // Create complaint
    const complaint = new Complaint({
      category,
      description,
      images,
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: location.address
      },
      citizenPhone,
      citizenName,
      priority: priority || 'medium',
      statusHistory: [{
        status: 'submitted',
        changedBy: req.userId
      }]
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      complaint,
      message: `Complaint registered successfully. Your complaint ID is ${complaint.complaintId}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all complaints with filters
exports.getComplaints = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      startDate, 
      endDate, 
      assignedTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // For citizens, only show their complaints
    if (req.user.role === 'citizen') {
      filter.citizenPhone = req.user.phone;
    }

    // For technicians, show assigned complaints
    if (req.user.role === 'technician') {
      const technician = await Technician.findOne({ userId: req.userId });
      if (technician) {
        filter.assignedTo = technician._id;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name phone specialization')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      complaints,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOne({
      $or: [{ _id: id }, { complaintId: id }]
    })
      .populate('assignedTo', 'name phone specialization rating')
      .populate('internalNotes.addedBy', 'name role')
      .populate('statusHistory.changedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check access permissions
    if (req.user.role === 'citizen' && complaint.citizenPhone !== req.user.phone) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Update status
    complaint.status = status;
    
    // Add to status history
    complaint.statusHistory.push({
      status,
      changedBy: req.userId
    });

    // Add notes if provided
    if (notes) {
      complaint.internalNotes.push({
        note: notes,
        addedBy: req.userId
      });
    }

    // If marking as resolved, set resolved date
    if (status === 'resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Update technician stats if resolved
    if (status === 'resolved' && complaint.assignedTo) {
      const technician = await Technician.findById(complaint.assignedTo);
      if (technician) {
        technician.activeComplaints = Math.max(0, technician.activeComplaints - 1);
        if (complaint.actualResolutionTime) {
          technician.updateAvgResolutionTime(complaint.actualResolutionTime);
        }
        await technician.save();
      }
    }

    res.json({
      success: true,
      complaint,
      message: 'Complaint status updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Assign complaint to technician
exports.assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId, estimatedResolutionTime, priority } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const technician = await Technician.findById(technicianId);

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Check if technician specialization matches
    if (!technician.specialization.includes(complaint.category)) {
      return res.status(400).json({ 
        error: `Technician specialization (${technician.specialization.join(', ')}) does not match complaint category (${complaint.category})` 
      });
    }

    complaint.assignedTo = technicianId;
    complaint.assignedAt = new Date();
    complaint.status = 'assigned';
    
    if (estimatedResolutionTime) {
      complaint.estimatedResolutionTime = new Date(estimatedResolutionTime);
    }
    
    if (priority) {
      complaint.priority = priority;
    }

    complaint.statusHistory.push({
      status: 'assigned',
      changedBy: req.userId
    });

    await complaint.save();

    // Update technician active complaints
    technician.activeComplaints += 1;
    await technician.save();

    res.json({
      success: true,
      complaint,
      message: 'Complaint assigned successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add resolution (by technician)
exports.resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Process resolution images
    const resolutionImages = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    complaint.status = 'resolved';
    complaint.resolvedAt = new Date();
    complaint.resolutionNotes = resolutionNotes;
    complaint.resolutionImages = resolutionImages;

    complaint.statusHistory.push({
      status: 'resolved',
      changedBy: req.userId
    });

    await complaint.save();

    // Update technician stats
    if (complaint.assignedTo) {
      const technician = await Technician.findById(complaint.assignedTo);
      if (technician) {
        technician.activeComplaints = Math.max(0, technician.activeComplaints - 1);
        if (complaint.actualResolutionTime) {
          technician.updateAvgResolutionTime(complaint.actualResolutionTime);
        }
        await technician.save();
      }
    }

    res.json({
      success: true,
      complaint,
      message: 'Complaint resolved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add internal note
exports.addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    complaint.internalNotes.push({
      note,
      addedBy: req.userId
    });

    await complaint.save();

    res.json({
      success: true,
      complaint,
      message: 'Note added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get complaint statistics
exports.getComplaintStats = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (category) filter.category = category;

    const stats = await Complaint.aggregate([
      { $match: filter },
      {
        $facet: {
          statusCount: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          categoryCount: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          priorityCount: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          avgResolutionTime: [
            { $match: { status: 'resolved', actualResolutionTime: { $exists: true } } },
            { $group: { _id: null, avg: { $avg: '$actualResolutionTime' } } }
          ],
          totalComplaints: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};