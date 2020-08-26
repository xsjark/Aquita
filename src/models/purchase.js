const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },  
	product_id: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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
		 default: Date.now },
});

const Purchase = mongoose.model("Purchase", PurchaseSchema);
module.exports = Purchase;