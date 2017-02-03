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

// $('#indent').onchange = function(){ // change this to only auto adjust indent after initial sort 
//   sortRules();                      
// }

$('#revert').onclick = function(){
  $('#textarea').value = uglyCss || $('#textarea').value;
}

// $('#rm-whitespace').onclick = function(){
//   uglyCss = uglyCss || $('#textarea').value;
//   $('#textarea').value = $('#textarea').value.replace(/\n/g,'');
// }

$('#copy').onclick = function(){
  $('#textarea').select();
  document.execCommand('copy');
}

function deleteComments(rules){
  rules = rules.split('/*');
  rules = rules.map(function(el){
    var i = el.indexOf('*/');
    if (i > -1){
      el = el.substring(i + 2,el.length)
    };
    return el
  })
  return rules.join('')
}

function sortRules(){
  var rules = $('#textarea').value;
  uglyCss = uglyCss || rules;
  if (!$('#preserveComments').checked){
    rules = deleteComments(rules)
  }
  rules = rules.replace(/\n/g,'');
  rules = separateMediaQueries(rules);

  var media = handleComments(rules.media)
  var mediaComments = media.comments;
  media = media.rules

  var nonMedia = handleComments(rules.nonMedia)
  var nonMediaComments = nonMedia.comments;
  nonMedia = nonMedia.rules;

  rules = sortRulesSet(nonMedia) + sortMediaRules(media);
  rules = insertComments(rules, mediaComments.concat(nonMediaComments))

  $('#textarea').value = rules;
}

function insertComments(rules, commentArr){
  commentArr = commentArr.forEach(function(coms){
    coms = coms.forEach(function(com){
      rules = rules.replace(com[0] + com, '/*' + com + '*/')
    })
  })

  return rules.replace('*/;','*/')
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
  rules = bringUpSpecialSelectors(rules);

  return rules.join('\n');
}

function createRulesArray(css){
  css = css.split('}');
  var rules = css.map(function(rule){
    var selector = rule.split('{')[0].trim();
    var props = rule.split('{')[1];
    return [selector, props];
  })

  rules = rules.filter(function(selector){
    return !!selector[1]
  })

  return rules;
}

function handleComments(rules){
  var rulesCopy = rules;
  var savedComments = [];
  var lonerComments = [];
  var familyComments = [];

  while ( rules.indexOf('/*') > -1  ){
    var lonerCom = rules.match(/\/\*[^*]*[^/]*\*\//);
    var familyCom = rules.match(/\/\*[^*][^/]{(.*?)}(.*?)\*\//);
    var propCom = rules.match(/{[^}]*(\/\*[^*]*[^/]*\*\/)/);

    if (!!lonerCom && !propCom){
      rules = rules.replace(lonerCom[0],'')
      rulesCopy = rulesCopy.replace(lonerCom[0],'');
    } 

    if ( !!familyCom ){
      // savedComments.push(familyCom[0]);
      rules = rules.replace(familyCom[0],'');
      rulesCopy = rulesCopy.replace(familyCom[0],'');
    }

    if (!!propCom) {
      savedComments.push(propCom);
      rules = rules.replace(propCom[0],'');
    }
  }

  savedComments = savedComments.map(function(coms){
    coms = coms[0].split('/*')
    coms.shift()
    coms = coms.map(function(com){
      com = com.substring(0,com.indexOf('*/'))
      rulesCopy = rulesCopy.replace('/*' + com + '*/', com[0] + com.trim() + ';') // flagging comments so similar rules aren't affected
      // using substring to keep preserve sort
      com = com.trim()
      return com
    })
    return coms
  })

  return { 'rules':rulesCopy, 'comments':savedComments}
  
}

function sortProps(rules){
  rules = rules.map(function(rule){
    var selector = rule[0];
    var props = rule[1];

    // Custom alpha sort to preserve possible upcased comments

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
  console.log(rules)
  return rules
}

function trimProps(props){
  props = props.split(';')
  props = props.map(function(pair){
    if (pair[0] !== pair[1]){
      pair = pair.split(':');
      pair = pair.map(function(half){
        return half.trim()
      })
      return pair.join(': ')
    } else {
      return pair
    }
    
  })

  props = props.filter(function(prop){
    if (!!prop){
      return prop;
    }
  })

  return props;
}

function separateMediaQueries(rules){
  rules = rules.split('@media');
  var noMediaRules = rules[0];
  var mediaRules = rules.slice(1,rules.length);

  return { 'nonMedia': noMediaRules, 'media': mediaRules }
}

function sortMediaRules(rules){
  rules = rules.map(function(query,index){
    var rule = query.slice(query.indexOf('{')+1,query.length).trim();
    rule = rule.slice(0,rule.length-1);
    query = query.slice(0,query.indexOf('{')).trim();
    var rulesSet = sortRulesSet(rule)
    rulesSet = rulesSet.replace(/\n/g,'\n' + indent());
    rulesSet = (rulesSet.substr(0,rulesSet.length - $('#indent').value - 1));

    return '\n@media' + query + ' {\n' + indent() + rulesSet + '\n}\n';
  })

  return rules.join('');
}

function bringUpSpecialSelectors(rules){
  var i = rules.findIndex(function(rule){
    return rule[0].match(/^[a-z]/)
  })

  if ( i > -1 ){
    var typeSelectors = rules.slice(i,rules.length);
    rules.splice(i,typeSelectors.length); // splice is destructive;
    rules = typeSelectors.concat(rules);
  }

  i = rules.findIndex(function(rule){
    return rule.match(/^html/)
  })

  if ( i > -1 ){
    var html = rules.slice(i,i+1);
    rules.splice(i,html.length); // splice is destructive;
    rules = html.concat(rules);
  }

  i = rules.findIndex(function(rule){
    return rule.match(/^\*/)
  })

  if ( i > -1 ){
    var universal = rules.slice(i,i+1);
    rules.splice(i,universal.length); // splice is destructive;
    rules = universal.concat(rules);
  }


  return rules
  
}