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

var uglyCss;

$('#clean').onclick = function(){
  sortRules();
}

$('#indent').onchange = function(){
  sortRules();
}

$('#revert').onclick = function(){
  $('#textarea').value = uglyCss || $('#textarea').value;
}

$('#rm-whitespace').onclick = function(){
  $('#textarea').value = $('#textarea').value.replace(/\n/g,'');
}

$('#copy').onclick = function(){
  $('#textarea').select();
  document.execCommand('copy');
}

function cutComments(rules){

}

function sortRules(){
  var rules = $('#textarea').value;
  uglyCss = uglyCss || rules;
  rules = rules.replace(/\n/g,'');
  // rules = cutComments(rules);
  $('#textarea').value = sortMediaQueries(rules);
}

function indent(){
  var indent = ' '.repeat($('#indent').value);
  return indent;
}

function sortRulesSet(rules){
  rules = createRulesArray(rules);
  rules = sortProps(rules);
  rules = rules.sort();
  rules = bringUpTypeSelectors(rules);
  return rules.join('\n');
}

function sortMediaQueries(rules){
  rules = rules.split('@');
  var noMediaRules = sortRulesSet(rules[0]);
  var mediaRules = rules.slice(1,rules.length);
  mediaRules = mediaRules.map(function(query,index){
    var rule = query.slice(query.indexOf('{')+1,query.length).trim();
    rule = rule.slice(0,rule.length-1);
    query = query.slice(0,query.indexOf('{')).trim();
    var rulesSet = sortRulesSet(rule)
    rulesSet = rulesSet.replace(/\n/g,'\n' + indent());
    rulesSet = (rulesSet.substr(0,rulesSet.length - $('#indent').value - 1));

    return '\n@' + query + ' {\n' + indent() + rulesSet + '\n}\n';
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

function separateProps(props){
  if ( props.includes('/*')){
    splitProps = preservePropComments(props);
  } else {
    props = props.split(';');
    splitProps = props.filter(function(prop){
      prop = prop.replace(/\s/g,'');
      return !!prop
    })
  }

  return splitProps; 
}

function preservePropComments(props){
  var splitProps = [];
  while ( props.includes('/*')){
    var match = props.match(/\w+:\s*\w+;\s*\/\*.+\*\//)
    var comment = props.slice(match.index,props.indexOf('*/') + 2).trim();
    splitProps.push(comment);
    props = props.replace(comment,'');
  }

  splitProps = splitProps.map(function(prop){
    pair = [];
    pair[0] = prop.substring(0,prop.indexOf(':',0)).trim()
    pair[1] = prop.substring(prop.indexOf(':',0),prop.length).trim()
    return pair;
  })

  return splitProps.concat(props);

}


function sortProps(rules){
  rules = rules.map(function(rule){
    var key = rule[0].replace(/\s*,\s*/g,',\n');
    var props = separateProps(rule[1]);

    props = formatProps(props)

    props = props.sort();

    props = props.map(function(prop){
      if (!!prop){
        return indent() + prop + ';\n';
      }
      
    })

    rule = key + ' {\n' + props.join('') + '}\n';

    return rule;
  })

  return rules
}

function formatProps(props){
  var allProps = [];
  props = props.map(function(prop){
    if ( typeof prop === 'string'){
      prop = prop.split(':');
      prop = prop.map(function(propValPair){
        return propValPair.trim();
      })
      prop = prop.join(': ');
      prop = prop.split(';');
      prop.forEach(function(prop){
        allProps.push(prop.trim());
      })
    } else {
      allProps.push(prop.join(''));

    }
    return prop;
  })
  console.log(allProps)
  return allProps;
}

function createRulesArray(css){
  css = css.split('}');
  var selectors = css.map(function(rule){
    var selector = rule.split('{')[0].trim();
    var props = rule.split('{')[1];
    return [selector, props];
  })

  selectors = selectors.filter(function(selector){
    return !!selector[1]  // Filters out empty rules
  })

  return selectors;
}