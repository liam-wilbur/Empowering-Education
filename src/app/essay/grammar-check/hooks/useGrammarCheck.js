// hooks/useGrammarCheck.js
import { useState, useEffect, useRef } from 'react';

export function useGrammarCheck(text, enableChecking = true) {
  const [grammarErrors, setGrammarErrors] = useState({ errors: [] });
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [error, setError] = useState(null);

  // Function to check grammar and spelling
  const checkGrammarAndSpelling = async (text) => {
    if (!text || !text.trim() || !enableChecking) {
      setGrammarErrors({ errors: [] });
      setError(null);
      return;
    }

    setIsCheckingGrammar(true);
    setError(null);
    
    try {
      const response = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate that the data has the expected structure
      if (!data || !Array.isArray(data.errors)) {
        console.warn('Unexpected API response format:', data);
        setGrammarErrors({ errors: [] });
      } else {
        setGrammarErrors(data);
      }
    } catch (error) {
      console.error('Error checking grammar:', error);
      setError(error.message || 'Error checking grammar');
      setGrammarErrors({ errors: [] });
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  // Debounce function 
  const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  // Create debounced version of grammar check
  const debouncedGrammarCheck = useRef(
    debounce(checkGrammarAndSpelling, 1000)
  ).current;

  // Call the check function when text changes or enableChecking changes
  useEffect(() => {
    // Only perform the check if enableChecking is true
    if (enableChecking) {
      debouncedGrammarCheck(text);
    } else {
      // Clear any existing errors when checking is disabled
      setGrammarErrors({ errors: [] });
      setIsCheckingGrammar(false);
      setError(null);
    }
  }, [text, enableChecking, debouncedGrammarCheck]);

  return { grammarErrors, isCheckingGrammar, error };
}