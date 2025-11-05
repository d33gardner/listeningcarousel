import { useState, useEffect } from 'react';
import './TextInput.css';

interface TextInputProps {
  storyText: string;
  onTextChange: (text: string) => void;
}

export default function TextInput({ storyText, onTextChange }: TextInputProps) {
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const trimmed = storyText.trim();
    setCharCount(trimmed.length);
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
  }, [storyText]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value);
  };

  return (
    <div className="text-input">
      <h2>Step 2: Enter Your Story</h2>
      
      <div className="input-container">
        <textarea
          value={storyText}
          onChange={handleChange}
          placeholder="Type your story here... The text will be automatically split into slides (8-20 slides)."
          className="story-textarea"
          rows={10}
        />
        
        <div className="text-stats">
          <span>Characters: {charCount.toLocaleString()}</span>
          <span>Words: {wordCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="input-hint">
        <p>💡 Tip: Write naturally. The app will intelligently split your story into slides.</p>
        <p>• Minimum: 8 slides</p>
        <p>• Maximum: 20 slides</p>
      </div>
    </div>
  );
}

