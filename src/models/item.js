const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
		unique: true
  },
  price: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) throw new Error("Negative prices aren't real.");
    }
  },
	quantity: {
			type: Number,
			default: 0,
			validate(value) {
				if (value < 0) throw new Error("Negative quantities aren't real.");
			}
	},
	  description: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true
  }
});

const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;