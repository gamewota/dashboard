import { useState } from 'react';
import Editor from 'react-simple-wysiwyg';

interface WysiwygProps {
  value?: string;
  onChange?: (html: string) => void;
}

const Wysiwyg = ({ value, onChange }: WysiwygProps) => {
  const [html, setHtml] = useState(value || '');
  
  const handleChange = (event: { target: { value: string } }) => {
    const newHtml = event.target.value;
    setHtml(newHtml);
    onChange?.(newHtml);
  };
  
  return (
    <div className="not-prose wysiwyg-reset">
      <Editor
        value={html}
        onChange={handleChange}
      />
    </div>
  );
}

export default Wysiwyg