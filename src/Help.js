import React from "react";
/**
 * Consumes props and produces a React element representing a Help interface,
 * or null if no interface can be found.
 *
 * @param {Object} props
 * @return {Symbol(react.element) | null }
 */
export function Help(props) {
    const { Facet, CommandDict } = props;
    const commands = Object.keys(CommandDict);

    /**
     * consumes Facet, a string representing the part of the help system
     * to fetch, and commandDict, an object representing all of the valid
     * todoDSL commands, and produces the appropriate piece of help.
     *
     * @param {string} Facet
     * @param {Object} CommandDict
     * @return { string || Array<string> || undefined }
     */
    function getHelp(Facet, CommandDict) {
        if (commands.includes(Facet)) {
            return CommandDict[Facet]["usage"];
        }
        else if (Facet === "list-commands") {
            return getCommandList(CommandDict);
        }
        else {
            return undefined;
        }
    }

    /**
     * Consumes an object whose keys are all valid todoDSL commands,
     * and produces an array whose members are the usage instructions
     * for those commands.
     *
     * @param {Object} CommandDict
     * @return {Array<string>}
     */
    function getCommandList(CommandDict) {
        return Object.keys(CommandDict)
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map((key) => CommandDict[key]["usage"]);
    }

    const help = getHelp(Facet, CommandDict);

    switch (typeof help) {
        case "string":
            return <HelpString Content={help} />;
        case "object":
            return <HelpList ContentList={help} />;
        default:
            return null;
    }
}
/**
 * Consumes an object `props` and produces a React element representing a piece
 * of help.
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
function HelpString(props) {
    const { Content, Key } = props;
    return (
        <li className="alert alert-info list-group-item" key={Key}>
            {Content}
        </li>
    );
}
/**
 * Consumes an object `props` and produces a React element representing an
 * array of pieces of help.
 *
 * @param {Object} props
 * @return {Symbol(react.element)}
 */
function HelpList(props) {
    const { ContentList } = props;
    return (
        <ul className="list-group">
            {ContentList.map((Content, idx) => (
                <HelpString Key={idx} Content={Content} />
            ))}
        </ul>
    );
}
