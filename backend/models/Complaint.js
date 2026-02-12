const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['water', 'electricity', 'roads', 'sanitation', 'drainage', 'streetlight', 'other']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  citizenPhone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/
  },
  citizenName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['submitted', 'assigned', 'in-progress', 'resolved', 'rejected'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  assignedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  resolutionNotes: {
    type: String,
    trim: true
  },
  resolutionImages: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  estimatedResolutionTime: {
    type: Date
  },
  actualResolutionTime: {
    type: Number // in hours
  }
}, {
  timestamps: true
});

// Auto-generate complaint ID (pre-validate so it runs before required check)
complaintSchema.pre('validate', async function(next) {
  if (!this.complaintId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const number = (count + 1).toString().padStart(5, '0');
    this.complaintId = `CMP${year}${month}${number}`;
  }
  next();
});

// Calculate actual resolution time when resolved
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    if (this.createdAt) {
      const timeDiff = this.resolvedAt - this.createdAt;
      this.actualResolutionTime = Math.round(timeDiff / (1000 * 60 * 60)); // hours
    }
  }
  next();
});

// Indexes for faster queries
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ citizenPhone: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);