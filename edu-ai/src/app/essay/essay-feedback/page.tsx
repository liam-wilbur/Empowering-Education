'use client'

/**
 * Essay Feedback Page Component
 * 
 * This page allows users to:
 * - Input an essay title and text
 * - Generate AI feedback for the essay
 * - Check grammar in the essay
 * - Download the feedback in various formats
 */

// --- Imports ---
import { useState, useRef, useEffect, SetStateAction } from 'react'
import Link from 'next/link' // For navigation
import styles from './essay.module.css'; // CSS module for styling
import GrammarHighlighter from '../grammar-check/components/GrammarHighlighter' // Grammar checking
import { downloadAsTxt, downloadAsDoc, downloadAsPdf } from './utils/downloadHelpers' // Downloading feedback

export default function EssayFeedbackPage() {
  // --- State Management ---
  // UI state
  const [showGrammarCheck, setShowGrammarCheck] = useState(false)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  // Content state
  const [essayTitle, setEssayTitle] = useState('')
  const [essayText, setEssayText] = useState('')
  const [feedback, setFeedback] = useState('')
  
  // --- Refs ---
  const essayInputRef = useRef(null) // This ref is used for the textarea in GrammarHighlighter
  const downloadContainerRef = useRef<HTMLDivElement>(null) // Detects clicks outside of the download options dropdown

  // --- Effects ---
  /**
   * Close dropdown when clicking outside of download container
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        downloadContainerRef.current &&
        !downloadContainerRef.current.contains(event.target as Node)
      ) {
        setShowDownloadOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Event Handlers ---
  /**
   * Generate feedback for the essay by calling the API
   */
  const handleGenerateFeedback = async () => {
    // Don't proceed if essay is empty
    if (!essayText.trim()) return;
    
    // Reset any previous errors
    setError('');
    setIsGenerating(true);
    setFeedback('');  // Clear existing feedback
    // Enable grammar checking when feedback is generated
    setShowGrammarCheck(true);

    try {
      // Make the actual API call to our route
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: essayTitle || 'Untitled Essay',
          essay: essayText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setFeedback(data.feedback);
    } catch (err) {
      console.error('Failed to generate feedback:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle feedback download in various formats
   */
  const handleDownloadFeedback = (format: string) => {
    if (!feedback) return;

    switch (format) {
      case 'txt':
        downloadAsTxt(essayTitle || 'Untitled Essay', feedback);
        break;
      case 'doc':
        downloadAsDoc(essayTitle || 'Untitled Essay', feedback);
        break;
      case 'pdf':
        downloadAsPdf(essayTitle || 'Untitled Essay', feedback);
        break;
      default:
        console.error("Unknown format:", format);
    }
  }

  // --- Render Helpers ---
  /**
   * Renders the feedback content based on current state
   */
  const renderFeedbackContent = () => {
    if (error) {
      return (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>{error}</p>
        </div>
      );
    } 
    
    if (feedback) {
      return <pre className={styles.feedbackContent}>{feedback}</pre>;
    } 
    
    return (
      <div className={styles.feedbackPlaceholder}>
        <div className={styles.placeholderIcon}>🔍</div>
        <p className={styles.placeholderText}>
          Your feedback will appear here after you generate it.
        </p>
      </div>
    );
  };

  /**
   * Renders the download options dropdown
   */
  const renderDownloadOptions = () => {
    if (!showDownloadOptions) return null;
    
    return (
      <div className={styles.downloadDropdown}>
        <button 
          className={styles.downloadOption}
          onClick={() => {
            handleDownloadFeedback('txt');
            setShowDownloadOptions(false);
          }}
        >
          <span className={styles.downloadIcon}>📄</span> Text File (.txt)
        </button>
        
        <button 
          className={styles.downloadOption}
          onClick={() => {
            handleDownloadFeedback('doc');
            setShowDownloadOptions(false);
          }}
        >
          <span className={styles.downloadIcon}>📝</span> Word Document (.doc)
        </button>
        
        <button 
          className={styles.downloadOption}
          onClick={() => {
            handleDownloadFeedback('pdf');
            setShowDownloadOptions(false);
          }}
        >
          <span className={styles.downloadIcon}>📊</span> PDF Document (.pdf)
        </button>
      </div>
    );
  };

  // --- Main Component Render ---
  return (
    <div className={styles.appContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logoContainer}>
            <Link href='/' className={styles.eduLogo}>
              <span className={styles.eduIcon}>👨‍🎓</span>
              <span className={styles.eduText}>EDU AI</span>
            </Link>
            <div className={styles.durhamLogo}>
              <span>DURHAM</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Link href='/' className={styles.headerButton}>
              HOME
            </Link>
            <button className={styles.headerButton}>HELP</button>
          </div>
        </div>
      </header>

      {/* Banner Section */}
      <div className={styles.banner}>
        <div className={styles.bannerContainer}>
          <h1 className={styles.bannerTitle}>ESSAY FEEDBACK GENERATOR</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContainer}>
        <div className={styles.twoColumnContainer}>
          {/* Left Column - Essay Input */}
          <div className={styles.columnContainer}>
            <div className={styles.inputSection}>
              {/* Essay Title Input */}
              <div className={styles.inputContainerTitle}>
                <label htmlFor='essay-title' className={styles.inputLabel}>
                  Essay Title
                </label>
                <input
                  id='essay-title'
                  type='text'
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                  className={styles.titleInput}
                  placeholder='Enter your essay title here...'
                />
              </div>

              {/* Essay Text Input with Grammar Checking */}
              <div className={styles.inputContainerEssay}>
                <label htmlFor='essay-text' className={styles.inputLabel}>
                  Essay Text
                </label>
                <GrammarHighlighter 
                  text={essayText}
                  textareaRef={essayInputRef}
                  onChange={(e: { target: { value: SetStateAction<string>; }; }) => setEssayText(e.target.value)}
                  placeholder='Paste your essay text here...'
                  enableChecking={showGrammarCheck}
                />
              </div>

              {/* Generate Feedback Button */}
              <div className={styles.inputActions}>
                <button
                  className={`${styles.generateButton} ${
                    isGenerating ? styles.generating : ''
                  }`}
                  onClick={handleGenerateFeedback}
                  disabled={isGenerating || !essayText.trim()}
                >
                  {isGenerating 
                    ? 'Generating...' 
                    : showGrammarCheck 
                      ? 'Regenerate Feedback' 
                      : 'Generate Feedback'
                  }
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Feedback Output */}
          <div className={styles.columnContainer}>
            <div className={styles.outputSection}>
              <div className={styles.outputContainer}>
                {/* Feedback Header with Download Options */}
                <div className={styles.outputHeader}>
                  <h2 className={styles.outputTitle}>Feedback</h2>
                  {feedback && (
                    <div className={styles.downloadContainer} ref={downloadContainerRef}>
                      <button
                        className={styles.downloadButton}
                        onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                      >
                        Download
                      </button>
                      
                      {renderDownloadOptions()}
                    </div>
                  )}
                </div>

                {/* Feedback Content Area */}
                <div className={styles.feedbackOutput}>
                  {renderFeedbackContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}