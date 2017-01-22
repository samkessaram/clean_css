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
  sortRules($('#input').value.replace(/\n/g,''));
}

function sortRules(css){
  var rules = createRulesArray(css);
  rules = rules.filter(function(selector){
    return !!selector[1]
  })
  rules = sortProps(rules);
  rules = rules.sort();
  rules = bringUpTypeSelectors(rules);
  printCss(rules);
}

function bringUpTypeSelectors(rules){
  var i = rules.findIndex(function(rule){
    return rule[0].match(/^[a-z]/)
  })
  var typeSelectors = rules.slice(i,rules.length);
  rules.splice(i,typeSelectors.length);
  return typeSelectors.concat(rules);
}

function sortProps(rules){
  rules = rules.map(function(rule){
    var key = rule[0].replace(/\s*,\s*/g,',\n');
    var vals = rule[1].split(';');

    vals = vals.filter(function(val){
      val = val.replace(/\s/g,'');
      return !!val
    })

    vals = formatProps(vals).sort();

    vals = vals.map(function(val){
      return '  ' + val + ';\n';
    })

    rule = [key + ' {\n' + vals.join('') + '}\n\n'];
    return rule;
  })

  return rules
}

function formatProps(props){
  props = props.map(function(prop){
    prop = prop.split(':');
    prop = prop.map(function(keyVal){
      return keyVal.trim();
    })
    prop = prop.join(': ');
    return prop;
  })
  return props;
}

function createRulesArray(css){
  css = css.split('}');
  var selectors = css.map(function(rule){
    var selector = rule.split('{')[0].trim();
    var props = rule.split('{')[1];
    return [selector, props];
  })

  return selectors;
}

function printCss(rules){
  var css = rules.map(function(rule){
    return rule.join('');
  })

  css = css.join('');

  $('#output').value = css;
}