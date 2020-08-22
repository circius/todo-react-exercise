/**
 * parseInstruction
 * @description
 * consumes a list of tokens and parses them according to the 
 * following insanely simple grammar:
 * [ expr ] ::= [ command  ] [ arg ] 
 * [ command  ] ::=  :[a-zA-Z_] 
 * [ arg ] ::=  [^"]* 

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

  const arglistProper = arglist.map(stripQuotingArtefacts)

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
  return str.slice(0,1) === "\"" ?  /"(.+)"/.exec(str)[1] : str 
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
  const tokens = s.match(/"([^"]+)"|[\S]+/g)
  return tokens !== null ? tokens : []
}

export { parseInstruction, tokenizeInstruction, stripQuotingArtefacts };
