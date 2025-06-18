const mongoose = require('mongoose');

const shippingOrderSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShippingAddress',
        required: [true, 'Shipping address is required']
    },
    shippingMethod: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShippingMethod',
        required: [true, 'Shipping method is required']
    },
    trackingNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: [
            'pending',
            'processing',
            'shipped',
            'in_transit',
            'delivered',
            'failed',
            'returned'
        ],
        default: 'pending'
    },
    statusHistory: [{
        status: {
            type: String,
            enum: [
                'pending',
                'processing',
                'shipped',
                'in_transit',
                'delivered',
                'failed',
                'returned'
            ]
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    packageDetails: {
        weight: {
            type: Number,
            required: [true, 'Package weight is required'],
            min: [0, 'Weight cannot be negative']
        },
        dimensions: {
            length: {
                type: Number,
                required: [true, 'Length is required'],
                min: [0, 'Length cannot be negative']
            },
            width: {
                type: Number,
                required: [true, 'Width is required'],
                min: [0, 'Width cannot be negative']
            },
            height: {
                type: Number,
                required: [true, 'Height is required'],
                min: [0, 'Height cannot be negative']
            }
        }
    },
    shippingCost: {
        type: Number,
        required: [true, 'Shipping cost is required'],
        min: [0, 'Shipping cost cannot be negative']
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
shippingOrderSchema.index({ order: 1 });
shippingOrderSchema.index({ user: 1 });
shippingOrderSchema.index({ trackingNumber: 1 });
shippingOrderSchema.index({ status: 1 });

// Method to update shipping status
shippingOrderSchema.methods.updateStatus = function(newStatus, note = '') {
    this.status = newStatus;
    this.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note
    });
    return this.save();
};

// Method to calculate estimated delivery date
shippingOrderSchema.methods.calculateEstimatedDeliveryDate = async function() {
    const shippingMethod = await this.populate('shippingMethod');
    const minDays = shippingMethod.estimatedDays.min;
    const maxDays = shippingMethod.estimatedDays.max;
    
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    
    this.estimatedDeliveryDate = maxDate;
    return this.save();
};

const ShippingOrder = mongoose.model('ShippingOrder', shippingOrderSchema);

module.exports = ShippingOrder; 