function $(elName){                   // jQuery-esque shortcut
  el = findEl(elName)
  if ( el === null ){
    throw '"Element ' + elName + ' not found."';
  } else {
    return el;
  }
}

function findEl(el){
  var symbol = el.split('')[0];
  if ( symbol === '#' ){
    return (document.getElementById(el.slice(1, el.length)));
  } else if ( symbol === '.' ){
    return (document.getElementByClassName(el.slice(1, el.length)));
  } else {
    return document.getElementsByTagName(el);
  }
}

$('#clean').onclick = function(){
  console.log('click');
}


window.addEventListener('input', function(event) {
  // console.log(captureInput(event));
},false);

function captureInput(event){
  return event.target.innerHTML;
}

