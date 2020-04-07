const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
const date = require(__dirname + "/date.js");

var year = new Date().getFullYear();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

//model for items in the list
const itemschema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model('Item', itemschema);

const item1 = new Item({
  name: 'Welcome to your TodoList'
});

const item2 = Item({
  name: 'Hit + button to add new items'
});

const item3 = Item({
  name: '<-- Hit this to delete an item'
});

const defaultItems = [item1, item2, item3];

//model for customlist
const listSchema = {
  name: String,
  item: [itemschema]
};

const List = mongoose.model('List', listSchema);

app.get("/", function(req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('success');
        }
      });
      res.redirect('/');
    } else {
      res.render("list", {
        listTitle: 'Today',
        userInput: foundItems,
        year: year
      });
    }

  })

});


app.post("/", (req, res) => {
  const itemName = req.body.userinput;
  const listName = req.body.button;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      if(!err){
          foundList.item.push(item);
          foundList.save();
          res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (!err) {
        console.log("successfully deleted item");
        res.redirect("/");
      }
    })
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: { item: { _id: checkedItemId } } }, (err, foundItems) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", (req, res) => {
  res.render("about", {
    year: year
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, (err, foundItems) => {
    if (!err) {
      if (!foundItems) {
        const list = new List({
          name: customListName,
          item: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundItems.name,
          userInput: foundItems.item,
          year: year
        });
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
