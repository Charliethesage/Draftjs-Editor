import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, Modifier, getDefaultKeyBinding, convertFromRaw, convertToRaw, SelectionState  } from 'draft-js';
import Button from './Button';

const MyEditor = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        const savedData = localStorage.getItem('editorContent');
        if (savedData) {
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedData))));
        }
    }, []);

    const saveContent = () => {
        const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        localStorage.setItem('editorContent', content);
    };

    const onChange = (newEditorState) => {
      setEditorState(newEditorState);
  };
  
    const styleMap = {
        'RED': {
            color: 'red',
        },
        'BOLD': {
            fontWeight: 'bold',
        },
        'UNDERLINE': {
            textDecoration: 'underline',
        },
    };

    const keyBindingFunction = (e) => {
      const selection = editorState.getSelection();
          const contentState = editorState.getCurrentContent();

      const currentBlock = contentState.getBlockForKey(selection.getStartKey());
      const blockText = currentBlock.getText();

        if (e.keyCode === 32 && (/^(#|\*+).*/).test(blockText)) { 
            return 'space';
        }
        return getDefaultKeyBinding(e);
    };

    const handleKeyCommand = (command, editorState) => {
      if (command === 'space') {
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const currentBlock = contentState.getBlockForKey(selection.getStartKey());
        const blockText = currentBlock.getText();
        let style = '';
        let replaceLength = 0;
    
        // Determining the style to apply and length of markdown symbols
        if (blockText.startsWith('#')) {
          style = 'header-one';
          replaceLength = 1;
        } else if (blockText.startsWith('***')) {
          style = 'UNDERLINE';
          replaceLength = 3;
        } else if (blockText.startsWith('**')) {
          style = 'RED';
          replaceLength = 2;
        } else if (blockText.startsWith('*')) {
          style = 'BOLD';
          replaceLength = 1;
        }
    
        // Replacing the markdown symbol
        let newContentState = Modifier.replaceText(
          contentState,
          selection.merge({ anchorOffset: 0, focusOffset: replaceLength }),
          ''
        );
    
        let newEditorState = EditorState.push(
          editorState, 
          newContentState, 
          'change-block-type-or-inline-style'
        );
    
        // Appling the stylez
        if (style === 'header-one') {
          newEditorState = RichUtils.toggleBlockType(newEditorState, style);
        } else if (style) {
          const styledSelection = new SelectionState({
            anchorKey: selection.getStartKey(),
            anchorOffset: 0,
            focusKey: selection.getStartKey(),
            focusOffset: blockText.length - replaceLength,
            isBackward: false,
            hasFocus: true
          });
    
          newContentState = Modifier.applyInlineStyle(
            newEditorState.getCurrentContent(),
            styledSelection,
            style
          );
    
          newEditorState = EditorState.push(
            newEditorState, 
            newContentState, 
            'change-inline-style'
          );
        }
    
        setEditorState(newEditorState);
        return 'handled';
      }
    
      return 'not-handled';
    };
    

    return (
      <>
  <div className="editor-container">            
    <Editor
      className="editor"
      editorState={editorState}
      onChange={onChange}
      keyBindingFn={keyBindingFunction}
      handleKeyCommand={handleKeyCommand}
      customStyleMap={styleMap}
    />
  </div>
  <Button onSave ={saveContent}/>
</>

    );
};

export default MyEditor;
