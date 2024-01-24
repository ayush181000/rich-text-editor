/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
    Editor,
    EditorState,
    RichUtils,
    convertToRaw,
    convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const MyEditor = () => {
    const defaultTitle = "Demo editor by <Name>";
    const [titleState, setTitleState] = useState("");
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

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
                />
            </div>
        </div>
    );
};

export default MyEditor;
