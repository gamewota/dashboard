import Editor from 'react-simple-wysiwyg';

interface WysiwygProps {
  value?: string;
  onChange?: (html: string) => void;
}

const Wysiwyg = ({ value, onChange }: WysiwygProps) => {
  const handleChange = (event: { target: { value: string } }) => {
    onChange?.(event.target.value);
  };

  return (
    <div className="not-prose wysiwyg-reset">
      <Editor
        value={value ?? ''}
        onChange={handleChange}
      />
    </div>
  );
}

export default Wysiwyg