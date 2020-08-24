
import * as M from "./todoListUtilityFunctions"

describe("unit tests for todoListFilterByTitleQuery", () => {
  it("matches anything if the query is the empty string", () => {
    const filteredList = M.todoListFilterByTitleQuery(todoList, "")
    expect(filteredList).toEqual(todoList)
  })
  it("matches the first todo if the query is 'del'", () => {
    const filteredList = M.todoListFilterByTitleQuery(todoList, "del")
    expect(filteredList[0].id).toStrictEqual(1)
  })
  it("has four matches for 'quia'", () => {
    const filteredList = M.todoListFilterByTitleQuery(todoList, "quia")
    expect(filteredList.length).toStrictEqual(4)
  })
})

describe("tests/spec for fuzzy-ish matching from action bar", () => {
    it("successfully does basic matching with a single term", () => {
      const filteredTestData = M.todoListFilterByTitleQueries(todoList, ["del"])
        expect(filteredTestData[0].id).toStrictEqual(1)
    })
    it("can narrow the search with a second term", () => {
      const filteredTestData = M.todoListFilterByTitleQueries(todoList, ["quia", "adipis"])
      expect(filteredTestData.length).toStrictEqual(1)
    })
    it("is case-insensitive", () => {
      const filteredTestData = M.todoListFilterByTitleQueries(todoList, ["del"])
      const filteredTestData2 = M.todoListFilterByTitleQueries(todoList, ["DEL"])
      expect(filteredTestData).toStrictEqual(filteredTestData2)
    })
})

const todoList = [
    {
      "userId": 1,
      "id": 1,
      "title": "delectus aut autem",
      "completed": false
    },
    {
      "userId": 1,
      "id": 2,
      "title": "quis ut nam facilis et officia qui",
      "completed": false
    },
    {
      "userId": 1,
      "id": 3,
      "title": "fugiat veniam minus",
      "completed": false
    },
    {
      "userId": 1,
      "id": 4,
      "title": "et porro tempora",
      "completed": true
    },
    {
      "userId": 1,
      "id": 5,
      "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
      "completed": false
    },
    {
      "userId": 1,
      "id": 6,
      "title": "qui ullam ratione quibusdam voluptatem quia omnis",
      "completed": false
    },
    {
      "userId": 1,
      "id": 7,
      "title": "illo expedita consequatur quia in",
      "completed": false
    },
    {
      "userId": 1,
      "id": 8,
      "title": "quo adipisci enim quam ut ab",
      "completed": true
    },
    {
      "userId": 1,
      "id": 9,
      "title": "molestiae perspiciatis ipsa",
      "completed": false
    },
    {
      "userId": 1,
      "id": 10,
      "title": "illo est ratione doloremque quia maiores aut",
      "completed": true
    }]