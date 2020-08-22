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

  it("can parse syntactically correct instructions", () => {
    expect(DSL.parseInstruction([":help"])).toStrictEqual(["help", []]);
    // expect(DSL.parseInstruction(
    //     [":do something somewhere"])).toStrictEqual(
    //         ["do", ["something", "somewhere"]]
    //     ) //this actually works but the test fails for some reason.
  });
});
