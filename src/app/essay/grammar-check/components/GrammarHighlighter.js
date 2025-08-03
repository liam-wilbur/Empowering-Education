// components/GrammarHighlighter.js
'use client';
import React from 'react';

import { useEffect, useRef, useState } from 'react';
import { useGrammarCheck } from '../hooks/useGrammarCheck';
import './GrammarHighlighter.css';

// Comprehensive list of common words to skip (not clickable)
const COMMON_WORDS = new Set([
  // Articles
  "a", "an", "the", 
  
  // Conjunctions
  "and", "but", "or", "for", "nor", "so", "yet", "as", "because", "since", "unless", "until", "while",
  
  // Prepositions
  "at", "by", "to", "in", "on", "of", "off", "up", "out", "over", "from", "with", "without", "about", 
  "above", "across", "after", "against", "along", "amid", "among", "around", "before", "behind", 
  "below", "beneath", "beside", "between", "beyond", "during", "except", "inside", "outside", 
  "through", "throughout", "toward", "towards", "under", "underneath", "until", "upon", "via", "within",
  
  // Pronouns (all forms)
  "i", "me", "my", "mine", "myself",
  "you", "your", "yours", "yourself", "yourselves",
  "he", "him", "his", "himself",
  "she", "her", "hers", "herself",
  "it", "its", "itself",
  "we", "us", "our", "ours", "ourselves",
  "they", "them", "their", "theirs", "themselves",
  "who", "whom", "whose",
  "what", "which", "that",
  "this", "these", "those", "such",
  "anybody", "anyone", "anything", "each", "either", "everybody", "everyone", "everything",
  "little", "much", "neither", "nobody", "nothing", "one", "other", "somebody", "someone", "something",
  
  // Auxiliary verbs
  "am", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "doing", "done",
  "have", "has", "had", "having",
  "can", "could", "may", "might", "must", "shall", "should", "will", "would",
  
  // Common adverbs
  "not", "no", "too", "very", "just", "now", "then", "here", "there", "when", "where", "why", "how",
  "again", "almost", "already", "always", "even", "ever", "never", "often", "only", "quite", "really",
  "seldom", "sometimes", "still", "usually", "also", "else", "especially", "mainly", "mostly",
  
  // Numbers
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "first", "second", "third",
  
  // Time indicators
  "day", "days", "week", "weeks", "month", "months", "year", "years", "today", "tomorrow", "yesterday"
]);

export default function GrammarHighlighter({ 
  text, 
  textareaRef, 
  onChange, 
  placeholder,
  enableChecking = false
}) {
  const { grammarErrors, isCheckingGrammar, error } = useGrammarCheck(text, enableChecking);
  const highlightLayerRef = useRef(null);
  const [activeError, setActiveError] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectedWord, setSelectedWord] = useState(null);
  const [correctedText, setCorrectedText] = useState('');

  // Function to check if a word is meaningful (not in common words list)
  const isMeaningfulWord = (word) => {
    // Remove any punctuation from the word for checking
    const cleanWord = word.replace(/[^\w\s']|_/g, "").toLowerCase();
    
    // Skip if it's in our common words list or if it's too short
    return !COMMON_WORDS.has(cleanWord) && cleanWord.length > 1;
  };

  // Generate corrected version of text
  useEffect(() => {
    if (!enableChecking || !grammarErrors.errors || grammarErrors.errors.length === 0) {
      setCorrectedText('');
      return;
    }

    // Create a copy of the text
    let textWithCorrections = text;
    
    // Sort errors by position (from end to start to avoid index shifting)
    const sortedErrors = [...grammarErrors.errors]
      .sort((a, b) => b.startIndex - a.startIndex);
    
    // Apply all corrections
    for (const error of sortedErrors) {
      if (error.suggestion) {
        textWithCorrections = 
          textWithCorrections.substring(0, error.startIndex) + 
          error.suggestion + 
          textWithCorrections.substring(error.endIndex);
      }
    }
    
    setCorrectedText(textWithCorrections);
  }, [text, grammarErrors, enableChecking]);

  // Helper function to escape HTML
  const escapeHTML = (text) => {
    return text
      ?.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;') || '';
  };

  // Update the highlighting layer when grammar errors change
  useEffect(() => {
    if (!highlightLayerRef.current) return;
    
    // Get the current text
    const currentText = text || '';
    
    // Start building our highlighted HTML
    let lastIndex = 0;
    let highlightedHTML = '';
    
    // If checking is not enabled, wrap each word in a span to make it clickable
    if (!enableChecking) {
      // Split text into words and punctuation
      const words = currentText.split(/(\s+|[.,!?;:"\(\)\[\]{}])/); // Split by spaces and punctuation but keep them
      
      highlightedHTML = words.map((word, index) => {
        // If it's whitespace or punctuation, or not a meaningful word, return as is
        if (word.trim() === '' || !isMeaningfulWord(word)) {
          return escapeHTML(word);
        } else {
          // For meaningful words, wrap in a clickable span
          return `<span class="clickable-word" data-word="${escapeHTML(word)}">${escapeHTML(word)}</span>`;
        }
      }).join('');
    } else {
      // Grammar checking is enabled, handle errors
      const sortedErrors = [...(grammarErrors.errors || [])].sort((a, b) => a.startIndex - b.startIndex);
      
      // Process each error
      for (const error of sortedErrors) {
        // Make sure indices are valid
        if (error.startIndex >= 0 && error.endIndex <= currentText.length && error.startIndex < error.endIndex) {
          // Add text before the error, and make meaningful words clickable
          const textBeforeError = currentText.substring(lastIndex, error.startIndex);
          const wordsBeforeError = textBeforeError.split(/(\s+|[.,!?;:"\(\)\[\]{}])/);
          
          wordsBeforeError.forEach(word => {
            if (word.trim() === '' || !isMeaningfulWord(word)) {
              highlightedHTML += escapeHTML(word);
            } else {
              highlightedHTML += `<span class="clickable-word" data-word="${escapeHTML(word)}">${escapeHTML(word)}</span>`;
            }
          });
          
          // Add the error with highlighting
          const errorText = currentText.substring(error.startIndex, error.endIndex);
          highlightedHTML += `<span 
            class="grammar-error" 
            data-error-id="${error.startIndex}-${error.endIndex}"
            data-reason="${escapeHTML(error.reason || '')}"
            data-suggestion="${escapeHTML(error.suggestion || '')}"
            data-word="${escapeHTML(errorText)}"
          >${escapeHTML(errorText)}</span>`;
          
          lastIndex = error.endIndex;
        }
      }
      
      // Add any remaining text, making meaningful words clickable
      const remainingText = currentText.substring(lastIndex);
      const remainingWords = remainingText.split(/(\s+|[.,!?;:"\(\)\[\]{}])/);
      
      remainingWords.forEach(word => {
        if (word.trim() === '' || !isMeaningfulWord(word)) {
          highlightedHTML += escapeHTML(word);
        } else {
          highlightedHTML += `<span class="clickable-word" data-word="${escapeHTML(word)}">${escapeHTML(word)}</span>`;
        }
      });
    }
    
    // Add newlines to ensure proper spacing
    highlightedHTML = highlightedHTML.replace(/\n/g, '<br>');
    
    // Set the HTML
    highlightLayerRef.current.innerHTML = highlightedHTML;
    
    // Add click event listeners
    // Grammar errors
    const errorSpans = highlightLayerRef.current.querySelectorAll('.grammar-error');
    errorSpans.forEach(span => {
      span.style.cursor = 'pointer';
      span.style.pointerEvents = 'auto';
      span.addEventListener('click', handleErrorClick);
    });
    
    // Regular words
    const wordSpans = highlightLayerRef.current.querySelectorAll('.clickable-word');
    wordSpans.forEach(span => {
      span.style.cursor = 'pointer';
      span.style.pointerEvents = 'auto';
      span.addEventListener('click', handleWordClick);
    });

    return () => {
      // Cleanup event listeners
      errorSpans.forEach(span => {
        span.removeEventListener('click', handleErrorClick);
      });
      wordSpans.forEach(span => {
        span.removeEventListener('click', handleWordClick);
      });
    };
  }, [grammarErrors, text, enableChecking]);

  // Rest of the component remains the same...
  // [Keep all other methods and the return statement exactly as they were]

  // Handle click on a regular word
  const handleWordClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close any open error popup
    setActiveError(null);
    
    const span = e.target;
    const word = span.getAttribute('data-word');
    
    // Calculate position for popup
    const rect = span.getBoundingClientRect();
    const editorRect = highlightLayerRef.current.getBoundingClientRect();
    
    setPopupPosition({
      top: rect.bottom - editorRect.top + 5,
      left: Math.max(0, rect.left - editorRect.left)
    });
    
    // Set selected word
    setSelectedWord(word);
  };

  // Handle click on error
  const handleErrorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close any open word popup
    setSelectedWord(null);
    
    const span = e.target;
    
    // Get error details from data attributes
    const errorId = span.getAttribute('data-error-id');
    const reason = span.getAttribute('data-reason');
    const suggestion = span.getAttribute('data-suggestion');
    const word = span.getAttribute('data-word');
    
    // Calculate position for popup
    const rect = span.getBoundingClientRect();
    const editorRect = highlightLayerRef.current.getBoundingClientRect();
    
    setPopupPosition({
      top: rect.bottom - editorRect.top + 5,
      left: Math.max(0, rect.left - editorRect.left)
    });
    
    // Set active error
    setActiveError({
      id: errorId,
      word,
      reason,
      suggestion
    });
  };

  // Close the popups
  const handleClosePopup = () => {
    setActiveError(null);
    setSelectedWord(null);
  };

  // Apply the suggestion
  const handleApplySuggestion = () => {
    if (!activeError || !textareaRef.current) return;
    
    // Parse error ID to get start and end indices
    const [startIndex, endIndex] = activeError.id.split('-').map(Number);
    
    // Create new text with the suggestion applied
    const newText = 
      text.substring(0, startIndex) + 
      activeError.suggestion + 
      text.substring(endIndex);
    
    // Update the text
    onChange({ target: { value: newText } });
    
    // Close popup
    setActiveError(null);
  };

  // Apply all corrections at once
  const handleApplyAllCorrections = () => {
    if (correctedText && correctedText !== text) {
      onChange({ target: { value: correctedText } });
    }
  };

  // Look up the definition of a word
  const handleLookupWord = () => {
    if (selectedWord) {
      window.open(`https://www.merriam-webster.com/dictionary/${selectedWord}`, '_blank');
    }
  };

  // Find synonyms for a word
  const handleFindSynonyms = () => {
    if (selectedWord) {
      window.open(`https://www.thesaurus.com/browse/${selectedWord}`, '_blank');
    }
  };

  // Sync scroll position between textarea and highlight layer
  const syncScroll = () => {
    if (textareaRef.current && highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightLayerRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if ((activeError || selectedWord) && 
          !e.target.closest('.grammar-error-popup') && 
          !e.target.closest('.word-popup') &&
          !e.target.classList.contains('grammar-error') &&
          !e.target.classList.contains('clickable-word')) {
        setActiveError(null);
        setSelectedWord(null);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeError, selectedWord]);

  // Calculate error count
  const errorCount = enableChecking ? grammarErrors.errors?.length || 0 : 0;

  return (
    <div className="grammar-editor-wrapper">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={onChange}
        onScroll={syncScroll}
        className="grammar-textarea"
        placeholder={placeholder}
      />
      <div 
        ref={highlightLayerRef}
        className="grammar-highlight-layer"
        aria-hidden="true"
      ></div>
      
      {/* Error popup */}
      {activeError && (
        <div 
          className="grammar-error-popup"
          style={{ 
            top: `${popupPosition.top}px`, 
            left: `${popupPosition.left}px` 
          }}
        >
          <button className="popup-close-btn" onClick={handleClosePopup}>×</button>
          <h4 className="popup-word">"{activeError.word}"</h4>
          <div className="popup-reason">
            <span className="popup- label">Issue:</span> 
            <span>{activeError.reason || 'Grammar or spelling error'}</span>
          </div>
          <div className="popup-suggestion">
            <span className="popup-label">Correction:</span> 
            <span className="correction-text">{activeError.suggestion || 'No suggestion available'}</span>
          </div>
          {activeError.suggestion && (
            <button 
              className="popup-apply-btn" 
              onClick={handleApplySuggestion}
            >
              Apply Correction
            </button>
          )}
        </div>
      )}
      
      {/* Word popup */}
      {selectedWord && (
        <div 
          className="word-popup"
          style={{ 
            top: `${popupPosition.top}px`, 
            left: `${popupPosition.left}px` 
          }}
        >
          <button className="popup-close-btn" onClick={handleClosePopup}>×</button>
          <h4 className="popup-word">"{selectedWord}"</h4>
          <div className="word-actions">
            <button 
              className="word-action-btn"
              onClick={handleLookupWord}
            >
              Look Up Definition
            </button>
            <button 
              className="word-action-btn"
              onClick={handleFindSynonyms}
            >
              Find Synonyms
            </button>
          </div>
        </div>
      )}
      
      {/* Corrected text preview */}
      {enableChecking && errorCount > 0 && correctedText && correctedText !== text && (
        <div className="corrected-text-indicator">
          <span>{errorCount} {errorCount === 1 ? 'error' : 'errors'} found</span>
          <button 
            className="apply-all-corrections-btn"
            onClick={handleApplyAllCorrections}
          >
            Apply All Corrections
          </button>
        </div>
      )}
      
      {enableChecking && isCheckingGrammar && (
        <div className="grammar-checking-indicator">
          Checking grammar...
        </div>
      )}
      
      {enableChecking && error && (
        <div className="grammar-error-indicator">
          Error checking grammar: {error}
        </div>
      )}
    </div>
  );
}