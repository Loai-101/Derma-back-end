const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters long'],
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    addressLine1: {
        type: String,
        required: [true, 'Address line 1 is required'],
        trim: true,
        maxlength: [100, 'Address line 1 cannot exceed 100 characters']
    },
    addressLine2: {
        type: String,
        trim: true,
        maxlength: [100, 'Address line 2 cannot exceed 100 characters']
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        maxlength: [50, 'State name cannot exceed 50 characters']
    },
    postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{5}(?:-[0-9]{4})?$/.test(v);
            },
            message: props => `${props.value} is not a valid postal code!`
        }
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        maxlength: [50, 'Country name cannot exceed 50 characters']
    },
    isDefault: {
        type: Boolean,
        default: false
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
shippingAddressSchema.index({ user: 1 });

const ShippingAddress = mongoose.model('ShippingAddress', shippingAddressSchema);

module.exports = ShippingAddress; 