
  /**
   * Consumes a list of todos and a list of strings, 
   * and returns the subset of those todos whose "title" attribute 
   * contains the strings. Each string is matched independently. 
   * Case-insensitive.
   * 
   * @param {Array<Todo>} todoList
   * @param {Array<string>} loq
   * @return {Array<Todo>} 
   */
 function todoListFilterByTitleQueries(todoList, loq) {
    if (todoList.length === 0) {
      return []
    } else if (loq.length === 0) {
      return todoList
    } else {
      const query = loq[0]
      const next = todoListFilterByTitleQuery(todoList, query)
      return todoListFilterByTitleQueries(next, loq.slice(1))
    }
  }

  /**
   * Consumes a list of todos and a string, and produces the subset
   * of those todos whose titles contain that string. Case-insensitive.
   *
   * @param {Array<Todo>} todoList
   * @param {string} query
   * @return {Array<Todo>} 
   */
  function todoListFilterByTitleQuery(todoList, query) {
    const re = new RegExp("^.*"+query) //+ query)
    return todoList.filter((todo) => re.test(todo.title))
  }

  export { todoListFilterByTitleQueries, todoListFilterByTitleQuery}