const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
		unique: true
  },  
	product_id: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
		unique: true
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
			lowercase: true,
			unique: true
  },
	 date: { 
		 type: Date, 
		 default: Date.now },
});

const Sale = mongoose.model("Sale", SaleSchema);
module.exports = Sale;