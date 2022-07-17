//jshint esversion:6
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const lodash = require('lodash');
import cors from 'cors';
import { Request, Response } from 'express';
import path from 'path';
const app = express();
require('dotenv').config();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) => {
  res.redirect('/Today');
});

app.set('views', path.join(__dirname, '../views'));

app.use(express.static('public'));
let year = new Date().getFullYear();

mongoose.connect(
  // `mongodb://localhost:27017/todoDB`
  process.env.MONGO_URL
);

interface itemSchemaInterface extends mongoose.Document {
  name: string;
}

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model<itemSchemaInterface>('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome to your todo_list!',
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.',
});

const item3 = new Item({
  name: '<-- Hit this to delete an item.',
});

const defaultItems = [item1, item2, item3];

interface listSchemaInterface extends mongoose.Document {
  name: string;
  items: itemSchemaInterface[];
}

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model<listSchemaInterface>('List', listSchema);

app.route('/ping').get((req: Request, res: Response) => {
  res.send('pong');
});

app.get('/Today', async (req: Request, res: Response) => {
  Item.find({}, (err: Error, foundItems: itemSchemaInterface[]) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log('Successfully saved default items to DB.');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', {
        listTitle: 'Today',
        newListItems: foundItems,
        year,
      });
    }
  });
});

app.get('/:customListName', (req: Request, res: Response) => {
  const customListName = lodash.capitalize(req.params.customListName);

  List.findOne(
    { name: customListName },
    function (err: Error, foundList: listSchemaInterface) {
      if (!err) {
        if (!foundList) {
          //Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect('/' + customListName);
        } else {
          //Show an existing list

          res.render('list', {
            listTitle: foundList.name,
            newListItems: foundList.items,
            year,
          });
        }
      }
    }
  );
});

app.post('/Today', (req: Request, res: Response) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  console.log(listName);

  if (listName === 'Today') {
    item.save();
    res.redirect('/Today');
  } else {
    List.findOne(
      { name: listName },
      (err: Error, foundList: listSchemaInterface) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/' + listName);
      }
    );
  }
});

app.post('/delete', (req: Request, res: Response) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, (err: Error) => {
      if (!err) {
        console.log('Successfully deleted checked item.');
        res.redirect('/Today');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err: Error, foundList: listSchemaInterface) => {
        if (!err) {
          res.redirect('/' + listName);
        }
      }
    );
  }
});

app.get('/about', (req, res) => {
  res.render('about');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server has started successfully');
});
