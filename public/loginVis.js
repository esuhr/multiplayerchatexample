var w = 0;
function setup(){
   var canvas = createCanvas(500,300);
   canvas.parent("login-animation");
   w = random(250,200);
  noStroke();
}

function draw(){
    background(255);
    for(var i = 0;  i < 100;i++){
        var r1 = random(-10,10);
        var r2 = random(-10,10);
        fill(10,5);
        ellipse((width/2) + r1,(height/2) + r2,w,w);
    }
}