const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser")
const mongodb = require("mongodb")
const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  serverSelectionTimeoutMS: 3000 // Timeout: 3s
}
  );

const connection = mongoose.connection;
connection.on(
	'error',
	console.error.bind(console, 'MongoDB connection error:')
);
connection.once('open', () => {
	console.log('MongoDB connection established');
});

const Schema = mongoose.Schema;

const excerciseSchema = new Schema({ 
description: {type: String, required:true}, 
duration: {type: Number, required:true}, 
date: {type:Date, default: Date.now}
});

const userSchema = new Schema({ 
username: {type:String, required:true},
log: [excerciseSchema]

})


const Exercise = mongoose.model("Exercise", excerciseSchema);
const User = mongoose.model("User", userSchema);



app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html');
});

app.post("/api/users", async function(req, res){ 
  let userName = req.body.username;
  let findOne = await User.findOne({username:userName})

  if(findOne){ res.json({_id:findOne._id, username: findOne.username+"- user already exits"})

delete findOne.__v} else{ 
findOne = new User({ 
  username: userName
});
await findOne.save();
res.json({_id: findOne._id, username:findOne.username+" - new user created"})

console.log(findOne)
delete findOne.__v
}

});


app.get("/api/users", (req, res)=>{ 
  

  User.find({}, (err, arrayOfUsers)=>{
    if(!err){ 
      res.json(arrayOfUsers)
    }
  });
  
});

app.param('_id', function(req, res, next) {
	req.body._id = req.params._id;
	next();
});

app.post("/api/users/:_id/exercises", async function(req, res){ 
const resObj = {};
let id = req.body._id;

if(id.length == 24){
  var findOne = await User.findOne({_id: ObjectId(id)});
} else{ resObj["error"] = "no user with id:"+ id;
return res.json(resObj);
console.log(resObj);
}

let new_exercise = new Exercise({ 
  description: req.body.description,
  duration: parseInt(req.body.duration),
  date: new Date(req.body.date)
});

if(!findOne){resObj["error"] = "no user with id"+ id
res.json(resObj)
console.log(resObj)
            
    }
  
  else{User.findByIdAndUpdate(id, 
  {$push: {log: new_exercise}},
  {new: true}, (err, updatedUser)=>{ 
    resObj["_id"] = id
    resObj["username"] =updatedUser.username
    resObj["description"] = new_exercise.description
    resObj["duration"] = new_exercise.duration
    resObj["date"] = new Date(new_exercise.date).toDateString()
    res.json(resObj)
    console.log(resObj)
  }  );}

});

app.get("/api/users/:_id/logs", async function(req, res){ 
const resObj = {};
let id = req.body._id;

if(id.length ==24){ 
  var findOne =  await User.findOne({_id: ObjectId(id)});
}else{resObj["error"] ="no user with id: "+ id; 
return res.json(resObj);
console.log(resObj);}

if(!findOne){ 
resObj["error"] = "no user with id: "+id;
res.json(resObj);
console.log(resObj);

}else {
  resObj["_id"] =id;
  resObj["username"] = findOne.username;
  resObj["count"] = findOne.log.length;
  resObj["log"] = findOne.log.map(obj=>({description: obj.description,
  duration:obj.duration,
date:obj.date.toDateString()}))


if(req.query.from || req.query.to){ 
  let fromDate = new Date(0).getTime();
  let toDate = new Date().getTime();

  if(req.query.from){fromDate = new Date(req.query.from).getTime();}
  if(req.query.to){toDate =new Date(req.query.to).getTime();}

  resObj.log = resObj.log.filter(exercise=>{let exerciseDate = new Date(exercise.date).getTime();
  return exerciseDate >= fromDate && exerciseDate <= toDate;
console.log(exerciseDate);});
}

if (req.query.limit) {
			resObj.log = resObj.log.slice(0, req.query.limit);
		}
resObj["count"]= resObj.log.length;

res.json(resObj);
console.log(resObj);}


})









const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
