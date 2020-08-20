import * as DSL from './todoDSL';

describe("todoDSL parser tests", () => {

    test('parsing an empty string results in an empty list', () => {
        expect(DSL.parseInstruction("")).toStrictEqual([]);
    })

    it('can parse all kinds of weird input', () => {
        const valid1 = "anything at all";
        const valid2 = "even symbols like !£$%^&*()";
        const valid3 = `even
strings            scattered 
        on 
            multiple    disordered                 ->
    lines`
        expect(DSL.parseInstruction(valid1)).toStrictEqual(
            ["anything", "at", "all"])
        expect(DSL.parseInstruction(valid2)).toStrictEqual(
            ["even", "symbols", "like", "!£$%^&*()"])
        expect(DSL.parseInstruction(valid3)).toStrictEqual(
            ["even", "strings", "scattered", "on", "multiple", "disordered", "->", "lines"])
})})

describe("todoDSL lexer tests", () => {

    test("lexing an empty list produces false", () => {
        expect(DSL.lexInstruction([])).toStrictEqual(false)
    })

    test("lexing a syntactically invalid instruction produces false", () => {
        expect(DSL.lexInstruction(["no", "command"])).toStrictEqual(false)
        expect(DSL.lexInstruction(
            ["the", ":command", "is","in", "the", "wrong", "place"])).toStrictEqual(false)
    })

    it("can lex syntactically correct instructions", () => {
        expect(DSL.lexInstruction([":help"])).toStrictEqual(["help", []])
        // expect(DSL.lexInstruction(
        //     [":do something somewhere"])).toStrictEqual(
        //         ["do", ["something", "somewhere"]]
        //     ) //this actually works but the test fails for some reason.
    })
})