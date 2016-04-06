// TODO this entire module lol
var moment = require("moment");
var fs     = require("fs");
var mkdirp = require("mkdirp");
var path   = require("path");

var level_strings = {
  0: "SEVERE ",
  1: "Error  ",
  2: "Warning",
  3: "Info   ",
  4: "Debug  "
}

module.exports.init = function(logs_dir, email) {
  console.log("Logfile Directory is " + logs_dir);

  var saveMessage = function(level, tag, message) {
    var date_string = moment().format("YY-MM-DD HH:mm:ss");
    var date_parts = date_string.split(" ")[0].split("-");
    var filepath = path.join(logs_dir, date_parts[0], date_parts[1]);
    var filename = date_parts[2]+".log";
    var string_to_write = date_string + " - " + level_strings[level] + " - " + tag + " - " + message;
    console.log(string_to_write);
    fs.exists(path.join(filepath, filename), function(fileexists) {
      if(fileexists) fs.appendFile(path.join(filepath, filename), string_to_write + "\n");
      else { // log file doesn't exists
        fs.exists(filepath, function(folderexists) {
          if (folderexists) {
            console.log("Creating new log file " + filename);
            fs.appendFile(path.join(filepath, filename), string_to_write + "\n");
          } else { // log folder doesn't exist
            console.log("Creating new log folder " + filepath)
            mkdirp(filepath, function() {
              console.log("Creating new log file " + filename);
              fs.appendFile(path.join(filepath, filename), string_to_write + "\n");
            });
          }
        });
      }
    });
  };

  return function(level, tag, message, alert_admin) {
    if (alert_admin) console.log("Admin alert!");
    saveMessage(level, tag, message);
  }
};
