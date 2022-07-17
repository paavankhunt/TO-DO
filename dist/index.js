"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//jshint esversion:6
var serverless_http_1 = __importDefault(require("serverless-http"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var mongoose_1 = __importDefault(require("mongoose"));
var lodash = require('lodash');
var cors_1 = __importDefault(require("cors"));
var app = (0, express_1.default)();
require('dotenv').config();
var NODE_OPTIONS = '--unhandled-rejections';
app.set('view engine', 'ejs');
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static('public'));
var year = new Date().getFullYear();
mongoose_1.default.connect(
// `mongodb://localhost:27017/blogDB`,
process.env.MONGO_URL);
app.get('/', function (req, res) {
    res.send({ hello: 'world' });
    res.redirect('/todo');
});
var itemSchema = new mongoose_1.default.Schema({
    name: String,
});
var Item = mongoose_1.default.model('Item', itemSchema);
var item1 = new Item({
    name: 'Welcome to your todo_list!',
});
var item2 = new Item({
    name: 'Hit the + button to add a new item.',
});
var item3 = new Item({
    name: '<-- Hit this to delete an item.',
});
var defaultItems = [item1, item2, item3];
var listSchema = new mongoose_1.default.Schema({
    name: String,
    items: [itemSchema],
});
var List = mongoose_1.default.model('List', listSchema);
app.route('/ping').get(function (req, res) {
    res.send('pong');
});
app.get('/todo', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        Item.find({}, function (err, foundItems) {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log('Successfully saved default items to DB.');
                    }
                });
                res.redirect('/todo');
            }
            else {
                res.render('list', {
                    listTitle: 'Today',
                    newListItems: foundItems,
                    year: year,
                });
            }
        });
        return [2 /*return*/];
    });
}); });
app.get('/:customListName', function (req, res) {
    var customListName = lodash.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new list
                var list = new List({
                    name: customListName,
                    items: defaultItems,
                });
                list.save();
                res.redirect('/todo' + customListName);
            }
            else {
                //Show an existing list
                res.render('list', {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                    year: year,
                });
            }
        }
    });
});
app.post('/todo', function (req, res) {
    var itemName = req.body.newItem;
    var listName = req.body.list;
    var item = new Item({
        name: itemName,
    });
    if (listName === 'Today') {
        item.save();
        res.redirect('/todo');
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/todo' + listName);
        });
    }
});
app.post('/delete', function (req, res) {
    var checkedItemId = req.body.checkbox;
    var listName = req.body.listName;
    if (listName === 'Today') {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log('Successfully deleted checked item.');
                res.redirect('/todo');
            }
        });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect('/todo' + listName);
            }
        });
    }
});
app.get('/about', function (req, res) {
    res.render('about');
});
module.exports.handler = (0, serverless_http_1.default)(app);
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server has started successfully');
});
//# sourceMappingURL=index.js.map