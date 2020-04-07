exports.getDate = function(){
var date = new Date();

var options={
  weekday:"long",
  day:"numeric",
  month:"long"
};

return date.toLocaleDateString("en-US",options);
}
