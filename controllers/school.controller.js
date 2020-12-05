var week = require('../lowdb/week');
var room = require('../lowdb/room');
var db = require('../lowdb/db');
var subject = require('../lowdb/subject');
var department = require('../lowdb/department');
var studentSchedule = require('../lowdb/studentStandardSchedule');
var teacherSchedule = require('../lowdb/teacherStandardSchedule');

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
      .find({id: sessionID})
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
    for (j = i + 1; j < rooms.length; j++) {
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
    for (i = numOfWeek; i < numOfRoom; i++) {
      let selectedRoom = room.get('class_room').nth(numOfWeek).value();
      console.log('Deleting room... ' + selectedRoom.room);
      room.get('class_room').remove(selectedRoom).write();
    }
  } else if (numOfWeek > numOfRoom) {
    let i;
    for (i = numOfRoom; i < numOfWeek; i++) {
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
  for (i = 0; i < rooms.length; i++) {
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
  var listOfSubject = ['Physics', 'Net-centric Programming', 'Software Architecture', 'Computer Architecture',
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
  for (i = 0; i < weeks.length; i++) {
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
      for (l = 0; l < thisDayValue.length; l++) {
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
      if (count === 0) {
        listOfWeek.push(currentWeek);
        break;
      }
    }
  }
  // for (i = 0; i < listOfWeek.length; i++) {
  //   console.log('List of Week: ' + listOfWeek[i].id_week);
  // }

  var listOfRoom = [];

  for (let j = 0; j < rooms.length; j++) {
    let i;
    let currentRoom = room.get('class_room').nth(j).value();
    for (i = 0; i < listOfWeek.length; i++) {
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
  var subjects = subject.get('subjects').value();


  var selectedSubject = JSON.parse(req.body.sub);
  var selectedRoom = JSON.parse(req.body.roo);
  var listRoom = JSON.parse(req.body.list_room);

  var selectedSubjectCredit = selectedSubject['credits'];
  var selectedWeek = week.get('weeks').find({id_week: selectedRoom['id_week']}).value();

  let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  let periods = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  let result = {mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []};
  let result2 = {mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []};

  let k;
  for (k = 1; k <= 7; k++) {
    let thisDay = days[k - 1];
    let thisDayValue = selectedWeek[thisDay];
    let l;
    let count = selectedSubjectCredit;
    let preCount = selectedSubjectCredit;
    for (l = 0; l < thisDayValue.length; l++) {
      if (thisDayValue[l] === 1) {
        result[thisDay].push(1);
        result2[thisDay].push(1);
        count = selectedSubjectCredit;
      } else {
        result[thisDay].push(0);
        result2[thisDay].push(0);
        count--;
      }
      console.log('result 1 PRE ' + result['mon']);
      console.log('result 2 PRE ' + result2['mon']);
      let checkValid = count - preCount;

      if (0 < checkValid && checkValid < selectedSubjectCredit) {
        for (let h = 0; h <= checkValid; h++) {
          result[thisDay].pop();
          result2[thisDay].pop();
        }
        for (let h = 0; h <= checkValid; h++) {
          result[thisDay].push(1);
          result2[thisDay].push(1);
        }
        count = selectedSubjectCredit;
      }

      if (count < 0) {
        count = 0;
      }

      if (l === thisDayValue.length - 1) {
        let checkTail = selectedSubjectCredit - count;
        if ((checkTail !== 0) && checkTail !== parseInt(selectedSubjectCredit)) {
          for (let h = 0; h <= checkTail; h++) {
            result[thisDay].pop();
            result2[thisDay].pop();
          }
          for (let h = 0; h <= checkTail; h++) {
            result[thisDay].push(1);
            result2[thisDay].push(1);
          }
        }
      }
      preCount = count;

    }
  }
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
  var where = [];

  for (let t = 0; t < days.length; t++) {
    let count = 1;
    for (let p = 0; p < periods.length; p++) {
      if (result[days[t]][p] === 0) {
        if (count > 1) {
          result[days[t]][p] = count;
        }
        count++;
      } else {
        count = 1;
      }

    }
  }

  for (let a = 0; a < 12; a++) {
    let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    let periods = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    for (let b = 0; b < days.length; b++) {
      if (result[days[b]][a] < 2) {
        displayedResult[periods[a]].push(result[days[b]][a]);
      }
    }
  }

  for (let t = 0; t < days.length; t++) {
    let count = 1;
    for (let p = 0; p < periods.length; p++) {
      if (result2[days[t]][p] === 0) {
        if (count > 1) {
          result2[days[t]][p] = count;
        }
        if (p === 11 && result2[days[t]][11] > 1) {
          for (let h = 11; h > (p - count + 1); h--) {
            result2[days[t]][h] = 0;
          }
          if (result2[days[t]][p - count + 1] !== 1) {
            result2[days[t]][p - count + 1] = count;
          }
        }
        count++;
      } else {
        if (count > 1) {
          for (let h = p - 1; h > (p - count + 1); h--) {
            result2[days[t]][h] = 0;
          }
        }
        if (result2[days[t]][p - count + 1] !== 1) {
          result2[days[t]][p - count + 1] = count - 1;
        }

        count = 1;
      }
    }
  }
  var checkArray = [];

  for (let c = 0; c < 12; c++) {
    for (let g = 0; g < days.length; g++) {
      if (result2[days[g]][c] !== 0) {
        where.push(result2[days[g]][c]);
        checkArray.push(result2[days[g]][c]);
      }
    }
  }

  var count = 7;
  var compareString = checkArray.slice(0, count);
  // console.log('Check Array String: '  + checkArray);
  // console.log('Length of Check Array String: '  + checkArray.length);
  // console.log('Compare String: '  + compareString);
  // console.log('Type of Compare String: '  + compareString[0]);
  var currentString;
  var whereDay = [];

  for (let x = 0; x < compareString.length; x++) {
    whereDay.push(days[x]);
  }

  for (let y = 1; y < 12; y++) {
    // console.log('Compare String: '  + compareString);

    let f = 7;
    for (let v = 0;  v < compareString.length; v++) {
      if (compareString[v] !== 1 && compareString[v] !== 9) {
        f--;
      }
    }
    // console.log('Count: ' + count + ' f: ' + f);
    currentString = checkArray.slice(count, count + f);
    count = count + f;
    // console.log('pre Current String: '  + currentString);
    for (let r = 0; r < 7; r++) {
      // let currentIdx = currentString[r];
      let compareIdx = compareString[r];

      if (compareIdx > 1 && compareIdx < 9) {
        if (compareIdx !== 2) {
          currentString.splice(r, 0, compareIdx - 1);
        } else {
          currentString.splice(r, 0, 9);
        }
      } else {
        whereDay.push(days[r]);
        // console.log('Push ' + days[r]);
      }
    }
    // console.log('Current String: ' + currentString);

    compareString = currentString;
    // console.log('Compare String: '  + compareString);

  }

  // console.log('Length of List of Days: ' + whereDay.length);
  // console.log('List of Days: ' + whereDay);

  res.render('school/createSubject', {
    subjects: subjects,
    rooms: listRoom,
    selectedSubject: selectedSubject,
    selectedRoom: selectedRoom,
    weekDetails: displayedResult,
    where: where,
    whereDay: whereDay,
    csrfToken: req.csrfToken()
  })
}

module.exports.assignWhenAndWhereToSubject = function (req, res) {
  var subjects = subject.get('subjects').value();
  var selectedSubject = subject.get('subjects').find({id_sub: parseInt(req.body.chooseThisSubjectID)}).value();
  var selectThis = JSON.parse(req.body.selectThis);

  console.log('Select This: ' + selectThis);
  console.log('Type of Select This: ' + typeof selectedSubject);
  console.log('Day of Select This: ' + selectThis[0]);
  console.log('Period of Select This: ' + selectThis[1]);
  var whichPeriod = [];
  for (let t = 0; t < req.body.chooseThisCredit; t++) {
    whichPeriod.push(selectThis[1]++);
  }
  console.log('Room: ' + req.body.chooseThisRoomName + ' whichday: ' + selectThis[0] + ' whichperiod ' + whichPeriod);

  subject.get('subjects')
      .find({id_sub: parseInt(req.body.chooseThisSubjectID)})
      .assign({room: req.body.chooseThisRoomName, whichDay: selectThis[0], whichPeriod: whichPeriod})
      .write();

  var selectedRoom = room.get('class_room').find({id: parseInt(req.body.chooseThisRoomID)}).value();
  var selectWeekID = selectedRoom['id_week'];

  var selectedWeek = week.get('weeks').find({id_week: selectWeekID}).value();
  // console.log('Week ISSSS ' + selectedWeek.id_week);

  var whatDayInSelectedWeek = selectThis[0];
  var oo = selectedWeek[whatDayInSelectedWeek];

  // console.log('Type of day ' + typeof whatDayInSelectedWeek);
  // console.log('day ' + whatDayInSelectedWeek);

  var to = (selectThis[1] - 1);
  console.log('COntent in What Day In Week BEFORE ' + oo);
  for (let b = selectThis[1] - req.body.chooseThisCredit - 1; b < to; b++) {
    oo.splice(b, 1, 1);
  }
  console.log('COntent in What Day In Week ' + oo);

  if (whatDayInSelectedWeek === 'mon') {
    week.get('weeks').find({id_week: selectWeekID}).assign({mon: oo}).write();
  } else if (whatDayInSelectedWeek === 'tue') {
    week.get('weeks').find({id_week: selectWeekID}).assign({tue: oo}).write();
  } else if (whatDayInSelectedWeek === 'wed') {
    week.get('weeks').find({id_week: selectWeekID}).assign({wed: oo}).write();
  } else if (whatDayInSelectedWeek === 'thu') {
    week.get('weeks').find({id_week: selectWeekID}).assign({thu: oo}).write();
  } else if (whatDayInSelectedWeek === 'fri') {
    week.get('weeks').find({id_week: selectWeekID}).assign({fri: oo}).write();
  } else if (whatDayInSelectedWeek === 'sat') {
    week.get('weeks').find({id_week: selectWeekID}).assign({sat: oo}).write();
  } else if (whatDayInSelectedWeek === 'sun') {
    week.get('weeks').find({id_week: selectWeekID}).assign({sun: oo}).write();
  }

  if (req.body.existedRoom !== undefined && req.body.existedDay !== undefined && req.body.existedPeriod !== undefined) {
    var existedRoom = room.get('class_room').find({room: req.body.existedRoom}).value();
    var existedWeekID = existedRoom['id_week'];
    var existedWeek = week.get('weeks').find({id_week: existedWeekID}).value();
    var whatDayInExistedWeek = req.body.existedDay;
    console.log('whatDayInExistedWeek ' + whatDayInExistedWeek);
    console.log('type OF whatDayInExistedWeek ' + typeof whatDayInExistedWeek);
    var oops = existedWeek[whatDayInExistedWeek];

    var tops = (parseInt(req.body.existedPeriod) + parseInt(req.body.chooseThisCredit) - 1);

    console.log('COntent in What Day In EXISTED Week BEFORE ' + oops);
    for (let b = parseInt(req.body.existedPeriod) - 1; b < tops; b++) {
      oops.splice(b, 1, 0);
    }
    console.log('req.body.existedPeriod - 1: ' + (req.body.existedPeriod - 1) + ' tops: ' + tops);
    console.log('COntent in What Day In EXISTED Week ' + oops);

    if (whatDayInExistedWeek === 'mon') {
      week.get('weeks').find({id_week: existedWeekID}).assign({mon: oops}).write();
    } else if (whatDayInExistedWeek === 'tue') {
      week.get('weeks').find({id_week: existedWeekID}).assign({tue: oops}).write();
    } else if (whatDayInExistedWeek === 'wed') {
      week.get('weeks').find({id_week: existedWeekID}).assign({wed: oops}).write();
    } else if (whatDayInExistedWeek === 'thu') {
      week.get('weeks').find({id_week: existedWeekID}).assign({thu: oops}).write();
    } else if (whatDayInExistedWeek === 'fri') {
      week.get('weeks').find({id_week: existedWeekID}).assign({fri: oops}).write();
    } else if (whatDayInExistedWeek === 'sat') {
      week.get('weeks').find({id_week: existedWeekID}).assign({sat: oops}).write();
    } else if (whatDayInExistedWeek === 'sun') {
      week.get('weeks').find({id_week: existedWeekID}).assign({sun: oops}).write();
    }
  }


  res.render('school/createSubject', {
    subjects: subjects,
    selectedSubject: selectedSubject,
    rooms: JSON.parse(req.body.chooseTheseRooms),
    csrfToken: req.csrfToken()
  });

  // res.redirect('/users');
}

module.exports.createDepartment = function (req, res) {
  var listOfDepartment = ['School of Business', 'School of Computer Science and Engineering',
    'School of Electrical Engineering', 'School of Biotechnology', 'Department of Mathematics',
    'Department of Physics', 'Department of Biomedical Engineering', 'Department of Civil Engineering',
    'Department of Industrial and Systems Engineering', 'Department of English',
    'Department of Environmental Engineering'];

  for (let h = 0; h < listOfDepartment.length; h++) {
    department.get('department').push({department_id: h, department_name: listOfDepartment[h]}).write();
  }

  res.redirect('/users');
}

module.exports.assignSubjectToDepartment = function (req, res) {
  var listOfSubject = subject.get('subjects').value();

  console.log( 'Here type of ' + typeof listOfSubject);

  var belongToDepartmentID = ['Physics', 'Net-centric Programming', 'Software Architecture', 'Computer Architecture',
    'Calculus', 'Critical Thinking', 'Physical', 'Academic English', 'Marxism', 'HCM\'s Thought',
    'Object-oriented Programming', 'Digital Logic Design', 'Software Engineering', 'Principles of Database Management',
    'Discrete Math', 'Data Structures and Algorithms', 'Computer Networks', 'Probability\, Statistics and Random Variables',
    'Web Development', 'Object-oriented Analysis and Design', 'Data Mining', 'Computer Graphic', 'Thesis', 'Machine Learning'];

  function runAllSubjects() {
    for (let i = 0; i < listOfSubject.length; i++) {

      async function reset() {
        if (i === 0) {
          department.get('department').nth(0).set('subjects', []).write();
          department.get('department').nth(1).set('subjects', []).write();
          department.get('department').nth(2).set('subjects', []).write();
          department.get('department').nth(3).set('subjects', []).write();
          department.get('department').nth(4).set('subjects', []).write();
          department.get('department').nth(5).set('subjects', []).write();
          department.get('department').nth(6).set('subjects', []).write();
          department.get('department').nth(7).set('subjects', []).write();
          department.get('department').nth(8).set('subjects', []).write();
          department.get('department').nth(9).set('subjects', []).write();
          department.get('department').nth(10).set('subjects', []).write();
        }
      }

      reset().then(assign);

      function assign() {
        for (let j = 0; j < belongToDepartmentID.length; j++) {
          if (listOfSubject[i].name_sub === belongToDepartmentID[j]) {
            if (j <= 1) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(0).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(0).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list1: ' + listSubjectOfThisDepartment);
              department.get('department').nth(0).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 3) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(1).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(1).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list2: ' + listSubjectOfThisDepartment);

              department.get('department').nth(1).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 5) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(2).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(2).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list3: ' + listSubjectOfThisDepartment);

              department.get('department').nth(2).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 7) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(3).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(3).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list4: ' + listSubjectOfThisDepartment);

              department.get('department').nth(3).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 9) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(4).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(4).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list5: ' + listSubjectOfThisDepartment);

              department.get('department').nth(4).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 11) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(5).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(5).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list6: ' + listSubjectOfThisDepartment);

              department.get('department').nth(5).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 13) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(6).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(6).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list7: ' + listSubjectOfThisDepartment);

              department.get('department').nth(6).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 15) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(7).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(7).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list8: ' + listSubjectOfThisDepartment);

              department.get('department').nth(7).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 17) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(8).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(8).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list9: ' + listSubjectOfThisDepartment);

              department.get('department').nth(8).set('subjects', listSubjectOfThisDepartment).write();
            } else if (j <= 19) {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(9).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(9).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list10: ' + listSubjectOfThisDepartment);

              department.get('department').nth(9).set('subjects', listSubjectOfThisDepartment).write();
            } else {
              let listSubjectOfThisDepartment = [];
              if (department.get('department').nth(10).value().subjects) {
                listSubjectOfThisDepartment = department.get('department').nth(10).value().subjects;
              }
              listSubjectOfThisDepartment.push(listOfSubject[i].id_sub);
              console.log('This list11: ' + listSubjectOfThisDepartment);

              department.get('department').nth(10).set('subjects', listSubjectOfThisDepartment).write();
            }
          }
        }
      }
    }
  }

  async function demo() {

    await runAllSubjects();
  }
  demo().then(res.redirect('/users'));
  // for (let v = 0; )
}

module.exports.assignStandardSchedule = function (req, res) {
  var studentSchedules = studentSchedule.get('studentSchedule').value();
  var teacherSchedules = teacherSchedule.get('teacherSchedule').value();
  var users = db.get('users').value();

  console.log(studentSchedules[1]);
  console.log(teacherSchedules[1]);
  console.log(users[1]);

  function assignRole() {
    for(let i = 0; i < users.length; i++) {
      if (i % 5 === 0) {
        db.get('users').nth(i).assign({role: 1}).write();
      } else {
        db.get('users').nth(i).assign({role: 0}).write();
      }
    }
  }

  async function assignRoleNow() {
    await assignRole();
  }

  assignRoleNow().then(nowAssignSchedule);

  function nowAssignSchedule() {
    var students = db.get('users').value().filter(function (user) {
      return user.role === 0;
    })
    var teachers = db.get('users').value().filter(function (user) {
      return user.role === 1;
    })

    console.log('Number of student: ' + students.length);
    console.log('Number of teacher: ' + teachers.length);

    function assignSchedule() {
      let a = 1;
      let b = 1;
      for (let m = 0; m < users.length; m++) {
        if (users[m].role === 1) {
          db.get('users').nth(m).assign({teacherSchedule: a}).write();
          a++;
        } else if (users[m].role === 0) {
          db.get('users').nth(m).assign({studentSchedule: b}).write();
          b++;
        }
      }
    }

    async function assignScheduleNow() {
      await assignSchedule();
    }

    assignScheduleNow().then(res.redirect('/users'));
  }
  // res.redirect('/users');
}

module.exports.assignTeacherToSubject = function (req, res) {
  var subjects = subject.get('subjects').value();

  res.render('school/assignTeacherToSubject', {
    subjects: subjects,
    csrfToken: req.csrfToken()
  });
}

module.exports.searchTeacher = function (req, res) {
  var teachers = db.get('users').value().filter(function (user) {
    return user.role === 1;
  });
  var teacherWeeks = teacherSchedule.get('teacherSchedule').value();
  var subjects = subject.get('subjects').value();


  var selectedSubject = JSON.parse(req.body.sub);
  // console.log(teachers);

  var selectedSubjectCredit = selectedSubject['credits'];
  console.log('Credit: ' + selectedSubjectCredit);

  var listOfTeacherWeek = [];

  function findAvailableSchedule() {
    for (let i = 0; i < teacherWeeks.length; i++) {
      let currentTeacherWeek = teacherSchedule.get('teacherSchedule').nth(i).value();
      // console.log('Current week: ' + currentTeacherWeek.id);
      let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      for (let k = 1; k <= 7; k++) {
        let thisDay = days[k - 1];
        // console.log('This day: ' + thisDay);
        let thisDayValue = currentTeacherWeek[thisDay];
        let count = selectedSubjectCredit;
        // console.log('This Day Value length ' + thisDayValue.length);
        for (let l = 0; l < thisDayValue.length; l++) {
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
        if (count === 0) {
          listOfTeacherWeek.push(currentTeacherWeek);
          // console.log('OK');
          break;
        }
      }
    }
  }

  async function findAvailableScheduleNow() {
    await findAvailableSchedule();
  }

  var listOfTeacher = [];

  function findCorrespondentTeacher() {
    // for (let i = 0; i < listOfTeacherWeek.length; i++) {
    //   console.log('List of Week: ' + listOfTeacherWeek[i].id_week);
    // }

    for (let j = 0; j < teachers.length; j++) {
      let currentTeacher = teachers[j];
      for (let i = 0; i < listOfTeacherWeek.length; i++) {
        if (currentTeacher['teacherSchedule'] === listOfTeacherWeek[i]['id']) {
          listOfTeacher.push(currentTeacher);
          break;
        }
      }
    }
  }

  async function findCorrespondentTeacherNow() {
    await findCorrespondentTeacher();
  }

  function run(){
    findCorrespondentTeacherNow().then(ren);
  }

  function ren() {
    // for (let i = 0; i < listOfTeacher.length; i++) {
    //   console.log('List of Teacher: ' + listOfTeacher[i].name);
    // }


    res.render('school/assignTeacherToSubject', {
      subjects: subjects,
      teachers: listOfTeacher,
      selectedSubject: selectedSubject,
      csrfToken: req.csrfToken()
    })
  }

  findAvailableScheduleNow().then(run);

  // res.redirect('/users');
}

module.exports.searchTeacherWeek = function (req, res) {
  var subjects = subject.get('subjects').value();


  var selectedSubject = JSON.parse(req.body.sub);
  var selectedTeacher = JSON.parse(req.body.tea);
  var listTeacher = JSON.parse(req.body.list_tea);

  var selectedSubjectCredit = selectedSubject['credits'];
  var selectedWeek = teacherSchedule.get('teacherSchedule').find({id: selectedTeacher['teacherSchedule']}).value();

  let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  let periods = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  let result = {mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []};
  let result2 = {mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []};

  let k;
  for (k = 1; k <= 7; k++) {
    let thisDay = days[k - 1];
    let thisDayValue = selectedWeek[thisDay];
    let l;
    let count = selectedSubjectCredit;
    let preCount = selectedSubjectCredit;
    for (l = 0; l < thisDayValue.length; l++) {
      if (thisDayValue[l] === 1) {
        result[thisDay].push(1);
        result2[thisDay].push(1);
        count = selectedSubjectCredit;
      } else {
        result[thisDay].push(0);
        result2[thisDay].push(0);
        count--;
      }
      console.log('result 1 PRE  ' + result['mon']);
      console.log('result 2 PRE  ' + result2['mon']);
      let checkValid = count - preCount;

      if (0 < checkValid && checkValid < selectedSubjectCredit) {
        for (let h = 0; h <= checkValid; h++) {
          result[thisDay].pop();
          result2[thisDay].pop();
        }
        for (let h = 0; h <= checkValid; h++) {
          result[thisDay].push(1);
          result2[thisDay].push(1);
        }
        count = selectedSubjectCredit;
      }

      console.log('result 1 PRE1 ' + result['mon']);
      console.log('result 2 PRE1 ' + result2['mon']);
      console.log('COUNT NOW ' + count);
      if (count < 0) {
        count = 0;
      }

      if (l === thisDayValue.length - 1) {
        let checkTail = selectedSubjectCredit - count;
        if ((checkTail !== 0) && checkTail !== parseInt(selectedSubjectCredit)) {
          for (let h = 0; h <= checkTail; h++) {
            result[thisDay].pop();
            result2[thisDay].pop();
          }
          for (let h = 0; h <= checkTail; h++) {
            result[thisDay].push(1);
            result2[thisDay].push(1);
          }
        }
      }
      console.log('result 1 PRE2 ' + result['mon']);
      console.log('result 2 PRE2 ' + result2['mon']);
      preCount = count;

    }
  }
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
  var where = [];

  for (let t = 0; t < days.length; t++) {
    let count = 1;
    for (let p = 0; p < periods.length; p++) {
      if (result[days[t]][p] === 0) {
        if (count > 1) {
          result[days[t]][p] = count;
        }
        count++;
      } else {
        count = 1;
      }

    }
  }

  for (let a = 0; a < 12; a++) {
    let days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    let periods = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    for (let b = 0; b < days.length; b++) {
      if (result[days[b]][a] < 2) {
        displayedResult[periods[a]].push(result[days[b]][a]);
      }
    }
  }

  for (let t = 0; t < days.length; t++) {
    let count = 1;
    for (let p = 0; p < periods.length; p++) {
      if (result2[days[t]][p] === 0) {
        if (count > 1) {
          result2[days[t]][p] = count;
        }
        if (p === 11 && result2[days[t]][11] > 1) {
          for (let h = 11; h > (p - count + 1); h--) {
            result2[days[t]][h] = 0;
          }
          if (result2[days[t]][p - count + 1] !== 1) {
            result2[days[t]][p - count + 1] = count;
          }
        }
        count++;
      } else {
        if (count > 1) {
          for (let h = p - 1; h > (p - count + 1); h--) {
            result2[days[t]][h] = 0;
          }
        }
        if (result2[days[t]][p - count + 1] !== 1) {
          result2[days[t]][p - count + 1] = count - 1;
        }

        count = 1;
      }
    }
  }
  var checkArray = [];

  for (let c = 0; c < 12; c++) {
    for (let g = 0; g < days.length; g++) {
      if (result2[days[g]][c] !== 0) {
        where.push(result2[days[g]][c]);
        checkArray.push(result2[days[g]][c]);
      }
    }
  }

  var count = 7;
  var compareString = checkArray.slice(0, count);
  // console.log('Check Array String: '  + checkArray);
  // console.log('Length of Check Array String: '  + checkArray.length);
  // console.log('Compare String: '  + compareString);
  // console.log('Type of Compare String: '  + compareString[0]);
  var currentString;
  var whereDay = [];

  for (let x = 0; x < compareString.length; x++) {
    whereDay.push(days[x]);
  }

  for (let y = 1; y < 12; y++) {
    // console.log('Compare String: '  + compareString);

    let f = 7;
    for (let v = 0;  v < compareString.length; v++) {
      if (compareString[v] !== 1 && compareString[v] !== 9) {
        f--;
      }
    }
    // console.log('Count: ' + count + ' f: ' + f);
    currentString = checkArray.slice(count, count + f);
    count = count + f;
    // console.log('pre Current String: '  + currentString);
    for (let r = 0; r < 7; r++) {
      // let currentIdx = currentString[r];
      let compareIdx = compareString[r];

      if (compareIdx > 1 && compareIdx < 9) {
        if (compareIdx !== 2) {
          currentString.splice(r, 0, compareIdx - 1);
        } else {
          currentString.splice(r, 0, 9);
        }
      } else {
        whereDay.push(days[r]);
        // console.log('Push ' + days[r]);
      }
    }
    // console.log('Current String: ' + currentString);

    compareString = currentString;
    // console.log('Compare String: '  + compareString);

  }

  // console.log('Length of List of Days: ' + whereDay.length);
  // console.log('List of Days: ' + whereDay);

  res.render('school/assignTeacherToSubject', {
    subjects: subjects,
    teachers: listTeacher,
    selectedSubject: selectedSubject,
    selectedTeacher: selectedTeacher,
    weekDetails: displayedResult,
    where: where,
    whereDay: whereDay,
    csrfToken: req.csrfToken()
  })
}

module.exports.assignTeacherToSubject = function (req, res) {
  res.redirect('/school/searchForTeacher');
}
