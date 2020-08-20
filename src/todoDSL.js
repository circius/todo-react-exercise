function lexInstruction(l) {
  function validSyntaxP(command){
    return command[0] === ":";
  }
  
  if (l.length === 0) return false;

  const [command, ...arglist] = l

  return validSyntaxP(command) ? [command.substring(1), arglist] : false
}

function parseInstruction(s) {
  return s === "" ? [] : s.split(/\s+/)
}

export { lexInstruction, parseInstruction }