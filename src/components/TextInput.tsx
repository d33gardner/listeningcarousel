import { useState, useEffect } from 'react';
import './TextInput.css';

interface TextInputProps {
  title: string;
  storyText: string;
  onTitleChange: (title: string) => void;
  onTextChange: (text: string) => void;
}

export default function TextInput({ title, storyText, onTitleChange, onTextChange }: TextInputProps) {
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const trimmed = storyText.trim();
    setCharCount(trimmed.length);
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
  }, [storyText]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(event.target.value);
  };

  return (
    <div className="text-input">
      <h2>Step 2: Enter Your Story</h2>
      
      <div className="input-container">
        <div className="title-input-group">
          <label htmlFor="title-input">Title (Optional)</label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter a title for the first slide (or leave blank to use the first sentence)"
            className="title-input"
          />
          <p className="title-hint">If left blank, the first sentence of your story will be used on the first slide.</p>
        </div>

        <label htmlFor="story-textarea">Story Text</label>
        <textarea
          id="story-textarea"
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

