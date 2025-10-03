// lib/rubric.js
const ACTION_VERBS = new Set([
  'achieved', 'built', 'led', 'designed', 'implemented', 'optimized', 
  'launched', 'automated', 'scaled', 'migrated', 'refactored', 'secured',
  'instrumented', 'deployed', 'shipped', 'mentored', 'developed', 'created',
  'improved', 'increased', 'reduced', 'streamlined', 'collaborated', 'delivered',
  'established', 'enhanced', 'generated', 'managed', 'coordinated', 'executed',
  'spearheaded', 'pioneered', 'transformed', 'revolutionized'
]);

const TECH_KEYWORDS = new Set([
  'react', 'javascript', 'typescript', 'node.js', 'python', 'java', 'sql',
  'mongodb', 'postgresql', 'aws', 'azure', 'docker', 'kubernetes', 'git',
  'redux', 'next.js', 'vue.js', 'angular', 'express', 'spring', 'django',
  'flask', 'rest', 'graphql', 'microservices', 'api', 'html', 'css', 'sass',
  'tailwind', 'bootstrap', 'webpack', 'jest', 'cypress', 'jenkins', 'ci/cd'
]);

const REQUIRED_SECTIONS = new Set([
  'experience', 'education', 'skills', 'projects'
]);

const OPTIONAL_SECTIONS = new Set([
  'summary', 'certifications', 'achievements', 'awards', 'publications'
]);

const ATS_RED_FLAGS = [
  { pattern: /\bphoto\b|\bimage\b|\bheadshot\b/i, message: 'Remove photos - not ATS-friendly' },
  { pattern: /\btable\b.*\blayout\b/i, message: 'Avoid complex table layouts' },
  { pattern: /\bobjective\b/i, message: "Replace 'Objective' with 'Summary'" },
  { pattern: /[^\x00-\x7F]/g, message: 'Remove special characters and symbols' },
  { pattern: /\bfax\b/i, message: 'Remove outdated contact methods (fax)' }
];

export function score(resumeText, targetText = '') {
  const text = (resumeText || '').toLowerCase();
  const originalText = resumeText || '';
  let totalScore = 0;
  const feedback = [];
  const warnings = [];

  console.log('Scoring resume with text length:', text.length);

  // 1. SECTION STRUCTURE (25 points)
  let sectionScore = 0;
  let foundSections = 0;
  
  REQUIRED_SECTIONS.forEach(section => {
    const regex = new RegExp(`\\b${section}\\b`, 'i');
    if (regex.test(originalText)) {
      foundSections++;
      sectionScore += 5;
    }
  });

  OPTIONAL_SECTIONS.forEach(section => {
    const regex = new RegExp(`\\b${section}\\b`, 'i');
    if (regex.test(originalText)) {
      foundSections++;
      sectionScore += 1;
    }
  });

  sectionScore = Math.min(25, sectionScore);
  totalScore += sectionScore;

  if (foundSections < 4) {
    feedback.push('Add standard sections: Experience, Education, Skills, Projects');
  }
  if (!text.includes('summary') && !text.includes('profile')) {
    feedback.push('Consider adding a Professional Summary section');
  }

  // 2. CONTACT INFORMATION (10 points)
  let contactScore = 0;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinPattern = /linkedin\.com\/in\/[\w-]+/i;
  const githubPattern = /github\.com\/[\w-]+/i;

  if (emailPattern.test(originalText)) contactScore += 3;
  else feedback.push('Add professional email address');

  if (phonePattern.test(originalText)) contactScore += 2;
  else feedback.push('Add phone number');

  if (linkedinPattern.test(originalText)) contactScore += 3;
  else feedback.push('Add LinkedIn profile URL');

  if (githubPattern.test(originalText)) contactScore += 2;
  else feedback.push('Add GitHub profile (recommended for tech roles)');

  totalScore += contactScore;

  // 3. ACTION VERBS & IMPACT (20 points)
  let actionScore = 0;
  let verbCount = 0;
  
  ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = originalText.match(regex);
    if (matches) {
      verbCount += matches.length;
    }
  });

  if (verbCount >= 8) actionScore = 20;
  else if (verbCount >= 5) actionScore = 15;
  else if (verbCount >= 3) actionScore = 10;
  else if (verbCount >= 1) actionScore = 5;

  totalScore += actionScore;

  if (verbCount < 5) {
    feedback.push('Use more action verbs (built, led, implemented, optimized, etc.)');
  }

  // 4. QUANTIFIED ACHIEVEMENTS (20 points)
  const metricPatterns = [
    /\d+%/g,                           // percentages
    /\$\d+[KkMmBb]?/g,                // dollar amounts
    /₹\d+[LlKkCr]*\+?/g,              // rupee amounts
    /\d+[KkMmBb]\+?\s*(users?|customers?|clients?)/gi,
    /\d+[KkMmBb]?\+?\s*(revenue|sales|profit)/gi,
    /\d+[KkMmBb]?\+?\s*downloads?/gi,
    /\d+x\s*(faster|improvement|increase)/gi,
    /reduced?\s*by\s*\d+%/gi,
    /increased?\s*by\s*\d+%/gi,
    /improved?\s*by\s*\d+%/gi
  ];

  let metricsCount = 0;
  metricPatterns.forEach(pattern => {
    const matches = originalText.match(pattern);
    if (matches) metricsCount += matches.length;
  });

  let metricsScore = 0;
  if (metricsCount >= 6) metricsScore = 20;
  else if (metricsCount >= 4) metricsScore = 15;
  else if (metricsCount >= 2) metricsScore = 10;
  else if (metricsCount >= 1) metricsScore = 5;

  totalScore += metricsScore;

  if (metricsCount < 3) {
    feedback.push('Quantify achievements with numbers, percentages, or metrics');
  }

  // 5. TECHNICAL SKILLS & KEYWORDS (15 points)
  let techScore = 0;
  let techCount = 0;

  // Count tech keywords
  TECH_KEYWORDS.forEach(tech => {
    const regex = new RegExp(`\\b${tech}\\b`, 'gi');
    if (regex.test(text)) techCount++;
  });

  if (techCount >= 10) techScore = 15;
  else if (techCount >= 7) techScore = 12;
  else if (techCount >= 5) techScore = 8;
  else if (techCount >= 3) techScore = 5;

  totalScore += techScore;

  // Match with job description if provided
  if (targetText && targetText.trim()) {
    const targetLower = targetText.toLowerCase();
    const targetKeywords = new Set();
    
    // Extract keywords from job description
    const words = targetLower.match(/[a-zA-Z][a-zA-Z0-9+\-.#]{2,}/g) || [];
    words.forEach(word => {
      if (word.length > 3 && !['and', 'the', 'for', 'with', 'this', 'that', 'will', 'are'].includes(word)) {
        targetKeywords.add(word);
      }
    });

    let keywordMatches = 0;
    targetKeywords.forEach(keyword => {
      if (text.includes(keyword)) keywordMatches++;
    });

    const keywordScore = targetKeywords.size > 0 
      ? Math.min(10, Math.round((keywordMatches / Math.min(targetKeywords.size, 20)) * 10))
      : 0;
    
    totalScore += keywordScore;

    if (keywordScore < 5) {
      feedback.push('Include more keywords from the job description');
    }
  }

  // 6. ATS COMPATIBILITY (10 points)
  let atsScore = 10;
  
  ATS_RED_FLAGS.forEach(flag => {
    if (flag.pattern.test(originalText)) {
      atsScore -= 2;
      warnings.push(flag.message);
    }
  });

  // Check for proper formatting
  const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longSentences = sentences.filter(s => s.length > 200);
  
  if (longSentences.length > 3) {
    atsScore -= 2;
    warnings.push('Break down overly long sentences for better readability');
  }

  atsScore = Math.max(0, atsScore);
  totalScore += atsScore;

  // Final score calculation and grade
  const finalScore = Math.min(100, Math.round(totalScore));
  let grade = 'F';
  if (finalScore >= 90) grade = 'A+';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 60) grade = 'C';
  else if (finalScore >= 50) grade = 'D';

  const result = {
    score: finalScore,
    grade: grade,
    breakdown: {
      sections: `${Math.round((sectionScore/25) * 100)}% (${sectionScore}/25)`,
      contact: `${Math.round((contactScore/10) * 100)}% (${contactScore}/10)`,
      impact: `${Math.round((actionScore/20) * 100)}% (${actionScore}/20)`,
      metrics: `${Math.round((metricsScore/20) * 100)}% (${metricsScore}/20)`,
      technical: `${Math.round((techScore/15) * 100)}% (${techScore}/15)`,
      ats: `${Math.round((atsScore/10) * 100)}% (${atsScore}/10)`
    },
    reasons: feedback,
    warnings: warnings,
    stats: {
      actionVerbs: verbCount,
      metrics: metricsCount,
      techSkills: techCount,
      sections: foundSections
    }
  };

  console.log('Resume scoring result:', result);
  return result;
}