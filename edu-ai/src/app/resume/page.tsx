"use client";

// -----------------------------------------------------------------------------
// ResumePage.tsx – client‑only résumé builder
// -----------------------------------------------------------------------------

import React, { useState, useRef, useEffect } from "react";
import styles from './resume.module.css';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import Header from '../header';

const outfit = Outfit({ subsets: ['latin'] });

/* ---------- Types ---------- */
interface Activity {
  activityType: string;
  position: string;
  organization: string;
  description: string;
  grades: string[];
  dates: string;
  location: string;
}

/* ---------- Helper ---------- */
const newActivity = (): Activity => ({
  activityType: "",
  position: "",
  organization: "",
  description: "",
  grades: [],
  dates: "",
  location: "",
});

// Helper to parse feedback into categories
function parseResumeFeedback(raw: string) {
  const result: Record<string, string> = {};
  const headings = [
    '**CLARITY:**',
    '**IMPACT:**',
    '**CONTENT:**',
    '**STRUCTURE:**',
    '**FULL FEEDBACK:**'
  ];
  const keys = ['clarity', 'impact', 'content', 'structure', 'full'];
  let lastIdx = 0;
  for (let i = 0; i < headings.length; i++) {
    const start = raw.indexOf(headings[i], lastIdx);
    if (start === -1) continue;
    const end = i + 1 < headings.length ? raw.indexOf(headings[i + 1], start + 1) : raw.length;
    result[keys[i]] = raw.substring(start + headings[i].length, end).trim();
    lastIdx = start + 1;
  }
  return result;
}

export default function ResumePage() {
  const router = useRouter();
  const [student, setStudent] = useState({ name: "", email: "", phone: "" });
  const [education, setEducation] = useState({
    school: "",
    gpa: "",
    awards: "",
    location: "",
    date: ""
  });
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [activities, setActivities] = useState<Activity[]>([newActivity()]);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState<'preview' | 'feedback'>('preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [rawFeedback, setRawFeedback] = useState('');
  const [parsedFeedback, setParsedFeedback] = useState<{ [key: string]: string }>({});
  const [currentCategory, setCurrentCategory] = useState<'clarity' | 'impact' | 'content' | 'structure' | 'full'>('clarity');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  const returnToHome = () => {
    router.push('/');
  };

  const handleStudent = (e: React.ChangeEvent<HTMLInputElement>) =>
    setStudent({ ...student, [e.target.name]: e.target.value });

  const handleEducation = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setEducation({ ...education, [e.target.name]: e.target.value });

  const handleActivity = (
    idx: number,
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setActivities((prev) => {
      const list = [...prev];
      if (type === "checkbox") {
        const s = new Set(list[idx].grades);
        checked ? s.add(value) : s.delete(value);
        list[idx].grades = Array.from(s);
      } else {
        // @ts-ignore dynamic assignment
        list[idx][name] = value;
      }
      return list;
    });
  };

  const addActivity = () =>
    activities.length < 10 && setActivities((p) => [...p, newActivity()]);

  const removeActivity = (i: number) =>
    setActivities((p) => p.filter((_, j) => j !== i));

  const Preview: React.FC = () => (
    <div className={styles.previewContainer}>
      {/* Name and Contact Info */}
      <div className={styles.previewHeader}>
        <div className={styles.previewName}>{student.name || "Student Name"}</div>
        <div className={styles.previewContact}>
          {(student.phone || "123-456-7890") + " | " + (student.email || "email@example.com")}
        </div>
      </div>
      <hr className={styles.previewDivider} />
      {/* Education Section */}
      <div className={styles.previewSection}>
        <div className={styles.previewSectionTitle}>Education</div>
        <div className={styles.eduRow}>
          <div className={styles.eduLeft}>
            <span className={styles.previewActivityTitle}>{education.school || "[School Name]"}</span>
            {education.awards && (
              <div className={styles.previewGrades}><em>{education.awards}</em></div>
            )}
          </div>
          <div className={styles.eduRight}>
            <div>{education.location || "[Location]"}</div>
            <div><em>{education.date || "[Date]"}</em></div>
          </div>
        </div>
      </div>
      {/* Experience Section */}
      <div className={styles.previewSection}>
        <div className={styles.previewSectionTitle}>Experience</div>
        {activities.map((a, i) =>
          a.position || a.organization || a.description ? (
            <div key={i} className={styles.previewActivity}>
              <div className={styles.expRow}>
                <div className={styles.expLeft}>
                  <span className={styles.previewActivityTitle}>{a.position || "[Role]"}</span>
                  {a.organization && <div className={styles.expOrg}><em>{a.organization}</em></div>}
                </div>
                <div className={styles.expRight}>
                  <div>{a.dates || "[Dates]"}</div>
                  {a.location && <div className={styles.expLoc}><em>{a.location}</em></div>}
                </div>
              </div>
              {a.description && (
                <ul className={styles.previewBulletList}>
                  {a.description
                    .split(/(?<=[.!?])\s+/)
                    .filter(line => line.trim().length > 0)
                    .map((sentence, j) => (
                      <li key={j} className={styles.previewBullet}>{sentence.trim()}</li>
                    ))}
                </ul>
              )}
            </div>
          ) : null
        )}
      </div>
      {/* Skills Section */}
      {skills && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Skills</div>
          <div>{skills}</div>
        </div>
      )}
      {/* Languages Section */}
      {languages && (
        <div className={styles.previewSection}>
          <div className={styles.previewSectionTitle}>Languages</div>
          <div>{languages}</div>
        </div>
      )}
    </div>
  );

  // Helper to download as Word
  const handleDownloadWord = () => {
    // Table-based layout for Word compatibility
    const tableSection = (title: string, rows: string[]): string => `
      <div style="font-size:19px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#222;margin-bottom:2px;margin-top:0;text-align:left;">${title}</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        ${rows.join('')}
      </table>
    `;
    // Education
    const eduRows = [`
      <tr>
        <td style="text-align:left;font-weight:bold;font-size:17px;vertical-align:top;">
          ${education.school || '[School Name]'}
          ${education.awards ? `<div style='font-style:italic;font-size:17px;'>${education.awards}</div>` : ''}
        </td>
        <td style="text-align:right;font-size:17px;vertical-align:top;">
          ${education.location || '[Location]'}<br/>
          <span style='font-style:italic;'>${education.date || '[Date]'}</span>
        </td>
      </tr>
    `];
    // Experience
    const expRows = activities.map(a =>
      (a.position || a.organization || a.description) ? `
        <tr>
          <td style="text-align:left;font-weight:bold;font-size:17px;vertical-align:top;width:60%;">
            ${a.position || '[Role]'}
            ${a.organization ? `<div style='font-style:italic;font-size:17px;'>${a.organization}</div>` : ''}
          </td>
          <td style="text-align:right;font-size:17px;vertical-align:top;width:40%;">
            ${a.dates || '[Dates]'}<br/>
            ${a.location ? `<span style='font-style:italic;'>${a.location}</span>` : ''}
          </td>
        </tr>
        ${a.description ? `<tr><td colspan='2' style='padding-left:24px;padding-top:0;'><ul style='margin:0 0 8px 0;padding-left:18px;font-size:17px;line-height:1.2;'>${a.description.split(/(?<=[.!?])\s+/).filter(line => line.trim().length > 0).map(sentence => `<li style='margin-bottom:0;'>${sentence.trim()}</li>`).join('')}</ul></td></tr>` : ''}
      ` : ''
    );
    // Skills & Languages
    const skillsSection = skills ? `<div style='font-size:19px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#222;margin-bottom:2px;margin-top:0;text-align:left;'>Skills</div><div style='font-size:17px;margin-bottom:12px;'>${skills}</div>` : '';
    const languagesSection = languages ? `<div style='font-size:19px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#222;margin-bottom:2px;margin-top:0;text-align:left;'>Languages</div><div style='font-size:17px;margin-bottom:12px;'>${languages}</div>` : '';
    // Header
    const header = `
      <div style='text-align:center;margin-bottom:12px;'>
        <div style='font-size:28px;font-weight:bold;letter-spacing:0.5px;'>${student.name || 'Student Name'}</div>
        <div style='font-size:17px;color:#444;margin-bottom:8px;'>${(student.phone || '123-456-7890') + ' | ' + (student.email || 'email@example.com')}</div>
      </div>
      <hr style='border:none;border-top:1.5px solid #bbb;margin:12px 0 18px 0;' />
    `;
    // Compose HTML
    const htmlContent = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Resume</title></head><body style='font-family:Times New Roman,Times,serif;font-size:17px;color:#222;'>${header}${tableSection('Education', eduRows)}${tableSection('Experience', expRows)}${skillsSection}${languagesSection}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to generate feedback
  const handleGenerateFeedback = async () => {
    setError('');
    setIsGenerating(true);
    setFeedback('');
    setRawFeedback('');
    setParsedFeedback({});
    try {
      // Compose a string with all resume content
      const resumeContent = `Name: ${student.name}\nEmail: ${student.email}\nPhone: ${student.phone}\nSchool: ${education.school}\nGPA: ${education.gpa}\nAwards: ${education.awards}\nSkills: ${skills}\nLanguages: ${languages}\nActivities:\n${activities.map(a => `- ${a.position} at ${a.organization} (${a.dates}, ${a.location}): ${a.description}`).join('\n')}`;
      const response = await fetch('/resume/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: resumeContent }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      const data = await response.json();
      setRawFeedback(data.feedback || 'No feedback returned.');
      setParsedFeedback(parseResumeFeedback(data.feedback || ''));
      setCurrentCategory('clarity');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSpeakFeedback = () => {
    if (!speechSynthesisRef.current) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }
    if (isSpeaking) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToRead = currentCategory === 'full' ? rawFeedback : parsedFeedback[currentCategory] || '';
    const utterance = new window.SpeechSynthesisUtterance(textToRead);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesisRef.current.speak(utterance);
  };

  return (
    <div className={`${styles.resumePage} ${outfit.className}`}>
      {/* ---------- HEADER ---------- */}
      <Header onLogoClick={returnToHome} />
      
      {/* ---------- YELLOW BANNER ---------- */}
      <div className={styles.banner}>
        <div className={styles.bannerContainer}>
          <h1 className={styles.bannerTitle}>BUILD RESUME</h1>
        </div>
      </div>

      {/* ---------- MAIN RESUME LAYOUT ---------- */}
      <div className={styles.mainContainer}>
        {/* -------- LEFT PANE -------- */}
        <div className={styles.leftPanel}>
          <h2 className={styles.sectionTitle}>Student Info</h2>
          <input name="name" value={student.name} onChange={handleStudent} placeholder="Name" className={styles.inputField} />
          <input name="email" value={student.email} onChange={handleStudent} placeholder="Email" className={styles.inputField} />
          <input name="phone" value={student.phone} onChange={handleStudent} placeholder="Phone" className={styles.inputField} />

          <h2 className={styles.sectionTitle}>Education</h2>
          <input name="school" value={education.school} onChange={handleEducation} placeholder="School" className={styles.inputField} />
          <input name="gpa" value={education.gpa} onChange={handleEducation} placeholder="GPA" className={styles.inputField} />
          <textarea name="awards" value={education.awards} onChange={handleEducation} placeholder="Awards" className={styles.textareaField} />
          <input name="location" value={education.location} onChange={handleEducation} placeholder="Location (e.g. Georgetown, TX)" className={styles.inputField} />
          <input name="date" value={education.date} onChange={handleEducation} placeholder="Date (e.g. Aug. 2018 – May 2021)" className={styles.inputField} />

          <h2 className={styles.sectionTitle}>Activities</h2>
          {activities.map((a, i) => (
            <div key={i} className={styles.activityCard}>
              <div className={styles.activityHeader}>
                Activity {i + 1}
                {activities.length > 1 && (
                  <button onClick={() => removeActivity(i)} className={styles.removeButton}>
                    remove
                  </button>
                )}
              </div>
              <select name="activityType" value={a.activityType} onChange={(e) => handleActivity(i, e)} className={styles.inputField}>
                <option value="">Type</option>
                {["Sports", "Internship", "Research", "Job", "Other", "Club", "Volunteering"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input name="position" value={a.position} onChange={(e) => handleActivity(i, e)} placeholder="Position" className={styles.inputField} />
              <input name="organization" value={a.organization} onChange={(e) => handleActivity(i, e)} placeholder="Organization" className={styles.inputField} />
              <textarea name="description" value={a.description} onChange={(e) => handleActivity(i, e)} placeholder="Description" className={styles.textareaField} />
              <input name="location" value={a.location} onChange={(e) => handleActivity(i, e)} placeholder="Location" className={styles.inputField} />
              <input name="dates" value={a.dates} onChange={(e) => handleActivity(i, e)} placeholder="Dates (e.g. 2023–24)" className={styles.inputField} />
              <div className="text-xs">
                Grades:&nbsp;
                {[9, 10, 11, 12].map((g) => (
                  <label key={g} className="mr-2">
                    <input
                      type="checkbox"
                      name="grades"
                      value={g}
                      checked={a.grades.includes(g.toString())}
                      onChange={(e) => handleActivity(i, e)}
                    />{" "}
                    {g}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {activities.length < 10 && (
            <button onClick={addActivity} className={styles.addButton}>
              + Add Activity
            </button>
          )}

          <h2 className={styles.sectionTitle}>Skills</h2>
          <textarea
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., Leadership, Web Design, etc."
            className={styles.textareaField}
          />

          <h2 className={styles.sectionTitle}>Languages</h2>
          <textarea
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="e.g., English (fluent), Spanish (conversational)"
            className={styles.textareaField}
          />

          <div className={styles.actionButtons}>
            <button onClick={handleDownloadWord} className={styles.downloadButton}>
              Download Word
            </button>
            <button
              onClick={handleGenerateFeedback}
              className={`${styles.generateButton} ${isGenerating ? 'disabled' : ''}`}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Feedback'}
            </button>
          </div>
        </div>

        {/* -------- RIGHT PANE -------- */}
        <div className={styles.rightPanel}>
          {/* Tabs */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${selectedTab === 'preview' ? styles.active : ''}`}
              onClick={() => setSelectedTab('preview')}
            >
              Preview
            </button>
            <button
              className={`${styles.tabButton} ${selectedTab === 'feedback' ? styles.active : ''}`}
              onClick={() => setSelectedTab('feedback')}
            >
              Feedback
            </button>
          </div>
          
          {/* Tab Content */}
          <div id="print-area" ref={printAreaRef}>
            {selectedTab === 'preview' ? (
              <Preview />
            ) : (
              <div className={styles.feedbackContainer}>
                <div className={styles.feedbackHeader}>
                  <h2 className={styles.feedbackTitle}>Resume Feedback</h2>
                  {rawFeedback && (
                    <div className={styles.feedbackActions}>
                      <select
                        className={styles.categorySelect}
                        value={currentCategory}
                        onChange={e => setCurrentCategory(e.target.value as any)}
                      >
                        <option value="clarity">Clarity</option>
                        <option value="impact">Impact</option>
                        <option value="content">Content</option>
                        <option value="structure">Structure</option>
                        <option value="full">Full Feedback</option>
                      </select>
                      <button
                        className={styles.speakButton}
                        onClick={handleSpeakFeedback}
                        disabled={!rawFeedback}
                        aria-label={isSpeaking ? 'Stop speaking' : 'Read feedback aloud'}
                      >
                        <span className={styles.speakIcon}>{isSpeaking ? '🔇' : '🔊'}</span>
                        {isSpeaking ? 'Stop' : 'Speak'}
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.feedbackContent}>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                  {isGenerating && <div className={styles.loadingMessage}>Analyzing your resume and generating feedback...</div>}
                  {rawFeedback && !isGenerating && (
                    <div className={styles.feedbackText}>
                      {(parsedFeedback[currentCategory] || 'No feedback for this category.').split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                      ))}
                    </div>
                  )}
                  {!rawFeedback && !isGenerating && !error && (
                    <div className={styles.placeholderMessage}>Your feedback will appear here after you generate it.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
