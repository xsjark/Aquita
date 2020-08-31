const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
	item: {
		type: String,
		required: true,
		trim: true,
	},
	product_id: {
		type: String,
		required: true,
		trim: true,
	},
	quantity: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) throw new Error("Negative quantities aren't real.");
		}
	},
	comments: {
		type: String,
		trim: true,
		lowercase: true
	},
	date: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true
});

SaleSchema.virtual('code', {
    ref: 'Item',
    localField: 'product_id',
    foreignField: '_id',
    justOne: true // set true for one-to-one relationship
})
const Sale = mongoose.model("Sale", SaleSchema);
module.exports = Sale;
