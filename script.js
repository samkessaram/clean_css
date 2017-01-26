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

$('#indent').onchange = function(){ // change this to only auto adjust indent after initial sort 
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

// function cutComments(rules){
// }

function sortRules(){
  var rules = $('#textarea').value;
  uglyCss = uglyCss || rules;
  rules = rules.replace(/\n/g,'');
  // rules = cutComments(rules);
  $('#textarea').value = seperateMediaQueries(rules);
}

function indent(){
  var indent = ' '.repeat($('#indent').value);
  return indent;
}

function splitRules(rules){
  rules = createRulesArray(rules);
  return trimRules(rules)
}

function indentRules(rules){
  rules = splitRules(rules);
  rules = joinRules(rules);
  return rules.join('\n');
}

function sortRulesSet(rules){
  rules = splitRules(rules)
  rules = sortProps(rules);
  rules = joinRules(rules);
  rules = rules.sort();
  rules = bringUpTypeSelectors(rules);

  return rules.join('\n');
}

function createRulesArray(css){
  // console.log(css.match(/\/\*.+\*\//));
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

function sortProps(rules){
  rules = rules.map(function(rule){
    var selector = rule[0];
    var props = rule[1];

    props = props.sort(function(a,b){
      if (a.toLowerCase().match(/\w+/)[0] < b.toLowerCase().match(/\w+/)[0]){
        return -1
      }
      if (a.toLowerCase().match(/\w+/)[0] > b.toLowerCase().match(/\w+/)[0]){
        return 1
      }
      if (a.toLowerCase().match(/\w+/)[0] === b.toLowerCase().match(/\w+/)[0]){
        return 0
      }
    });

    return rule;
  })

  return rules;
}

function joinRules(rules){
  rules = rules.map(function(rule){
    var selector = rule[0];
    var props = rule[1];
    props = props.map(function(prop){
      prop = indent() + prop;
      if ( prop.includes('/*')){
        return prop + '\n'
      } else {
        return prop + ';\n';
      }  
    })

    rule = selector + ' {\n' + props.join('') + '}\n';

    return rule;
  })

  return rules
}

function trimRules(rules){
  rules = rules.map(function(rule){
    var selector = rule[0].replace(/\s*,\s*/g,',\n');
    var props = trimProps(rule[1]);

    return [selector, props]
  })

  return rules
}

function trimProps(props){
  props = props.split(';')
  props = props.map(function(pair){
    pair = pair.split(':');
    pair = pair.map(function(half){
      return half.trim()
    })
    return pair.join(': ')
  })

  props = props.filter(function(prop){
    if (!!prop){
      return prop;
    }
  })

  return props;
}

function seperateMediaQueries(rules){
  rules = rules.split('@');
  var noMediaRules = rules[0];
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

  return sortRulesSet(noMediaRules) + mediaRules.join('');
}

function bringUpTypeSelectors(rules){
  var i = rules.findIndex(function(rule){
    return rule[0].match(/^[a-z]/)
  })

  if ( i > -1 ){
    var typeSelectors = rules.slice(i,rules.length);
    rules.splice(i,typeSelectors.length);
    return typeSelectors.concat(rules);
  } else {
    return rules
  }
  
}

function separateProps(props){
  if ( props.includes('/*')){
    props = preservePropComments(props);
  } else {
    props = props.split(';');
    props = props.filter(function(prop){
      prop = prop.replace(/\s/g,'');
      return !!prop
    })
  }

  return props; 
}

function preservePropComments(props){

  var splitProps = [];
  while ( props.includes('/*')){
    var match = props.match(/\/\*.+\*\//)

    var comment = props.slice(match.index,props.indexOf('*/') + 2).trim();

    if (!comment.match(/.+:.+;/)) {
      if(props.match(/\w+-?\w+:\s*\w+;\s*\/\*.+\*\/\s/)){
        comment = props.match(/\w+-?\w+:\s*\w+;\s*\/\*.+\*\/\s/)[0].split('*/')[0] + '*/';
      }
    }

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

