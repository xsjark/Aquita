const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
	code: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) throw new Error("Negative codes aren't real.");
		},
		unique: true
	},
	as400_code: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) throw new Error("Negative codes aren't real.");
		},
	},
	name: {
		type: String,
		required: true,
		trim: true,
		lowercase: true
	},
	units: {
		type: String,
		trim: true,
		lowercase: true
	},
	quantity: {
		type: Number,
		default: 0,
		min: 0,
		validate(value) {
			if (value < 0) throw new Error("Negative quantities aren't real.");
		}
	},
	lot: {
		type: String,
		trim: true,
		lowercase: true
	},
	current_month: {
		type: Number,
		default: 1000,
	},
	expiration: {
		type: String,
	},
	description: {
		type: String,
		trim: true,
		lowercase: true
	},
}, {
	timestamps: true
});

ItemSchema.virtual('total_sales', {
    ref: 'Sale',
    localField: '_id',
    foreignField: 'product_id',
    justOne: false // set true for one-to-one relationship
})


const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
