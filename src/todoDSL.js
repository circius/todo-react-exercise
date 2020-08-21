/**
 * parseInstruction
 * @description
 * consumes a list of tokens and parses them according to the 
 * following insanely simple grammar:
 * <expr> ::= <command> { <arg> }
 * <command> ::= :{ [a-zA-Z_] }
 * <arg> ::= { [^"]* }

 * Note that proper validation of output is TODO.
 * @param {Array} l
 * @return {(Array<String, Array<String>>)|Boolean} 
 */
function parseInstruction(l) {
  function validSyntaxP(command){
    return command[0] === ":";
  }
  
  if (l.length === 0) return false;

  const [command, ...arglist] = l

  return validSyntaxP(command) ? [command.substring(1), arglist] : false
}

/**
 * @description
 * Consumes a string representing a todoDSL expr and tokenizes it
 * according to the pattern <token><whitespace><token>.
 *
 * @param {String} s
 * @return {Array>String>} 
 */
function tokenizeInstruction(s) {
  return s === "" ? [] : s.split(/\s+/)
}

export { parseInstruction, tokenizeInstruction }