const express = require("express");
const requests = express();

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { model, Schema, Types } = require("mongoose");

function handleError (err) {
    alert(err.message);
}

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true
});

requests.use(
  bodyParser.urlencoded({
    extended: false
  })
);
requests.use(bodyParser.json({}));

requests.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PATCH, DELETE"
    );

    return res.status(200).json({});
  }

  next();
});

requests.use(express.static(__dirname + 'public'))

const GameResultModel = model(
  "GameResult",
  Schema({
    _id: mongoose.Schema.Types.ObjectId,
    player_name: String,
    score: Number
  })
);

requests.post("/api/results", function(req, res, next) {
  const gameResult = new GameResultModel({
    _id: new Types.ObjectId(),
    player_name: req.body.name,
    score: req.body.score
  });

  gameResult.save(function(err, result) {
    if (err) {
      return res.status(500).json({ reason: err });
    }

    res.status(201).json({
      message: "Game result successfully saved!",
      result: gameResult
    });
  });
});

requests.get("/", function(req, res, next) {
  res.status(200).sendFile(__dirname + "/public/index.html");
});

requests.get("/api/results", function(req, res, next) {
  GameResultModel.find({}, function(err, result) {
    if (err) {
      return res.status(500).json({ reason: err });
    }

    let players = []

    for(let i=0; i<result.length; i++) {
      players.push({'name' : result[i]["player_name"], 'score' : result[i]["score"]});
    }

    players.sort(function compare(a, b) {
      if (a["score"] < b["score"]) {
        return 1;
      }
      if (a["score"] > b["score"]) {
        return -1;
      }
      return 0;
    });

    res.status(200).send(players);
  });
});

requests.get("/api/results/:id_user", function(req, res, next) {
  GameResultModel.find({ id_user: req.body.id_user }, function(err, result) {
    if (err) {
      return res.status(500).json({ reason: err });
    }

    res.status(200).json({
      result
    });
  });
});

requests.delete("/api/results/score/:sc", function(req, res, next) {
  GameResultModel.deleteMany({ score: req.params.sc }, function (err) {
    if (err) return handleError(err);
  });


  res.status(200).json({
    result : "Deleted values with score: " + req.params.sc
  });
});

requests.delete("/api/results/name/:nm", function(req, res, next) {
  GameResultModel.deleteMany({ player_name: req.params.nm }, function (err) {
    if (err) return handleError(err);
  });


  res.status(200).json({
    result : "Deleted values with name: " + req.params.nm
  });
});

requests.post("/api/results/update", function(req, res, next) {
  GameResultModel.updateMany({ player_name: req.body.name }, { score: req.body.score }, function(err, res) {
    if (err) return handleError(err);
  });

  res.status(200).json({
    result : "Updated values: " + req.body.name + ", " + req.body.score
  });
});

requests.use(function(req, res, next) {
  const error = new Error("Unsupported method!");
  error.status = 405;

  next(error);
});

requests.use(function(error, req, res, next) {
  res.status(error.status || 500).json({
    error: {
      message: error.message
    }
  });
});


module.exports = requests;