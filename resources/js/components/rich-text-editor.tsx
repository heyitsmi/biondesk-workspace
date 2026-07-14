import Image from '@tiptap/extension-image';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

export function RichTextEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[200px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-neutral-200 rounded-md overflow-hidden bg-white">
            <div className="flex items-center flex-wrap gap-1 border-b border-neutral-200 bg-neutral-50 p-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    data-active={editor.isActive('bold')}
                    className={editor.isActive('bold') ? 'bg-neutral-200' : ''}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    data-active={editor.isActive('italic')}
                    className={editor.isActive('italic') ? 'bg-neutral-200' : ''}
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    data-active={editor.isActive('strike')}
                    className={editor.isActive('strike') ? 'bg-neutral-200' : ''}
                >
                    <Strikethrough className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-neutral-300 mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    data-active={editor.isActive('heading', { level: 2 })}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200' : ''}
                >
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    data-active={editor.isActive('heading', { level: 3 })}
                    className={editor.isActive('heading', { level: 3 }) ? 'bg-neutral-200' : ''}
                >
                    <Heading2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-neutral-300 mx-1" />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    data-active={editor.isActive('bulletList')}
                    className={editor.isActive('bulletList') ? 'bg-neutral-200' : ''}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    data-active={editor.isActive('orderedList')}
                    className={editor.isActive('orderedList') ? 'bg-neutral-200' : ''}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    data-active={editor.isActive('blockquote')}
                    className={editor.isActive('blockquote') ? 'bg-neutral-200' : ''}
                >
                    <Quote className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-neutral-300 mx-1" />
                <Button type="button" variant="ghost" size="icon" onClick={addImage}>
                    <ImageIcon className="w-4 h-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
