/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
    Editor,
    EditorState,
    RichUtils,
    convertToRaw,
    convertFromRaw,
    Modifier,
    SelectionState
} from "draft-js";
import "draft-js/dist/Draft.css";
import Toolbar from "./Toolbar";

const MyEditor = () => {
    const defaultTitle = "Demo editor by <Name>";
    const [titleState, setTitleState] = useState("");
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const handleBeforeInput = (chars, editorState) => {
        const currentContent = editorState.getCurrentContent();
        const selection = editorState.getSelection();

        if (chars === ' ' && currentContent.getPlainText().endsWith('***')) {
            // Calculate the end offset of the range to underline
            const endOffset = selection.getEndOffset();

            // Create a new SelectionState for the range to underline
            const rangeToUnderline = SelectionState.createEmpty().merge({
                anchorKey: selection.getAnchorKey(),
                anchorOffset: endOffset - 4,
                focusKey: selection.getFocusKey(),
                focusOffset: endOffset,
                isBackward: selection.getIsBackward(),
                hasFocus: selection.getHasFocus(),
            });

            // Apply the underline style to the specified range
            const contentWithUnderline = Modifier.applyInlineStyle(
                currentContent,
                rangeToUnderline,
                'UNDERLINE'
            );

            // Remove " *** " from the content
            const contentWithoutStars = Modifier.replaceText(
                contentWithUnderline,
                rangeToUnderline,
                ''
            );

            // Update the editor state with the new content state
            const newEditorState = EditorState.push(editorState, contentWithoutStars, 'apply-entity');

            // Force selection to prevent "Invalid selection state" error
            const finalEditorState = EditorState.forceSelection(
                newEditorState,
                contentWithoutStars.getSelectionAfter()
            );

            setEditorState(finalEditorState);

            // Prevent Draft.js from processing the space character
            return 'handled';
        }

        // Allow Draft.js to handle the input normally
        return 'not-handled';
    };
    const handleChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);

        if (newState) {
            handleChange(newState);
            return "handled";
        }

        return "not-handled";
    };

    const handleSave = () => {
        localStorage.setItem("titleContent", titleState);

        const contentState = editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);
        console.log(rawContent);
        localStorage.setItem("editorContent", JSON.stringify(rawContent));
    };

    const editor = React.useRef(null);

    function focusEditor() {
        editor.current.focus();
    }

    useEffect(() => {
        setTitleState(localStorage.getItem("titleContent") || defaultTitle);
        const contentState = localStorage.getItem("editorContent");

        if (contentState) {
            const parsedContent = JSON.parse(contentState);
            const contentStateObj = convertFromRaw(parsedContent);
            setEditorState(EditorState.createWithContent(contentStateObj));
        }
    }, []);

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                margin: "0",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                    marginBottom: "20px",
                    paddingTop: "10px",
                    width: "90%"
                }}
            >
                <input
                    type="text"
                    id="title"
                    name="title"
                    onChange={(e) => setTitleState(e.target.value)}
                    value={titleState}
                    style={{ marginRight: "10px", flexGrow: 1 }}
                />

                <button className="button" type="button" onClick={handleSave} >Save</button>
            </div>
            <Toolbar editorState={editorState} setEditorState={setEditorState} />
            <div
                onClick={focusEditor}
                style={{
                    width: "90%",
                    height: "80%",
                    border: "2px solid black",
                    borderRadius: "8px",
                    overflow: "auto",
                    margin: '2px'
                }}
            >
                <Editor
                    ref={editor}
                    editorState={editorState}
                    onChange={handleChange}
                    handleKeyCommand={handleKeyCommand}
                    handleBeforeInput={handleBeforeInput}
                />
            </div>
        </div>
    );
};

export default MyEditor;
