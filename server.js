const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
var bodyParser = require("body-parser")
const mongodb = require("mongodb")
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  serverSelectionTimeoutMS: 3000 // Timeout: 3s
}
  );

const Schema = mongoose.Schema;

const excerciseSchema = new Schema({ 
description: String, 
duration: Number, 
date: Date
})

const userSchema = new Schema({ 
username: String,
log: [excerciseSchema]

})

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", excerciseSchema);


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

app.post("/api/users", (req, res)=>{ 
  let username = req.body.username;
  res.json({users: username})
})

app.post("/api/users/:_id/exercises", function(res, req){ 
const {id} = req.param;

res.json({"_id": id})


})

app.get("/api/users", (req, res)=>{ 
  usersnames = req.query;
  id = req.body._id;
  lists = [usersnames, id];
  res.json({users: lists})
})







const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
