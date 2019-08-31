var positions = [];
var canvas = $("#canvas");
canvas.width = 1500;
canvas.height = 750;
var cursor = $("#chart").get(0).getContext('2d');
const iterations = 1000;
var xMax = 8000;
var xMin = 12000;
var yExtrema = 10000;
var Position = function (cp, ls, quantity, strike, premium){
  var pos = {};
  pos.cp = cp;
  pos.ls = ls;
  pos.quantity = parseInt(quantity);
  pos.strike = parseFloat(strike);
  pos.premium = parseFloat(premium);
  return pos;
};

var positionVal = function (position, current){
  if (position.cp =="call")
    return (position.ls=="long"? 1 : -1) * position.quantity*(Math.max(current - position.strike, 0) - position.premium);
  if (position.cp =="put")
    return (position.ls=="long"? 1 : -1) * position.quantity*(Math.max(position.strike - current, 0) - position.premium);
  if (position.cp=="stock")
    return (position.ls=="long"? 1 : -1) * position.quantity*(current - position.premium);
};

var totalVal = function(current){
  var val = 0;
  for(var i = 0; i < positions.length; i++)
    val += positionVal(positions[i], current);
  return val;
}

$("#add").click(function(){
    var lst = $("#list");
    //creade default position and add it to #list
    lst.append( "<li><select class=\"cp\" name=\"Call/Put\">" +
    "<option value=\"call\">Call</option>" +
    "<option value=\"put\">Put</option>" +
    "<option value=\"stock\" class=\"stock\">Stock</option>" +
    "</select>&nbsp;&nbsp;" +
    "<select class=\"ls\">" +
    "<option value=\"long\">Long</option>" +
    "<option value=\"short\">Short</option>" +
    "</select>&nbsp;&nbsp;" +
    "Quantity: <input type=\"text\" class=\"quantity\" value=\"0\">&nbsp;&nbsp;" +
    "<ruby class=\"strike\">Strike: <input type=\"text\" class=\"strike\" value=\"0\">&nbsp;&nbsp;</ruby>" +
    "Initial Price: <input type=\"text\" class=\"premium\" value=\"0\">" +
    "<button type=\"button\" class=\"remove\">Remove</button>" +
    "</li>");
    //set the onclick of the remove button
    var elms = $("#list > li > .remove");
    var elm = elms[elms.length-1];
    elm.onclick = function(){
      this.parentElement.remove();
    };
    var selects = $("#list > li > .cp");
    var select = selects[selects.length-1];
    select.onclick = function(){
      if (this.value==="stock")
        this.parentElement.querySelector(".strike").hidden = true;
      else
        this.parentElement.querySelector(".strike").hidden = false;
    };
});

$("#start").click(function(){
  positions.length = 0;
  var pos = $("#list").children();
  //construct a new position from each
  $.each(pos, function(index, val){
    let cp = val.querySelector('.cp').value;
    let ls = val.querySelector('.ls').value;
    let quantity = val.querySelector('.quantity').value;
    let strike = val.querySelector('.strike > input').value;
    let premium = val.querySelector('.premium').value;
    let position = Position(cp, ls, quantity, strike, premium);
    positions.push(position);
  });
  //draw the chart
  graph();
});

function graph(){
  xMax = parseFloat($("#xMax")[0].value);
  xMin = parseFloat($("#xMin")[0].value);
  yExtrema = parseFloat($("#yExt")[0].value);
  var xFrequency = parseInt($("#xFrq")[0].value);
  var yFrequency = parseInt($("#yFrq")[0].value);
  const xMid = (xMax-xMin)/2 + xMin;
  const yMid = 0;
  //clear the canvas
  cursor.clearRect(0,0,1500,750);
  cursor.beginPath();
  //scalars 0-1
  var xPct, yPct;
  //these are input/output into the function
  var xMath, yMath;
  //these represent actual locations on the canvas
  var xPos, yPos;
  //add axes
  cursor.moveTo(0, canvas.height/2);
  cursor.lineTo(canvas.width, canvas.height/2);
  cursor.moveTo(canvas.width/2, 0);
  cursor.lineTo(canvas.width/2, canvas.height);
  cursor.strokeText("Profit", canvas.width/2-25, 20);
  cursor.strokeText("Price", 20, canvas.height/2+12);
  //Add hash marks along the axes
  for (var i = xMin; i < xMax; i+=xFrequency)
    drawHash(i, yMid, true);
  for (var i = yFrequency; i < yExtrema; i+=yFrequency){
    drawHash(xMid, i, false);
    drawHash(xMid, -i, false);
  }
  for (var i = 0; i < iterations; i++){
    xPct = i /(iterations-1);
    xMath = xPct * (xMax-xMin) + xMin;
    yMath = totalVal(xMath);
    yPct = (yMath+yExtrema)/(2*yExtrema);
    xPos = xPct*canvas.width;
    yPos = canvas.height - yPct*canvas.height;
    if (i==0)
      cursor.moveTo(xPos, yPos);
    cursor.lineTo(xPos, yPos);
  }
  cursor.stroke();
}

function drawHash(xMath, yMath, bool){
  //bool is true represents a hash along the x axis false is along the y
  //0-1 multiplid by canvas dimensions to get positions
  var xPct, yPct;
  //these represent actual locations on the canvas
  var xPos, yPos;
  xPct = (xMath - xMin)/(xMax-xMin);
  xPos = xPct*canvas.width;
  yPct = (yMath+yExtrema)/(2*yExtrema);
  yPos = canvas.height - yPct*canvas.height;
  cursor.strokeText(String(bool? xMath : " "+yMath), xPos, yPos);
  cursor.moveTo(xPos, yPos);
  cursor.lineTo(xPos+ (bool? 0: -10), yPos + (bool? 10: 0));
  cursor.stroke()
}
