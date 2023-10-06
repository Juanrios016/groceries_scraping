import mongoose from'mongoose';

const productSchema = new mongoose.Schema({
    url: { type: String, requiered: true, unique: true },
    currency: { type: String, required: true}, 
    image: {type: String, requiered: true},
    title: {type: String, rquiered: true},
    currentPrice: { type: Number, reuquiered: true},
    originalPrice: { type:Number, requiered: true},
    priceHistory: [
        {
            price: { type: Number, require: true},
            date: {type: Date, default: Date.now}

        }
    ],
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discountRate: { type: Number },
    description: { type: String },
    category: { type: String },
    reviewsCount: { type: Number },
    isOutOfStock: {type: Boolean, default: false },
    users: [
        {email: {type: String, requiere: true}}
    ], default: [],
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;