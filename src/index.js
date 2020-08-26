import 'dotenv/config';
import cors from 'cors';
const mongoose = require('mongoose');
const express = require('express');
const itemRouter = require('./routes/itemRoutes.js');
const bodyParser = require('body-parser');
const itemModel = require('./models/item');
const saleModel = require('./models/sale');
var methodOverride = require('method-override')
var dotenv = require('dotenv');

dotenv.config();



const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

app.set('views',__dirname + '/views' );
app.set('view engine', 'ejs');


app.use(express.json()); // Make sure it comes back as json

app.use(express.static(__dirname + '../node_modules/bootstrap/dist'));

var url = process.env.DATABASE_URI;

mongoose.connect(url, {
  useNewUrlParser: true,
	useUnifiedTopology: true
});

app.use(itemRouter);

app.listen(3000, () => { console.log('Server is running...') });

// Consider moving!!
app.get('/sale/:itemid/:saleid/:quantity', async (req, res) => {
	const sale = await saleModel.findByIdAndDelete(req.params.saleid)
	const quantity = await itemModel.findOneAndUpdate({_id: req.params.itemid}, {$inc : { quantity: + req.params.quantity} })
  try {
				await quantity.save()

    if (!sale) res.status(404).send("No sale found")
			res.redirect('/sales')
  } catch (err) {
    res.status(500).send(err)
  }

});

app.post('/sale', async (req, res) => {
  const item = new saleModel({
		item: req.body.item.split(",")[1],
		product_id: req.body.item.split(",")[0],
		quantity: req.body.quantity,
		comments: req.body.comments
	});
	const subtract_from_inventory = await itemModel.findOneAndUpdate({_id: req.body.item.split(",")[0]}, {$inc : { quantity: - req.body.quantity} })
	
  try {
    await item.save();
    res.redirect('/sales');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/sales', async (req, res) => {
	  const sales = await saleModel.find({});
	  const items = await itemModel.find({});


  try {
    res.render('sales.ejs', {sales: sales, items: items});
  } catch (err) {
    res.status(500).send(err);
  }
		
});

app.get('/', async (req, res) => {
	  const items = await itemModel.find({});

  try {
    res.render('index.ejs', {items: items});
  } catch (err) {
    res.status(500).send(err);
  }
		
});

app.post('/item', async (req, res) => {
  const item = new itemModel({
		name: req.body.name,
		price: req.body.price,
		quantity: req.body.quantity,
		description: req.body.description
	});

  try {
    await item.save();
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/items', async (req, res) => {
  const items = await itemModel.find({});

  try {
    res.send(items);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/item/:id', async (req, res) => {
  try {
    const item = await itemModel.findByIdAndDelete(req.params.id)

    if (!item) res.status(404).send("No item found")
			res.redirect('/')
  } catch (err) {
    res.status(500).send(err)
  }

});

app.put('/item/:id', async (req, res) => {
    const item = await itemModel.findByIdAndUpdate(req.params.id, req.body)

	try {
    await item.save()
		res.redirect('/')
  } catch (err) {
    res.status(500).send(err)
  }
})

