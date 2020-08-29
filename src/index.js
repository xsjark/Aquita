import 'dotenv/config';
import cors from 'cors';
const mongoose = require('mongoose');
const express = require('express');
const itemRouter = require('./routes/itemRoutes.js');
const bodyParser = require('body-parser');
const itemModel = require('./models/item');
const saleModel = require('./models/sale');
const purchaseModel = require('./models/purchase');
var methodOverride = require('method-override')
var dotenv = require('dotenv');

dotenv.config();



const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(express.json()); // Make sure it comes back as json

app.use(express.static(__dirname + '../node_modules/bootstrap/dist'));

var url = process.env.DATABASE_URI;

mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	dbName: 'medical'
});

app.use(itemRouter);

app.listen(3000, () => {
	console.log('Server is running...')
});

// Consider moving!!

// Delete purchase and delete from items
app.get('/purchase/:itemid/:purchaseid/:quantity', async (req, res) => {
	const purchase = await purchaseModel.findByIdAndDelete(req.params.purchaseid)
	const quantity = await itemModel.findOneAndUpdate({
		_id: req.params.itemid
	}, {
		$inc: {
			quantity: -req.params.quantity
		}
	})
	try {
		await quantity.save()
		res.redirect('/purchases')
	} catch (err) {
		res.status(500).send(err)
	}
});

// Create new purchase and add to items
app.post('/purchase', async (req, res) => {
	const purchase = new purchaseModel({
		item: req.body.item.split(",")[1],
		product_id: req.body.item.split(",")[0],
		quantity: req.body.quantity,
		comments: req.body.comments
	});
	const subtract_from_inventory = await itemModel.findOneAndUpdate({
		_id: req.body.item.split(",")[0]
	}, {
		$inc: {
			quantity: req.body.quantity
		}
	})

	try {
		await purchase.save();
		res.redirect('/purchases');
	} catch (err) {
		res.status(500).send(err);
	}
});

// Renders purchase view and gets data for purchases table
app.get('/purchases', async (req, res) => {
	const purchases = await purchaseModel.find({});
	const items = await itemModel.find({});
	try {
		res.render('purchases.ejs', {
			purchases: purchases,
			items: items
		});
	} catch (err) {
		res.status(500).send(err);
	}
});

//Delete sale and add to items
app.get('/sale/:itemid/:saleid/:quantity', async (req, res) => {
	const sale = await saleModel.findByIdAndDelete(req.params.saleid)
	const quantity = await itemModel.findOneAndUpdate({
		_id: req.params.itemid
	}, {
		$inc: {
			quantity: +req.params.quantity
		}
	})
	try {
		await quantity.save()

		if (!sale) res.status(404).send("No sale found")
		res.redirect('/sales')
	} catch (err) {
		res.status(500).send(err)
	}

});

// Create sale and delete from items
app.post('/sale', async (req, res) => {
	const sale = new saleModel({
		item: req.body.item.split(",")[1],
		product_id: req.body.item.split(",")[0],
		quantity: req.body.quantity,
		comments: req.body.comments
	});
	const subtract_from_inventory = await itemModel.findOneAndUpdate({
		_id: req.body.item.split(",")[0]
	}, {
		$inc: {
			quantity: -req.body.quantity
		}
	})
	try {
		await sale.save();
		res.redirect('/sales');
	} catch (err) {
		res.status(500).send(err);
	}
});

//Render sales view and get sales data
app.get('/sales', async (req, res) => {
	const sales = await saleModel.find({});
	const items = await itemModel.find({});
	try {
		res.render('sales.ejs', {
			sales: sales,
			items: items
		});
	} catch (err) {
		res.status(500).send(err);
	}

});

// First day of the week (Monday)
function startOfWeek(date)
  {
    var diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  
    return new Date(date.setDate(diff));
 
  }

// Last day of the week (Sunday)
function endOfWeek(date)
  {
     
    var lastday = date.getDate() - (date.getDay() - 1) + 6;
    return new Date(date.setDate(lastday));
 
  }

// First day of the month
function startOfMonth(date)
  {
     
   return new Date(date.getFullYear(), date.getMonth(), 1);
 
  }

// Last day of the month
function endOfMonth(date)
  {
     
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
 
  }
// Render items view and get items data
app.get('/', async (req, res) => {
	
	const items = await itemModel.find({}).populate("total_sales").populate("total_purchases");

	var start_week = startOfWeek(new Date())
	var end_week = endOfWeek(new Date())
	var start_month = startOfMonth(new Date())
	var end_month = endOfMonth(new Date())
	
	var d = new Date(),
		hour = d.getHours(),
		min = d.getMinutes(),
		month = d.getMonth(),
		year = d.getFullYear(),
		sec = d.getSeconds(),
		day = d.getDate();
	
	const current_day = await saleModel.find({
		"createdAt": {
			$lt: new Date(),
			$gt: new Date(year,month,day,"00")
		}
	});
	
	const current_month = await saleModel.find({
		"createdAt": {
			$lt: new Date(),
			$gt: new Date("01/" + month + "/" + year + " " + hour + ":" + min)
		}
	});
	
	const current_year = await saleModel.find({
		"createdAt": {
			$lt: new Date(),
			$gt: new Date("01/01/" + year)
		}
	});
	try {
		console.log(end_month)
		res.render('index.ejs', {
			items: items,
			current_month: current_month.reduce(function (sum, d) {
				return sum + d.quantity;
			}, 0),
			current_year: current_year.reduce(function (sum, d) {
				return sum + d.quantity;
			}, 0),
			current_day: current_day.reduce(function (sum, d) {
				return sum + d.quantity;
			}, 0),
			start_week: start_week,
			end_week: end_week,
			start_month: start_month,
			end_month: end_month
		});
	} catch (err) {
		res.status(500).send(err);
	}
});

// Create new item
app.post('/item', async (req, res) => {
	const item = new itemModel({
		code: req.body.code,
		as400_code: req.body.as400_code,
		name: req.body.name,
		units: req.body.units,
		quantity: req.body.quantity,
		lot: req.body.lot,
		expiration: req.body.expiration,
		description: req.body.description,
	});
	try {
		await item.save();
		res.redirect('/');
	} catch (err) {
		res.status(500).send(err);
	}
});

// API get all items
app.get('/items', async (req, res) => {
	const items = await itemModel.find({});
	try {
		res.send(items);
	} catch (err) {
		res.status(500).send(err);
	}
});

// API delete item by ID
app.get('/item/:id', async (req, res) => {
	try {
		const item = await itemModel.findByIdAndDelete(req.params.id)

		if (!item) res.status(404).send("No item found")
		res.redirect('/')
	} catch (err) {
		res.status(500).send(err)
	}

});

// API update item by ID
app.put('/item/:id', async (req, res) => {
	const item = await itemModel.findByIdAndUpdate(req.params.id, req.body)
	try {
		await item.save()
		res.redirect('/')
	} catch (err) {
		res.status(500).send(err)
	}
})
