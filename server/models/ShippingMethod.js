const mongoose = require('mongoose');

const shippingMethodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shipping method name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Shipping method name cannot exceed 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative']
    },
    pricePerKg: {
        type: Number,
        required: [true, 'Price per kg is required'],
        min: [0, 'Price per kg cannot be negative']
    },
    estimatedDays: {
        min: {
            type: Number,
            required: [true, 'Minimum estimated days is required'],
            min: [1, 'Minimum days must be at least 1']
        },
        max: {
            type: Number,
            required: [true, 'Maximum estimated days is required'],
            min: [1, 'Maximum days must be at least 1']
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    restrictions: {
        maxWeight: {
            type: Number,
            required: [true, 'Maximum weight is required'],
            min: [0, 'Maximum weight cannot be negative']
        },
        maxDimensions: {
            length: {
                type: Number,
                required: [true, 'Maximum length is required'],
                min: [0, 'Length cannot be negative']
            },
            width: {
                type: Number,
                required: [true, 'Maximum width is required'],
                min: [0, 'Width cannot be negative']
            },
            height: {
                type: Number,
                required: [true, 'Maximum height is required'],
                min: [0, 'Height cannot be negative']
            }
        },
        restrictedCountries: [{
            type: String,
            trim: true
        }]
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

// Index for faster queries
shippingMethodSchema.index({ name: 1 });
shippingMethodSchema.index({ isActive: 1 });

// Method to calculate shipping cost
shippingMethodSchema.methods.calculateShippingCost = function(weight) {
    if (weight > this.restrictions.maxWeight) {
        throw new Error('Package weight exceeds maximum allowed weight');
    }
    return this.basePrice + (weight * this.pricePerKg);
};

const ShippingMethod = mongoose.model('ShippingMethod', shippingMethodSchema);

module.exports = ShippingMethod; 