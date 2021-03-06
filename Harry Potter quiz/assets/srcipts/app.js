import { questions } from "./questions.js";
// global variables
var timeLeft,
    nextQuestion,
    wrongCount = 0,
    choseWisely = 0;

                    /*      Functions       */

function randomizor(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
 }

 function getQuestion(questions) {
  //pick question at random.
  nextQuestion = randomizor(questions);
  
  //remove the question from the remaining question drawings
  for (var i = 0; i < questions.length; i++) {
      if (questions[i].answer === nextQuestion.answer) {
        questions.splice(i, 1);         
    }
  }
  return nextQuestion;
}

function paintQuestion(question) {
  document.querySelector("#question").textContent = "";
  var container = document.getElementById("question"),
    ask = document.createElement("h1"),
    ul = document.createElement("ul");

  ask.appendChild(document.createTextNode(question.title));
  ul.classList.add("list-group");

  question.choices.forEach(function(choice) {
    //create and append list items
    var li = document.createElement("li");
    li.className = "list-group-item list-group-item-action text-body";
    li.appendChild(document.createTextNode(choice));
    ul.appendChild(li);
  });
  container.appendChild(ask);
  container.appendChild(ul);
}

function runClock(remainTime) {
  var startTime = Date.now();

  var timer = function() {
    //elapsed time
    timeLeft = new Date(
      remainTime - wrongCount * 15000 - (Date.now() - startTime)
    );
  }

  //run timer.
  var tickTock = setInterval(timer, 1000);

  //check to see if endgame condition is met
  var checkIn = setInterval(checkTime, 1000);
  function checkTime() {
    if (timeLeft <= 0) {
      clearInterval(tickTock);
      clearInterval(checkIn);
      endGame();
    }
  }

  timer(); //start now.
  showTime(); //show now.

  setInterval(showTime, 1000);
}

function showTime() {
  var timeString = document.getElementById("timer"),
    mins = timeLeft.getMinutes(),
    secs = timeLeft.getSeconds();

  secs = secs < 10 ? "0" + secs : secs;

  timeString.textContent = mins + ":" + secs;
}

function handleQuestion(nextQuestion) {
  var listItems = document.querySelectorAll(".list-group-item");

  listItems.forEach(function(choice) {
    choice.addEventListener("click", function(event) {
      var click = event.currentTarget;
      if (click.textContent === nextQuestion.answer) {
        click.className = "form-control is-valid";
        correctAns();
      } else {
        click.className = "form-control is-invalid";
        inCorrectAns();
      }
    })
  })
}

function correctAns() {
  setTimeout(newQuestion, 1000);
  rightSound();
  choseWisely++;
 }

function inCorrectAns() {
  var flash = setInterval(flashTimer, 200);
  wrongCount++;
  // wrongSound()  disabled

  setTimeout(function() {
  clearInterval(flash);
  resetColor();
  paintQuestion(nextQuestion);
  handleQuestion(nextQuestion);
  }, 1000);
 }

function newQuestion() {
  //clear last question.
  document.querySelector("#question").textContent = "";
  nextQuestion = getQuestion(questions);
 
  paintQuestion(nextQuestion);
  handleQuestion(nextQuestion);
}

function flashTimer() {
  var flash = document.getElementById("timer");

  flash.style.color = flash.style.color == "red" ? "#212529" : "red";
}

function resetColor() {
  document.getElementById("timer").style.color = "#212529";
}

function wrongSound() {
  var opps = document.getElementById("wrong-sound");
  opps.play();
}

function rightSound() {
  var woop = document.getElementById("right-sound");
  woop.play();
}

function endGame() {
  //hide game screen
  document.querySelector("#question").style.display = "none";
  document.querySelector("#timer").style.display = "none";

  //show game over screen
  document.querySelector(".form-group").style.display = "block";
  document.querySelector(".clear").style.display = "block";
  //load saved players
  getScores();

  document.querySelector(".new-game").addEventListener("click", function() {
    location.reload();
  });

  //add player to local storage.
  document.querySelector(".add").addEventListener("click", function(event) {
    var player = {
      name: document.querySelector(".player-name").value,
      score: choseWisely,
      mistakes: wrongCount
    };

    if (player.name === "") {
      alert("Enter your name first");
    } else {
      storeGameInLS(player); //add player
      getScores(); //repaint scores
      //clear input field
      document.querySelector(".player-name").value = "";
    }
    event.preventDefault();
  })
  //listen to clear btn
  document.querySelector(".clear").addEventListener("click", clearLocalStorage);
}

function getScores() {
  var players;
  if (localStorage.getItem("players") === null) {
    players = [];
  } else {
    players = JSON.parse(localStorage.getItem("players"));
  }
  var container = document.getElementById("storage"),
      table = document.createElement("table"),
      header = document.createElement("tr"),
      nameHeader = document.createElement("th"),
      correctHeader = document.createElement("th"),
      wrongtHeader = document.createElement("th");

  //generate table heading
  correctHeader.setAttribute("scope", "col");
  wrongtHeader.setAttribute("scope", "col");
  var nameText = document.createTextNode("Name");
  var correctText = document.createTextNode("Number of Correct Answers");
  var wrongText = document.createTextNode("Number of Mistakes");
  nameHeader.appendChild(nameText);
  correctHeader.appendChild(correctText);
  wrongtHeader.appendChild(wrongText);
  table.className = "table table-hover";
  header.appendChild(nameHeader);
  header.appendChild(correctHeader);
  header.appendChild(wrongtHeader);
  table.appendChild(header);

  //clear out existing table
  container.textContent = "";

  console.log(players);

  //generate table content
  players.forEach(function(player) {
    var tr = document.createElement("tr");
    tr.setAttribute("class", "table-active");

    var th1 = document.createElement("th");
    var th2 = document.createElement("th");
    var th3 = document.createElement("th");
    th1.setAttribute("scope", "row");
    th2.setAttribute("scope", "row");
    th3.setAttribute("scope", "row");

    var name = document.createTextNode(player.name);
    var score = document.createTextNode(player.score);
    var mistakes = document.createTextNode(player.mistakes);

    th1.appendChild(name);
    th2.appendChild(score);
    th3.appendChild(mistakes);
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);

    table.appendChild(tr);
  });

  container.appendChild(table);
}

function storeGameInLS(player) {
  var players;
  if (localStorage.getItem("players") === null) {
    players = [];
  } else {
    players = JSON.parse(localStorage.getItem("players"));
  }
  //add game to list
  players.push(player);
  //set back in LS
  localStorage.setItem("players", JSON.stringify(players));
}

function clearLocalStorage() {
  var conformation = confirm(
    "Are you sure you'd like to clear the score list?"
  )
  if (conformation) {
    localStorage.clear();
    getScores(); //display empty table
  }
}

function gameChooser() {
  var timeSet = document.querySelector(".four-min").checked,
      duration;

  if (timeSet) {
    duration = 240000;
  } else {
    duration = 120000;
  }
  return duration;
}

//hide end of game elements.
document.querySelector("#scores").style.display = "none";
document.querySelector(".form-group").style.display = "none";
document.querySelector(".clear").style.display = "none";

/*          Event Listeners         */

//change radio buttons for each game.
document.querySelector(".two-min").onchange = function() {
  document.querySelector(".chng-two").classList.add("active");
  document.querySelector(".chng-four").classList.remove("active");
};
document.querySelector(".four-min").onchange = function() {
  document.querySelector(".chng-four").classList.add("active");
  document.querySelector(".chng-two").classList.remove("active");
};

//start game.
document.querySelector(".begin").addEventListener("click", function() {
  //hide welcome screen
  document.querySelector(".welcome").style.display = "none";

  nextQuestion = getQuestion(questions);

  var duration = gameChooser();
  paintQuestion(nextQuestion);
  handleQuestion(nextQuestion);
  runClock(duration); //2 or 4 mins
})
