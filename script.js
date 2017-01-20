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

$('#clean').onclick = function captureCss(){
  formatCss($('#input').value.replace(/\n/g,''));
}

function formatCss(css){
  var rules = createRulesArray(css);
  rules = rules.filter(function(rule){
    return !!rule[1]
  })
  rules = rules.sort();
  rules = rules.map(function(rule){

    var props = rule[1].split(';')

    props = props.filter(function(prop){
      return !!prop
    })

    props = props.map(function(prop){
      return '&nbsp;&nbsp;' + prop + ';<br>';
    })

    rule = [rule[0] + ' {<br>', props.join('') + '}<br><br>'];
    return rule;
  })

  printCss(rules);
}

function createRulesArray(css){
  css = css.split('}');
  var rules = css.map(function(rule){
    var selector = rule.split('{')[0];
    var props = rule.split('{')[1];
    return [selector, props];
  })

  return rules;
}

function printCss(rules){
  var css = rules.map(function(rule){
    return rule.join('');
  })

  css = css.join('');

  $('#output').innerHTML = css;
}