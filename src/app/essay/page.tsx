"use client";

/**
 * Essay Feedback Page Component
 *
 * This page allows users to:
 * - Input an essay title and text
 * - Generate AI feedback for the essay
 * - Check grammar in the essay
 * - Download the feedback in various formats
 * - Switch between Overview/Grammar/Structure/Content/Language/Full Feedback via a <select> dropdown
 */

// --- Imports ---
import { useState, useRef, useEffect, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import styles from "./essay.module.css";
import Link from "next/link";
import GrammarHighlighter from "./grammar-check/components/GrammarHighlighter";
import {
  downloadAsTxt,
  downloadAsDoc,
  downloadAsPdf,
} from "./utils/downloadHelpers.js";
import Header from "../header";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

// ─────────── Define a type for parsed feedback ───────────
type FeedbackCategories = {
  general?: string; // "Feedback and Areas of Improvement:" top-level section (Overview)
  grammar?: string;
  structure?: string;
  content?: string;
  language?: string;
};

export default function EssayFeedbackPage() {
  const router = useRouter();

  // --- State Management ---
  // UI state
  const [showGrammarCheck, setShowGrammarCheck] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  // Content state
  const [essayTitle, setEssayTitle] = useState("");
  const [essayText, setEssayText] = useState("");

  // ─── Store the raw feedback string from the API ───
  const [rawFeedback, setRawFeedback] = useState<string>("");

  // ─── Parsed categories ───
  const [feedback, setFeedback] = useState<FeedbackCategories>({});
  // Default to "general" (Overview) on first load
  const [currentCategory, setCurrentCategory] = useState<
    keyof FeedbackCategories | "full"
  >("general");

  // --- Refs ---
  const essayInputRef = useRef<HTMLTextAreaElement>(null);
  const downloadContainerRef = useRef<HTMLDivElement>(null);

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

  /**
   * Initialize speechSynthesis only on the client side
   */
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  /**
   * Clean up speech synthesis when component unmounts
   */
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  // ─────────── Parsing Function ───────────
  /**
   * Takes the raw feedback string (with headings) and splits it into:
   * { general, grammar, structure, content, language }
   * If there is an "OVERALL:" or "OVERALL assessment:" section, its text is appended into `general`.
   */
  function parseFeedbackIntoCategories(raw: string): FeedbackCategories {
    const result: FeedbackCategories = {};

    // 1) Normalize all line endings
    const normalized = raw.replace(/\r\n/g, "\n").trim();

    // 2) Define the exact headings we expect (in the same order GPT outputs them)
    //    Added both "OVERALL assessment:" and "OVERALL:" so we capture either
    const headings = [
      "Feedback and Areas of Improvement:",
      "GRAMMAR:",
      "STRUCTURE:",
      "CONTENT:",
      "LANGUAGE:",
      "OVERALL assessment:",
      "OVERALL:",
    ];

    // 3) Build a single regex that captures each heading + its content until the next heading
    const escapedHeadings = headings.map((h) =>
      h.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
    );
    const patternParts: string[] = [];

    for (let i = 0; i < escapedHeadings.length; i++) {
      const thisHeading = escapedHeadings[i];
      const lookaheadList = escapedHeadings.slice(i + 1).join("|");

      patternParts.push(
        `(${thisHeading}\\s*)([\\s\\S]*?)(?=(?:${lookaheadList})|$)`
      );
    }

    const sectionRegex = new RegExp(patternParts.join("|"), "gi");

    // 4) Execute the regex repeatedly to extract each section
    let match: RegExpExecArray | null;
    while ((match = sectionRegex.exec(normalized)) !== null) {
      for (let groupIndex = 1; groupIndex < match.length; groupIndex += 2) {
        const headingText = match[groupIndex]; // e.g. "GRAMMAR:" or "OVERALL assessment:"
        const contentText = match[groupIndex + 1]; // the text right after that heading

        if (headingText) {
          const key = headingText.trim().replace(/:$/, "").toLowerCase();

          switch (key) {
            case "feedback and areas of improvement":
              result.general = (contentText || "").trim();
              break;
            case "grammar":
              result.grammar = (contentText || "").trim();
              break;
            case "structure":
              result.structure = (contentText || "").trim();
              break;
            case "content":
              result.content = (contentText || "").trim();
              break;
            case "language":
              result.language = (contentText || "").trim();
              break;
            case "overall assessment":
            case "overall":
              // Append overall text into `general`
              if (contentText && contentText.trim()) {
                const existing = result.general ? result.general.trim() : "";
                const toAppend = contentText.trim();
                result.general = existing
                  ? `${existing}\n\n${toAppend}`
                  : toAppend;
              }
              break;
          }
          break;
        }
      }
    }

    return result;
  }

  // --- Event Handlers ---
  /**
   * Generate feedback for the essay by calling the API
   */

  const handleGenerateFeedback = async () => {
    if (!essayText.trim()) return;

    console.log(essayText);
    setError("");
    setIsGenerating(true);
    setFeedback({});
    setCurrentCategory("general");
    setShowGrammarCheck(true);
    setRawFeedback("");
    let parsed: FeedbackCategories = {};
    try {
      const response = await fetch("/essay/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: essayTitle || "Untitled Essay",
          essay: essayText,
        }),
      });
      if (!response.ok) {
        console.error("Error response:", response);
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setRawFeedback(data.feedback);
      parsed = parseFeedbackIntoCategories(data.feedback);
    } catch (err) {
      console.error("Failed to generate feedback:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
    // Simulate loading for better UX
    setTimeout(() => {
      setIsGenerating(false);
      setFeedback(parsed);
      setCurrentCategory("general");
    }, 2000); // 2 second delay to simulate processing
  };

  /**
   * Handle feedback download in various formats
   */
  const handleDownloadFeedback = (format: string) => {
    // We now use rawFeedback directly (instead of joining parsed sections)
    const textToDownload = rawFeedback.trim();
    if (!textToDownload) return;

    switch (format) {
      case "txt":
        downloadAsTxt(
          essayTitle || "Untitled Essay",
          essayText,
          textToDownload
        );
        break;
      case "doc":
        downloadAsDoc(
          essayTitle || "Untitled Essay",
          essayText,
          textToDownload
        );
        break;
      case "pdf":
        downloadAsPdf(
          essayTitle || "Untitled Essay",
          essayText,
          textToDownload
        );
        break;
      default:
        console.error("Unknown format:", format);
    }
  };

  /**
   * Handles text-to-speech functionality for the feedback
   */
  const handleSpeakFeedback = () => {
    if (!speechSynthesisRef.current) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    // If "full," read the rawFeedback; otherwise read only that category
    let textToRead = "";
    if (currentCategory === "full") {
      textToRead = rawFeedback;
    } else {
      textToRead = feedback[currentCategory as keyof FeedbackCategories] || "";
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      const err = (event as any).error;
      // Ignore "canceled" and "interrupted"
      if (err !== "canceled" && err !== "interrupted") {
        console.error("Speech synthesis error:", err);
      }

      setIsSpeaking(false);
    };
    speechSynthesisRef.current.speak(utterance);
  };

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

    if (isGenerating) {
      return (
        <div
          className={styles.loadingContainer}
          role="status"
          aria-live="polite"
        >
          <div className={styles.loadingSpinner} aria-hidden="true"></div>
          <div className={styles.loadingMessage}>
            <p className={styles.loadingTitle}>
              Analyzing your essay and generating thoughtful feedback...
            </p>
            <p className={styles.loadingDetails}>
              This typically takes 1-2 minutes depending on essay length.
            </p>
            <p className={styles.loadingWarning}>
              <strong>Please don't close this page.</strong>
            </p>
          </div>
        </div>
      );
    }

    // If we have any rawFeedback, show the content for the selected category
    const categories = [
      "general",
      "grammar",
      "structure",
      "content",
      "language",
      "full",
    ] as (keyof FeedbackCategories | "full")[];

    // Only show categories that actually exist
    const anySectionExists = rawFeedback.trim().length > 0;
    const availableCategories = categories.filter((cat) => {
      if (cat === "full") return anySectionExists;
      return !!feedback[cat as keyof FeedbackCategories];
    });

    // If there is at least one category, render the text for the chosen one
    if (availableCategories.length > 0) {
      return (
        <div className={styles.feedbackOutput}>
          {currentCategory === "full" ? (
            <p className={styles.feedbackContent}>
              {rawFeedback
                .trim()
                .split("\n")
                .map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
            </p>
          ) : feedback[currentCategory as keyof FeedbackCategories] ? (
            <p className={styles.feedbackContent}>
              {feedback[currentCategory as keyof FeedbackCategories]!.trim()
                .split("\n")
                .map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
            </p>
          ) : (
            <p className={styles.feedbackPlaceholder}>
              No feedback available for "{currentCategory}."
            </p>
          )}
        </div>
      );
    }

    // If's no feedback yet (first load)
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
            handleDownloadFeedback("txt");
            setShowDownloadOptions(false);
          }}
        >
          <span className={styles.downloadIcon}>📄</span> Text File (.txt)
        </button>

        <button
          className={styles.downloadOption}
          onClick={() => {
            handleDownloadFeedback("doc");
            setShowDownloadOptions(false);
          }}
        >
          <span className={styles.downloadIcon}>📝</span> Word Document (.doc)
        </button>

        <button
          className={styles.downloadOption}
          onClick={() => {
            handleDownloadFeedback("pdf");
            setShowDownloadOptions(false);
          }}
        >
          <span className={styles.downloadIcon}>📊</span> PDF Document (.pdf)
        </button>
      </div>
    );
  };

  // Map each category key to its label
  const categoryLabels: Record<string, string> = {
    general: "Overview",
    grammar: "Grammar",
    structure: "Structure",
    content: "Content",
    language: "Language",
    full: "Full Feedback",
  };

  // --- Main Component Render ---
  return (
    <div className={`${styles.essayPage} ${outfit.className}`}>
      {/* Render the Header component, passing onLogoClick to navigate home */}
      <Header onLogoClick={() => router.push("/")} />

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
              <div className={styles.inputContainerTitle}>
                <div className={styles.titleLabelContainer}>
                  <label htmlFor="essay-title" className={styles.inputLabel}>
                    Essay Title
                  </label>
                  <div className={styles.infoButtonWrapper}>
                    <button
                      className={styles.infoButton}
                      type="button"
                      aria-label="Essay title format information"
                    >
                      <span className={styles.infoIcon}>i</span>
                    </button>
                    <div className={styles.tooltip}>
                      <p>
                        Recommendation: Include the word count in your title.
                      </p>
                      <p className={styles.tooltipExample}>
                        Example: "What five words best describe you? (5 words)"
                      </p>
                    </div>
                  </div>
                </div>
                <input
                  id="essay-title"
                  type="text"
                  value={essayTitle}
                  onChange={(e) => setEssayTitle(e.target.value)}
                  className={styles.titleInput}
                  placeholder="Example: How did you spend your last two summers? (50 words)"
                />
              </div>

              <div className={styles.inputContainerEssay}>
                <div className={styles.titleLabelContainer}>
                  <label htmlFor="essay-text" className={styles.inputLabel}>
                    Essay Text
                  </label>
                  <div className={styles.infoButtonWrapper}>
                    <button
                      className={styles.infoButton}
                      type="button"
                      aria-label="Personal information warning"
                    >
                      <span className={styles.infoIcon}>i</span>
                    </button>
                    <div className={styles.tooltip}>
                      <p className={styles.tooltipWarning}>
                        <span className={styles.warningIcon}>⚠️</span>{" "}
                        <strong>Privacy Warning</strong>
                      </p>
                      <p>
                        Do not include personal information such as your name,
                        address, phone number, or email in your essay.
                      </p>
                      <p className={styles.tooltipReason}>
                        <strong>Why this matters:</strong> Information submitted
                        to AI systems may be:
                      </p>
                      <ul className={styles.tooltipList}>
                        <li>
                          Stored in databases that could be accessed later
                        </li>
                        <li>Used to train future AI models</li>
                        <li>Potentially vulnerable to privacy breaches</li>
                        <li>
                          Difficult or impossible to completely remove once
                          submitted
                        </li>
                      </ul>
                      <p className={styles.tooltipTip}>
                        <strong>Tip:</strong> Use pseudonyms or general
                        descriptions instead of specific personal details.
                      </p>
                    </div>
                  </div>
                </div>
                <GrammarHighlighter
                  text={essayText}
                  textareaRef={essayInputRef}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setEssayText(e.target.value)}
                  placeholder="Paste your essay text here..."
                  enableChecking={showGrammarCheck}
                />
              </div>

              <div className={styles.inputActions}>
                <button
                  className={`${styles.generateButton} ${
                    isGenerating ? styles.generating : ""
                  }`}
                  onClick={handleGenerateFeedback}
                  disabled={isGenerating || !essayText.trim()}
                >
                  {isGenerating
                    ? "Generating..."
                    : showGrammarCheck
                    ? "Regenerate Feedback"
                    : "Generate Feedback"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Feedback Output */}
          <div className={styles.columnContainer}>
            <div className={styles.outputSection}>
              <div className={styles.outputContainer}>
                {/* Feedback Header with Speak/Download + Category <select> */}
                <div className={styles.outputHeader}>
                  <h2 className={styles.outputTitle}>Feedback</h2>

                  {rawFeedback.trim().length > 0 && (
                    <div className={styles.headerActions}>
                      {/* CATEGORY DROPDOWN */}
                      <div className={styles.categorySelectWrapper}>
                        <select
                          className={styles.categorySelect}
                          value={currentCategory}
                          onChange={(e) =>
                            setCurrentCategory(
                              e.target.value as
                                | keyof FeedbackCategories
                                | "full"
                            )
                          }
                        >
                          <option value="general">
                            {categoryLabels.general}
                          </option>
                          {feedback.grammar && (
                            <option value="grammar">
                              {categoryLabels.grammar}
                            </option>
                          )}
                          {feedback.structure && (
                            <option value="structure">
                              {categoryLabels.structure}
                            </option>
                          )}
                          {feedback.content && (
                            <option value="content">
                              {categoryLabels.content}
                            </option>
                          )}
                          {feedback.language && (
                            <option value="language">
                              {categoryLabels.language}
                            </option>
                          )}
                          <option value="full">{categoryLabels.full}</option>
                        </select>
                      </div>

                      {/* Speak Button */}
                      <button
                        className={styles.speakButton}
                        onClick={handleSpeakFeedback}
                        aria-label={
                          isSpeaking ? "Stop speaking" : "Read feedback aloud"
                        }
                      >
                        <span className={styles.speakIcon}>
                          {isSpeaking ? "🔇" : "🔊"}
                        </span>
                        {isSpeaking ? "Stop" : "Speak"}
                      </button>

                      {/* Download Dropdown */}
                      <div
                        className={styles.downloadContainer}
                        ref={downloadContainerRef}
                      >
                        <button
                          className={styles.downloadButton}
                          onClick={() =>
                            setShowDownloadOptions(!showDownloadOptions)
                          }
                        >
                          Download
                        </button>
                        {renderDownloadOptions()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback Content Area */}
                {renderFeedbackContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}