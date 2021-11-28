//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {
  Schema
} = mongoose;
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

//use bodyparser to get the data from the ejs files
app.use(bodyParser.urlencoded({
  extended: true
}));

//this will include css, or the static files
app.use(express.static("public"));

//insert mongoose to the projects so we will have dataBase
mongoose.connect("mongodb://localhost:27017/ArabotDB", {
  useNewUrlParser: true
});

//make a lesson schema
const lessonSchema = new Schema({
  //lesson name
  name: String,
  //lesson graph - json code
  graph: JSON
});

const Lesson = mongoose.model("Lesson", lessonSchema);

//lessons Schema is a list of lessons
const lessonsSchema = new Schema({
  lessons: [lessonSchema]
});

const Lessons = mongoose.model("Lessons", lessonsSchema);

// Use this as default Graph
const emptyGraphJSON = {
  "class": "GraphLinksModel",
  "nodeDataArray": [{
    "category": "Start",
    "text": "Start",
    "key": -1,
    "loc": "12.145828247070312 -164.2916669845581"
  }],
  "linkDataArray": []
}

//When loading the app
app.get("/", function(req, res) {
  Lesson.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Lesson.create({
        name: "Get Started",
        graph: emptyGraphJSON
      });
      res.redirect("/");
    } else {
      res.render("lessonsList", {
        lessons: foundItems,
      });
      // end of res.render
    }
  });
});

//Add new lesson with empty graph
app.post("/", function(req, res) {
  let newLessonTitle = req.body.newLessonName;
  let newLesson = new Lesson({
    name: newLessonTitle,
    graph: emptyGraphJSON
  });
  newLesson.save();
  res.redirect("/");
});

// Use this when we need to update data in dataBase
function updateLesson(filter, update) {
  Lesson.findOneAndUpdate(filter, update, {
    new: true
  }, function(err, found) {});
}

//The function will search the database to find the lesson with lessonId then it will update it's
app.post("/RenameLesson", function(req, res) {
  let filter = {
    _id: req.body.lessonId
  };
  let update = {
    name: req.body.NewTitle
  };
  updateLesson(filter, update);
  console.log("Successfully Update The Title");
  res.redirect("/");
});


//Find the lesson then delete it from the dataBase
app.post("/DeleteLesson", function(req, res) {
  let deleteLessonID = req.body.lessonToDelete;
  Lesson.findByIdAndRemove(deleteLessonID, function(err) {
    if (!err) {
      console.log("Successfully deleted Lesson.");
      res.redirect("/");
    }
  });
});

//update the GraphSchema.
app.post("/saveGraph", function(req, res) {
  const filter = {
    _id: req.body.lessonId
  };
  const update = {
    graph: req.body.newGraph
  };
  updateLesson(filter, update);
  console.log("Successfully Saved The New GraphSchema");
  //redirect to the graph page
  // TODO: fix this
  lessonID = req.body.lessonId;
  res.redirect("/:lessonID");
});

//restart the GraphSchema, clear the old one.
app.post("/ClearGraph", function(req, res) {
  const filter = {
    _id: req.body.lessonId
  };
  const update = {
    graph: emptyGraphJSON
  };
  updateLesson(filter, update);
  console.log("Successfully Cleared The GraphSchema");
  // TODO: fix this
  lessonID = req.body.lessonId;
  res.redirect("/:lessonID");
});

app.get("/:lessonID", function(req, res) {
  let lessonID = req.body.LessonID;
  Lesson.find(lessonID, function(err, foundItems) {
    if (!err) {
      res.render("Graph", {
        lesson: foundItems
      });
    } else {
      console.log("Lesson not found");
    }
  });
});

//our app list at port 3,000
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
