const express = require("express");
const app = express();
const fs = require('fs') 

const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { model, Schema, Types } = require("mongoose");

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true
});

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json({}));

app.use(function(req, res, next) {
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

app.use(express.static(__dirname + 'public'))

const GameResultModel = model(
  "GameResult",
  Schema({
    _id: mongoose.Schema.Types.ObjectId,
    player_name: String,
    score: Number
  })
);

app.post("/api/results", function(req, res, next) {
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

app.get("/", function(_, res, _) {
  res.status(200).sendFile(__dirname + "/public/index.html");
});

app.get("/style.css", function(_, res, _) {
  res.status(200).sendFile(__dirname + "/public/style.css");
});

app.get("/tetris.js", function(_, res, _) {
  res.status(200).sendFile(__dirname + "/public/tetris.js");
});

app.get("/tetrominoes.js", function(_, res, _) {
  res.status(200).sendFile(__dirname + "/public/tetrominoes.js");
});

app.get("/images/background.jpg", function(_, res, _) {
  res.status(200).sendFile(__dirname + "/public/images/background.jpg");
});

app.get("/favicon.ico", function(_, res, _) {
  res.status(200).sendFile(__dirname + "/public/images/background.jpg");
});

app.get("/api/results", function(_, res, _) {
  GameResultModel.find({}, function(err, result) {
    if (err) {
      return res.status(500).json({ reason: err });
    }

    players = []

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

    data = 
      `<!DOCTYPE html>
      <html>
      <head>
        <style>
        body {
          background-image: url(../images/background.jpg);
          background-color: rgba(255,255,255,0.6);
          background-blend-mode: lighten;
        }
        div {
          width: 200px;
        }
         
        h2 {
          font: 400 60px/1.5 Helvetica, Verdana, sans-serif;
          margin: 0;
          padding: 0;
        }
         
        ul {
          list-style-type: none;
          margin: 0;
          padding: 0;
        }
         
        li {
          font: 200 40px/1.5 Helvetica, Verdana, sans-serif;
          border-bottom: 1px solid #ccc;
        }
         
        li:last-child {
          border: none;
        }
        </style>
        <link rel="shortcut icon" href="#" />
      </head>
      <body><main>`;

    data += '<ul>';
    for(let i=0; i<players.length; i++) {
      data += `<li>` + players[i]["name"] + `: ` + players[i]["score"] + `</li>`;
    }
    data += '</ul>';
      
    data +=  `</main></body></html>`;



    res.status(200).send(data);
  });
});

app.get("/api/results/:id_user", function(_, res, _) {
  GameResultModel.find({ id_user: req.body.id_user }, function(err, result) {
    if (err) {
      return res.status(500).json({ reason: err });
    }

    res.status(200).json({
      result
    });
  });
});

app.use(function(_, _, next) {
  const error = new Error("Unsupported method!");
  error.status = 405;

  next(error);
});

app.use(function(error, _, res, _) {
  res.status(error.status || 500).json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;

// curl --data "_id=1" http://localhost:3000/api/results