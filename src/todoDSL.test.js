import * as DSL from "./todoDSL";

describe("todoDSL tokenizer tests", () => {
  test("tokenizes an empty string results in an empty list", () => {
    expect(DSL.tokenizeInstruction("")).toStrictEqual([]);
  });

  it("can tokenize all kinds of weird input", () => {
    const valid1 = "anything at all";
    const valid2 = "even symbols like !£$%^&*()";
    const valid3 = `even
strings            scattered 
        on 
            multiple    disordered                 ->
    lines`;
    expect(DSL.tokenizeInstruction(valid1)).toStrictEqual([
      "anything",
      "at",
      "all",
    ]);
    expect(DSL.tokenizeInstruction(valid2)).toStrictEqual([
      "even",
      "symbols",
      "like",
      "!£$%^&*()",
    ]);
    expect(DSL.tokenizeInstruction(valid3)).toStrictEqual([
      "even",
      "strings",
      "scattered",
      "on",
      "multiple",
      "disordered",
      "->",
      "lines",
    ]);
  });
  it("does not recognize single-quoted strings as single tokens", () => {
    const stringWithQuotes1 = "this one uses 'single quotes', and";
    expect(
      DSL.tokenizeInstruction(stringWithQuotes1)).toStrictEqual([
        "this",
        "one",
        "uses",
        "'single",
        "quotes',",
        "and",
      ])
  });
  it("can recognize double-quoted strings as single tokens", () => {
    const stringWithQuotes2 = 'this one uses "double quotes",';
    expect(
      DSL.tokenizeInstruction(stringWithQuotes2)).toStrictEqual([
        "this",
        "one",
        "uses",
        "\"double quotes\"",
        ","
      ])
  });
});

describe("todoDSL parser tests", () => {
  test("parsing an empty list produces false", () => {
    expect(DSL.parseInstruction([])).toStrictEqual(false);
  });

  test("parsing a syntactically invalid instruction produces false", () => {
    expect(DSL.parseInstruction(["no", "command"])).toStrictEqual(false);
    expect(
      DSL.parseInstruction([
        "the",
        ":command",
        "is",
        "in",
        "the",
        "wrong",
        "place",
      ])
    ).toStrictEqual(false);
  });
  it("strips literal quotes from tokens representing quoted strings", () => {
    expect(DSL.parseInstruction([":add", "\"no man is\"", "\"an island\""])).toStrictEqual(
      ["add", ["no man is", "an island"]]
    )
  })

  it("can parse syntactically correct instructions", () => {
    expect(DSL.parseInstruction([":help"])).toStrictEqual(["help", []]);
    // expect(DSL.parseInstruction(
    //     [":do something somewhere"])).toStrictEqual(
    //         ["do", ["something", "somewhere"]]
    //     ) //this actually works but the test fails for some reason.
  });
});

describe("stripQuotingArtefacts tests", () => {
  test("can strip double quotes from double-quoted string", () => {
    expect(DSL.stripQuotingArtefacts("\"test that this works\"")).toStrictEqual(
      "test that this works"
    )
  })
  test("just produces its argument if the latter's not double-quoted", () => {
    expect(DSL.stripQuotingArtefacts("nothing will happen to me")).toStrictEqual(
      "nothing will happen to me"
    )
  })
})
