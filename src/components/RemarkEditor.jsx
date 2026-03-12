import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

function RemarkEditor({ value, onChange }) {

    const editorRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {

        if (!quillInstance.current && editorRef.current) {

            quillInstance.current = new Quill(editorRef.current, {
                theme: "snow",
                placeholder: "Write customer remark or notes...",
                modules: {
                    toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["clean"]
                    ]
                }
            });

            quillInstance.current.on("text-change", () => {
                const html = quillInstance.current.root.innerHTML;
                onChange(html);
            });

        }

    }, []);

    // 🔥 update editor when value changes
    useEffect(() => {
        if (quillInstance.current && value !== undefined) {
            const currentHTML = quillInstance.current.root.innerHTML;

            if (currentHTML !== value) {
                // quillInstance.current.root.innerHTML = value || "";2
                quillInstance.current.clipboard.dangerouslyPasteHTML(value || "");
            }
        }
    }, [value]);

    // useEffect(() => {
    //     if (quillInstance.current && value !== undefined) {

    //         const currentHTML = quillInstance.current.root.innerHTML;

    //         if (currentHTML !== value) {
    //             quillInstance.current.clipboard.dangerouslyPasteHTML(value || "");
    //         }

    //     }
    // }, [value]);

    return (
        <div
            ref={editorRef}
            className="bg-white border rounded-lg overflow-hidden"
            style={{ minHeight: "200px" }}
        />
    );
}

export default RemarkEditor;