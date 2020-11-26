var week = require('../lowdb/week');
var room = require('../lowdb/room');
var db = require('../lowdb/db');
var subject = require('../lowdb/subject');

module.exports.week = function (req, res) {
  console.log(week.get('weeks').nth(1).value());
  res.redirect('/users');
}

module.exports.room = function (req, res) {
  console.log(room.get('class_room').nth(0).value());
  res.redirect('/users/create');
}

module.exports.selectStudents = function (req, res, next) {
  var studentID = req.params.studentId;
  var sessionID = req.signedCookies.sessionId;

  if (!sessionID) {
    res.redirect('/users');
    return;
  }

  db.get('sessions')
      .find({ id: sessionID})
      .set('list.' + studentID, 1)
      .write();

  res.redirect('/users');
}

module.exports.eliminate = function (req, res) {
  const rooms = room.get('class_room').value();
  let i;
  for (i = 0; i < rooms.length; i++) {
    let selectedRoom = room.get('class_room').nth(i).value();
    // console.log('Selected room ' + selectedRoom.room);
    let j;
    for (j = i+1; j < rooms.length; j++) {
      let thisRoom = room.get('class_room').nth(j).value();
      // console.log('This room ' + thisRoom.room);
      if (selectedRoom.room === thisRoom.room) {
        // console.log('Matched!');
        room.get('class_room').remove(thisRoom).write();
      }
    }
  }
  var numOfRoom = room.get('class_room').value().length;
  var numOfWeek = week.get('weeks').value().length;
  console.log('There are ' + numOfRoom + ' rooms');
  console.log('There are ' + numOfWeek + ' weeks');

  if (numOfRoom > numOfWeek) {
    let i;
    for (i = numOfWeek ; i < numOfRoom ; i++) {
      let selectedRoom = room.get('class_room').nth(numOfWeek).value();
      console.log('Deleting room... ' + selectedRoom.room);
      room.get('class_room').remove(selectedRoom).write();
    }
  } else if (numOfWeek > numOfRoom) {
    let i;
    for (i = numOfRoom ; i < numOfWeek ; i++) {
      let selectedWeek = week.get('weeks').nth(numOfRoom).value();
      console.log('Deleting week... ' + selectedWeek.id_week);

      week.get('weeks').remove(selectedWeek).write();
    }
  }
  numOfRoom = room.get('class_room').value().length;
  numOfWeek = week.get('weeks').value().length;
  console.log('There are ' + numOfRoom + ' rooms');
  console.log('There are ' + numOfWeek + ' weeks');
  res.redirect('/users');
}

module.exports.assign = function (req, res) {
  var rooms = room.get('class_room').value();
  var weeks = week.get('weeks').value();
  // console.log(rooms.length);
  // res.redirect('/users');

  let i;
  for (i = 0; i < rooms.length; i++ ){
    let weekSelect = week.get('weeks').nth(i).value();
    // console.log('Week Selected: ' + weekSelect.id_week);
    room.get('class_room').nth(i).assign({id_week: weekSelect.id_week}).write();
  }

  res.redirect('/users');

}

module.exports.generate = function (req, res) {
  var subjects = subject.get('subjects').value();
  // console.log(subject.get('subjects').nth(0).value().id_sub);
  var randomSubject;
  var subName;
  var listOfSubject = ['Physics','Net-centric Programming','Software Architecture', 'Computer Architecture',
    'Calculus', 'Critical Thinking', 'Physical', 'Academic English', 'Marxism', 'HCM\'s Thought',
    'Object-oriented Programming', 'Digital Logic Design', 'Software Engineering', 'Principles of Database Management',
    'Discrete Math', 'Data Structures and Algorithms', 'Computer Networks', 'Probability\, Statistics and Random Variables',
    'Web Development', 'Object-oriented Analysis and Design', 'Data Mining', 'Computer Graphic', 'Thesis', 'Machine Learning']
  let i;
  for (i = 0; i < subjects.length; i++) {
    randomSubject = Math.floor(Math.random() * 23) + 1;
    console.log('Subject at ' + i + ' is ' + randomSubject);
    subName = listOfSubject[randomSubject];
    console.log('Subject name is ' + subName);
    subject.get('subjects').nth(i).assign({name_sub: subName}).write();
  }
  res.redirect('/users');
}

module.exports.createSubject = function (req, res) {
  var subjects = subject.get('subjects').value();

  res.render('school/createSubject', {
    subjects: subjects,
    csrfToken: req.csrfToken()
  });
}

module.exports.searchRoom = function (req, res) {
  var rooms = room.get('class_room').value();
  var weeks = week.get('weeks').value();
  var subjects = subject.get('subjects').value();


  var selectedSubject = JSON.parse(req.body.sub);
  // console.log('Selected Sub: ' + selectedSubject.name_sub);

  var selectedSubjectCredit = selectedSubject['credits'];
  // console.log('Credit: ' + selectedSubjectCredit);

  var listOfWeek = [];

  let i;
  for ( i = 0; i < weeks.length; i++) {
    let currentWeek = week.get('weeks').nth(i).value();
    // console.log('Current week: ' + currentWeek.id_week);
    let k;
    let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    for (k = 1; k <= 7; k++) {
      let thisDay = days[k - 1];
      // console.log('This day: ' + thisDay);
      let thisDayValue = currentWeek[thisDay];
      let l;
      let count = selectedSubjectCredit;
      for (l = 0 ; l < thisDayValue.length; l++) {
        if (thisDayValue[l] === 0) {
          count--;
        } else {
          if (count !== 0) {
            count = selectedSubjectCredit;
          }
        }
        if (count === 0) {
          break;
        }
      }
      if (count === 0 ){
        listOfWeek.push(currentWeek);
        break;
      }
    }
  }
  // for (i = 0; i < listOfWeek.length; i++) {
  //   console.log('List of Week: ' + listOfWeek[i].id_week);
  // }

  var listOfRoom = [];

  for (let j = 0 ; j < rooms.length; j++) {
    let i;
    let currentRoom = room.get('class_room').nth(j).value();
    for (i = 0; i < listOfWeek.length ; i++) {
      if (currentRoom['id_week'] === listOfWeek[i].id_week) {
        listOfRoom.push(currentRoom);
        break;
      }
    }
  }

  // for (i = 0; i < listOfWeek.length; i++) {
  //   console.log('List of Room: ' + listOfRoom[i].room);
  // }


  res.render('school/createSubject', {
    subjects: subjects,
    rooms: listOfRoom,
    selectedSubject: selectedSubject,
    csrfToken: req.csrfToken()
  })

  // res.redirect('/school/createSubject');
}

module.exports.searchWeek = function (req, res) {
  var rooms = room.get('class_room').value();
  var weeks = week.get('weeks').value();
  var subjects = subject.get('subjects').value();


  var selectedSubject = JSON.parse(req.body.sub);
  console.log('Selected Sub: ' + selectedSubject.name_sub);
  var selectedRoom = JSON.parse(req.body.roo);
  console.log('Selected Room: ' + selectedRoom['room']);
  var listRoom = JSON.parse(req.body.list_room);

  var selectedSubjectCredit = selectedSubject['credits'];
  console.log('Num of credit: ' + selectedSubjectCredit);
  var selectedWeek = week.get('weeks').find({id_week: selectedRoom['id_week']}).value();

  let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  let result = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: []
  };
  console.log('Credir: ' + selectedSubjectCredit);
  let k;
  for (k = 1; k <= 7; k++) {
    let thisDay = days[k - 1];
    // console.log('This day: ' + thisDay);
    let thisDayValue = selectedWeek[thisDay];
    let l;
    let count = selectedSubjectCredit;
    let preCount = selectedSubjectCredit;
    for (l = 0 ; l < thisDayValue.length; l++) {
      if (thisDayValue[l] === 1) {
        result[thisDay].push(1);
        count = selectedSubjectCredit;
      } else {
        result[thisDay].push(0);
        count--;
      }

      let checkValid = count - preCount;

      if (0 < checkValid && checkValid < selectedSubjectCredit) {
        for (let h = 0; h <= checkValid; h++) {
          result[thisDay].pop();
        }
        for (let h = 0; h <= checkValid; h++) {
          result[thisDay].push(1);
        }
        count = selectedSubjectCredit;
      }
      if (l === thisDayValue.length - 1) {
        let checkTail = selectedSubjectCredit - count;
        // console.log('Check 12', + checkTail);
        // console.log('Check !== credit? ', + checkTail !== selectedSubjectCredit);
        if ((checkTail !== 0) && checkTail !== parseInt(selectedSubjectCredit)) {
          for (let h = 0; h <= checkTail; h++) {
            result[thisDay].pop();
          }
          for (let h = 0; h <= checkTail; h++) {
            result[thisDay].push(1);
          }
        }
      }
      preCount = count;

    }
  }
  console.log('Selected Week ' + selectedWeek.mon);
  console.log('Selected Week ' + selectedWeek.tue);
  console.log('Selected Week ' + selectedWeek.wed);
  console.log('Selected Week ' + selectedWeek.thu);
  console.log('Selected Week ' + selectedWeek.fri);
  console.log('Selected Week ' + selectedWeek.sat);
  console.log('Selected Week ' + selectedWeek.sun);
  console.log('');
  console.log('Result: ' + result.mon);
  console.log('Result: ' + result.tue);
  console.log('Result: ' + result.wed);
  console.log('Result: ' + result.thu);
  console.log('Result: ' + result.fri);
  console.log('Result: ' + result.sat);
  console.log('Result: ' + result.sun);
  console.log('');

  var displayedResult = {
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': [],
    '7': [],
    '8': [],
    '9': [],
    '10': [],
    '11': [],
    '12': []
  }

  // var displayedResult = {
  //   '1': [1,1,0,3,0,3,1,1,1],
  //   '2': [1,0,2,1,1,1],
  //   '3': [0,4,1,1,1],
  //   '4': [1,1,1,1,0,3,1],
  //   '5': [1,1,1,0,2,1],
  //   '6': [1,1,0,2,1],
  //   '7': [1,1,1,1,1,1],
  //   '8': [1,1,1,1,1,1,1],
  //   '9': [1,1,1,1,1,1,1],
  //   '10': [1,1,1,1,1,1,1],
  //   '11': [0,2,1,1,1,1,1,1],
  //   '12': [1,1,1,1,1,1]
  // }
  //
  // var index = {
  //   '1': [1,1,3,3,1,1,1],
  //   '2': [1,2,1,1,1],
  //   '3': [4,1,1,1],
  //   '4': [1,1,1,1,3,1],
  //   '5': [1,1,1,2,1],
  //   '6': [1,1,2,1],
  //   '7': [1,1,1,1,1,1],
  //   '8': [1,1,1,1,1,1,1],
  //   '9': [1,1,1,1,1,1,1],
  //   '10': [1,1,1,1,1,1,1],
  //   '11': [2,1,1,1,1,1,1],
  //   '12': [1,1,1,1,1,1]
  // }

  for (let a = 0 ; a < 12; a++) {
    let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    let periods = ['1','2','3','4','5','6','7','8','9','10','11','12'];

    for (let b = 0; b < days.length; b++) {
      // console.log(result[days[b]][a - 1]);
      displayedResult[periods[a]].push(result[days[b]][a]);
    }
    console.log('Period : ' + displayedResult[(a + 1).toString()]);

  }


  res.render('school/createSubject', {
    subjects: subjects,
    rooms: listRoom,
    selectedSubject: selectedSubject,
    selectedRoom: selectedRoom,
    weekDetails: displayedResult,
    csrfToken: req.csrfToken()
  })


  // res.redirect('/school.createSubject');
}