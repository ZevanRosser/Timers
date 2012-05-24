$(function() {

  var body = $("body");

  // https://gist.github.com/1308368
  function uuid(a, b) {
    for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
    return b;
  }

  function slashDate(date) {
    return date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + "/" + date.getHours() + "/" + date.getMinutes();
  }

  function unslashDate(date) {
    var date = date.split("/");
    var newDate = new Date();
    newDate.setMonth(date[0]);
    newDate.setDate(date[1]);
    newDate.setFullYear(date[2]);
    newDate.setHours(date[3]);
    newDate.setMinutes(date[4]);
    newDate.setSeconds(0);
    return newDate;
  }
  
  //http://www.htmlgoodies.com/html5/javascript/calculating-the-difference-between-two-dates-in-javascript.html#fbid=LDmOjlhVJsF
  function dateDifference(a, b) {
    var time = {};
    var diff = a.getTime() - b.getTime();
    if (diff < 0) diff = 0;
    diff /= 1000;
    time.seconds = Math.floor(diff % 60);
    diff /= 60;
    time.minutes = Math.floor(diff % 60);
    diff /= 60;
    time.hours = Math.floor(diff % 24);
    time.days = Math.floor(diff / 24);
    return time;
  }

  function formateTime(time) {
    var date = "in ";
    if (time.days > 0) date += time.days + ((time.days == 1) ? " day " : " days ");
    if (time.hours > 0) date += time.hours + ((time.hours == 1) ? " hour " : " hours ");
    if (time.minutes > 0) date += time.minutes + ((time.minutes == 1) ? " minute " : " minutes ");  
    return date;
  }

  function Timers() {
    var self = this;
    var timerData = [];
    var date = new Date();
    date.setSeconds(0);

    self.elem = $("#timers").selectAll(self).appendTo(body);

    if (localStorage.timers) {
      timerData = JSON.parse(localStorage.timers);
      var leng = timerData.length;
      for (var i = 0; i < leng; i++) {
        var timer = new Timer(timerData[i]);
        timer.elem.appendTo(self.timers);
      }
    }

    function save() {
      localStorage.timers = JSON.stringify(timerData);
    }

    for (var i = 1; i <= 31; i++) {
      self.days.append(i).last().attr("value", i);
    }
    for (var i = 2012; i <= 2050; i++) {
      self.years.append(i).last().attr("value", i);
    }
    for (var i = 1; i <= 12; i++) {
      self.hours.append((i < 10) ? "0" + i : i).last().attr("value", i);
    }
    for (var i = 0; i < 60; i++) {
      self.minutes.append((i < 10) ? "0" + i : i).last().attr("value", i);
    }

    self.month.val(date.getMonth());
    self.day.val(date.getDate());
    self.year.val(date.getYear());
    self.hour.val(date.getHours() % 12);
    self.minute.val(date.getMinutes());
    
    if (date.getHours() > 11) {
      self.ampm.val("pm");
    } else {
      self.ampm.val("am");
    }

    $("select").change(function() {
      var hourOffset = 0;
      // rework
      if (self.ampm.val() == "pm" && self.hour.val() != 12) {
        hourOffset = 12;
      } else if (self.ampm.val() == "am") {
        if (self.hour.val() == 12) {
          hourOffset = 12;
        }
      }

      date.setHours(parseInt(self.hour.val()) + hourOffset);
      date.setMinutes(self.minute.val());
      date.setMonth(self.month.val());
      date.setDate(self.day.val());
      date.setFullYear(self.year.val());

    }).first().change();

    self.addTimer.submit(function(e) {
      e.preventDefault();
      var note = $.trim(self.noteValue.val());
      if (note.length > 0) {
        var timer = new Timer({
          id: uuid(),
          note: note,
          date: slashDate(date)
        });
        timer.elem.prependTo(self.timers);
        timerData.push(timer.json);
        save();
      }
    });

    self.removeTimer = function(id) {
      for (var i = 0; i < timerData.length; i++) {
        if (timerData[i].id == id) {
          timerData.splice(i, 1);
          save();
          break;
        }
      }
    };

  }

  function Timer(params) {
    this.json = params;
    this.elem = $("#timer").selectAll(this);
    this.note.text(params.note);
    this.targetDate = unslashDate(params.date);
    this.now = new Date();
    this.update();
    setInterval($.proxy(this.update, this), 1000 * 60);
    this.ex.click($.proxy(this.remove, this));
  }
  Timer.prototype.update = function() {
    this.now = new Date();
    if ((this.targetDate.getTime() - this.now.getTime()) <= 0) {
      this.timeLeft.text("no time left");
    } else {
      this.timeLeft.text(formateTime(dateDifference(this.targetDate, this.now)));
    }
  };
  Timer.prototype.remove = function() {
    this.elem.remove();
    timers.removeTimer(this.json.id);
  };


  var timers = new Timers();

});