/** core language functions */

/**
 * parseInstruction
 * @description
 * consumes a list of tokens and parses them according to the 
 * following insanely simple (still simplified) grammar:
 * [ expr ] ::= [ command  ] [ arg ] 
 * [ command  ] ::=  :[a-zA-Z_] 
 * [ arg ] ::=  ["][ ^" ]+["]  

 * Note that proper validation of output is TODO.
 * @param {Array} l
 * @return {(Array[ String, Array<String>  ])|Boolean} 
 */
function parseInstruction(l) {
  function validSyntaxP(command) {
    return command[0] === ":";
  }

  function atLeastOneElementP(l) {
    return l.length > 0;
  }

  if (!atLeastOneElementP(l)) return false;

  const [command, ...arglist] = l;

  const arglistProper = arglist.map(stripQuotingArtefacts);

  return validSyntaxP(command) ? [command.substring(1), arglistProper] : false;
}

/**
 * consumes a string which may or may not be double-quoted. if it is,
 * produces the same string without the doubel quotes. if it's not,
 * produces the unchanged string.
 *
 * @param {string} str
 * @return {string}
 */
function stripQuotingArtefacts(str) {
  return str.slice(0, 1) === '"' ? /"(.+)"/.exec(str)[1] : str;
}

/**
 * @description
 * Consumes a string representing a todoDSL expr and tokenizes it,
 * getting double-quote- and whitespace-delimited parts, in that order.
 *
 * @param {String} s
 * @return {Array<String>}
 */
function tokenizeInstruction(s) {
  const tokens = s.match(/"([^"]+)"|[\S]+/g);
  return tokens !== null ? tokens : [];
}

/** SUPPLEMENTARY CODE FOR todoDSL.
 * TODO: how can I refactor this out of TodoApp? I want it in todoDSL, but it has
 * these calls to the various state Hooks...
 */

// note that every command should return something truthy if it succeeds, 'false' otherwise.
const commandDict = {
  help: {
    fun: doHelp,
    usage: ":help < list-commands | <cmd> | hide >",
  },
  alert: {
    fun: doAlert,
    usage: ':alert < [^"]* >',
  },
  filter: {
    fun: doFilter,
    usage: ":filter < lambda(x) -> boolean >",
  },
  setuser: {
    fun: doSetUser,
    usage: ":setuser < int > ",
  },
  show: {
    fun: doShow,
    usage: ":show < completed | todo | all >",
  },
  add: {
    fun: doAdd,
    usage: ':add < [^"]+ >',
  },
};

/**
 * consumes a strings which may or may not be a valid todoDSL expression,
 * and a complete set of getters and setters which the commands can use if
 * they need to these commands have many side-effects.)
 * if it's a valid expression and it executes successfully,  produces `true`;
 * if not, produces `false`. As a side effect, can do anything todoDSL can do.
 *
 * @param {string} str
 * @param {Object} gettersAndSetters
 * @modifies {tons of stuff}
 * @return {boolean}
 */
function evaluateCommand(str, gettersAndSetters) {
  function cleanUpDecorator(func) {
    gettersAndSetters["actionBar"]["setter"]({ actionString: ":" });
    return func;
  }

  function validCommandP(str) {
    return Object.keys(commandDict).includes(str);
  }

  const instruction = tokenizeInstruction(str);
  const lexedInstructionOrFalse = parseInstruction(instruction);
  if (!lexedInstructionOrFalse) return false;

  const [command, arglist] = lexedInstructionOrFalse;
  if (!validCommandP(command)) return false;

  const fun = commandDict[command]["fun"];

  const funWithCleanup = cleanUpDecorator(fun);

  if (command !== "help") gettersAndSetters["helpFacet"]["setter"]("");

  return fun !== undefined ? funWithCleanup(arglist, gettersAndSetters) : false;
}

/** doAdd
 * todoDSL command. Consumes an array of strings and the getters and setters
 * of a todoApp, and produces a new todoList with a new todo whose title
 * corresponds to that array of strings. As a side-effect, it updates the todoList State.
 *
 * @param {Array<String>} arglist
 * @param {Object} gettersAndSetters
 * @modifies {todoList}
 * @return {Array<Todo>}
 */
function doAdd(arglist, gettersAndSetters) {
  //TODO upgrade todoDSL so it can handle quoted strings!
  const newContent = arglist.join(" ");

  // WARNING/TODO dangerous assumption: we assume that we can never
  // delete todos, and that all users share the same state.

  // This is functionality that should be governed
  // by a database, but in the meantime...
  const nextId = gettersAndSetters.todoList.getter.length + 1;

  const newTodo = {
    id: nextId,
    title: newContent,
    completed: false,
    userId: gettersAndSetters.settings.getter.userId,
  };

  let todoListCopy = gettersAndSetters.todoList.getter.slice();
  todoListCopy.push(newTodo);
  gettersAndSetters.todoList.setter(todoListCopy);
  return true;
}

/** doShow
 * todoDSL command. consumes an array of strings `arglist` and the getters and setters
 * of a todoApp, and produces a copy of the Settings state object in which `showFilter`
 * is set to a predicate corresponding semantically to arglist[0]. As a side-effect, updates
 * Settings with the new object.
 *
 * @param {Array<string>} arglist
 * @modifies{settings}
 * @return {Object}
 */

function doShow(arglist, gettersAndSetters) {
  const predDict = {
    all: (x) => true,
    completed: (x) => x.completed,
    todo: (x) => !x.completed,
  };
  const predicate = predDict[arglist];
  if (predicate === undefined) return false;

  return setSettings("showPredicate", predicate, gettersAndSetters)
}

/** doHelp
 * todoDSL command. consumes an array of strings `arglist` and
 * the getters and setters of a TodoApp, and produces the corresponding
 * helpFacet value.
 * As a side-effect, updates helpFacet with this value.
 * Note that this can set the helpFacet to nonsense; this is
 * intended behaviour.
 *
 * @param {Array<string>} arglist
 * @param {Object} gettersAndSetters
 * @modifies {helpFacet}
 * @return {string}
 */
function doHelp(arglist, gettersAndSetters) {
  const res = arglist.length === 0 ? "help" : arglist[0];
  gettersAndSetters["helpFacet"]["setter"](res);
  return res;
}

/**
 * consumes an array of strings `arglist` and produces the
 * message that they represent. as a sideeffect, fires an
 * alert with this message.
 *
 * @param {Array<string>} arglist
 * @return {string}
 */
function doAlert(arglist) {
  const message = arglist.reduce((acc, x) => acc + " " + x, "");
  alert(message);
  return message;
}

/*
 * Consumes an array of strings `arglist` and the getters and setters
 * of a todoApp, and produces a copy of the global
 * state object `settings` in which the userId has been set to `arglist[0]`.
 * ASSUMES that `arglist[0]` is a valid input for parseInt. As a side-effect,
 * updates `settings` with the new object.
 *
 * @param {Array<string>} arglist
 * @param {Object} gettersAndSetters
 * @modifies {settings}
 * @return {Object}
 */
function doSetUser(arglist, gettersAndSetters) {
  const userId = parseInt(arglist[0]); // discard the rest of the arglist
  return isNaN(userId) ? false : setSettings('userId', parseInt(userId), gettersAndSetters)
}

/**
 * Consumes an array of strings `arglist` and the getters and setters
 * of a todoApp, and produces a copy of the global
 * state variable `settings` in which the key `filter` has as a value the predicate
 * reporesented by the arglist. As a side-effect, updates `settings` with the new object.
 *
 * example:
 * doFilter(["(x)", "=>", "x.completed"]) -> (x) => x.completed
 * @param {Array<string>} arglist
 * @param {Object} gettersAndSetters
 * @modifies {settings}
 * @return {Object}
 */
function doFilter(arglist, gettersAndSetters) {
  const predicate = arglist.join(" ");
  return setSettings("filter", predicate, gettersAndSetters)
}

/**
 * Consumes a key, a value, and a TodoApp's getters and setters, and produces a 
 * copy of a TodoApp's `settings` state variable in which that key has its 
 * value set to that value. As a side-effect, sets the TodoApp's `settings` to 
 * the value of the copy.
 *
 * @param {string} key
 * @param {any} value
 * @param {Object} gettersAndSetters
 * @return {Object} 
 */
function setSettings(key, value, gettersAndSetters) {
  let settingsCopy = { ...gettersAndSetters.settings.getter };
  settingsCopy[key] = value;
  gettersAndSetters.settings.setter(settingsCopy)
  return settingsCopy
}

export {
  parseInstruction,
  tokenizeInstruction,
  stripQuotingArtefacts,
  commandDict,
  evaluateCommand,
};
