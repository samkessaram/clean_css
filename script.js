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
  $('#output').value = sortRules($('#input').value.replace(/\n/g,''));
}

function sortRules(rawCss){
  return sortMediaSpecificRules(rawCss);
}

function sortRulesSet(rawCss){
  var rules = createRulesArray(rawCss);
  rules = sortProps(rules);
  rules = rules.sort();
  rules = bringUpTypeSelectors(rules);
  return rules.join('\n');
}

function sortMediaSpecificRules(rules){
  rules = rules.split('@');
  var noMediaRules = sortRulesSet(rules[0]);
  var mediaRules = rules.slice(1,rules.length);
  mediaRules = mediaRules.map(function(query){
    var rule = query.slice(query.indexOf('{')+1,query.length).trim();
    rule = rule.slice(0,rule.length-1);
    query = query.slice(0,query.indexOf('{'))
    return '\n@' + query + ' {\n' + sortRulesSet(rule) + '}\n';
  })

  return noMediaRules + mediaRules.join('');
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

    rule = key + ' {\n' + vals.join('') + '}\n';

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

  selectors = selectors.filter(function(selector){
    return !!selector[1]
  })

  return selectors;
}