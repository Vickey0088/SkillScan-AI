'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

// --- Helper Components ---

function Card({ title, children, className = '' }) {
  return (
    <div className={clsx('rounded-2xl border border-gray-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow', className)}>
      <h2 className="text-lg font-semibold tracking-tight text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function ScoreCircle({ score, size = 'lg' }) {
  const radius = size === 'lg' ? 45 : 35
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = (s) => {
    if (s >= 80) return 'text-green-600'
    if (s >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  const getStrokeColor = (s) => {
    if (s >= 80) return '#059669'
    if (s >= 60) return '#D97706'
    return '#DC2626'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90" width={radius * 2 + 10} height={radius * 2 + 10}>
        <circle cx={radius + 5} cy={radius + 5} r={radius} stroke="#E5E7EB" strokeWidth="4" fill="none" />
        <circle
          cx={radius + 5} cy={radius + 5} r={radius}
          stroke={getStrokeColor(score)} strokeWidth="4" fill="none"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={clsx('font-bold', size === 'lg' ? 'text-2xl' : 'text-xl', getScoreColor(score))}>
            {score}
          </div>
          {size === 'lg' && <div className="text-xs text-gray-500 -mt-1">out of 100</div>}
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )
}

// --- Main Component ---

export default function AIResumeAnalyzerFeedback() {
  const router = useRouter()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Retrieve result from localStorage or query params
    const storedResult = localStorage.getItem('resumeAnalysisResult')
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult))
      } catch (e) {
        console.error('Failed to parse stored result:', e)
      }
    } else {
      // If no result, redirect back
      router.push('/components/ai-resume-analyser')
    }
    setLoading(false)
  }, [router])

  if (loading) return <LoadingSpinner />

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No analysis data found.</p>
          <button
            onClick={() => router.push('/components/ai-resume-analyser')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back to Analyzer
          </button>
        </div>
      </div>
    )
  }

  const { ats, ai, meta } = result

  return (
    <div className="min-h-screen w-full bg-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/90 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl">📊</div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Analysis Feedback</p>
              <h1 className="font-bold tracking-tight text-xl text-gray-900">Resume Insights</h1>
            </div>
          </div>
          <button
            onClick={() => router.push('/components/ai-resume-analyser')}
            className="text-sm rounded-xl border px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            Analyze Another
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ATS Score Overview */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ATS Compatibility Score</h3>
                      <p className="text-gray-600 mb-4">Your resume&rsquo;s overall score based on ATS standards.</p>
              <div className="text-sm text-gray-500">
                <p>Grade: <span className="font-semibold text-gray-900">{ats.grade}</span></p>
                <p>Processed in {meta.processingTime}ms</p>
              </div>
            </div>
            <ScoreCircle score={ats.score} />
          </div>
        </Card>

        {/* Score Breakdown */}
        <Card title="Detailed Score Breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ats.breakdown).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize">{key.replace('_', ' ')}</h4>
                <p className="text-2xl font-bold text-indigo-600">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Section Explanations and Mistakes */}
        <Card title="Resume Section Analysis">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths in Sections</h3>
              <div className="space-y-4">
                {ats.stats.sections > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="font-medium text-green-800">Complete Resume Structure</span>
                    </div>
                    <p className="text-green-700 text-sm ml-6">You have {ats.stats.sections} standard sections (Experience, Education, Skills, etc.), which is excellent for ATS parsing. This ensures recruiters and systems can easily find and categorize your information.</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <span className="font-medium text-red-800">Missing Standard Sections</span>
                    </div>
                    <p className="text-red-700 text-sm ml-6">Your resume lacks standard sections. Add Experience, Education, Skills, and Projects sections to improve structure and ATS compatibility.</p>
                  </div>
                )}
                {ats.stats.actionVerbs > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="font-medium text-green-800">Strong Action Verbs</span>
                    </div>
                  <p className="text-green-700 text-sm ml-6">{ats.stats.actionVerbs} action verbs detected, which significantly enhances the impact of your experience descriptions. Action verbs like &ldquo;Developed&rdquo;, &ldquo;Managed&rdquo;, &ldquo;Optimized&rdquo; make your achievements more compelling and keyword-rich.</p>
                  </div>
                )}
                {ats.stats.metrics > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="font-medium text-green-800">Quantifiable Achievements</span>
                    </div>
                    <p className="text-green-700 text-sm ml-6">{ats.stats.metrics} quantifiable achievements found, which demonstrates measurable results. Numbers and percentages show the tangible impact of your work, making your resume more impressive to employers.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement by Section</h3>
              <div className="space-y-4">
                {/* Summary Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">📝 Summary/Profile Section</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-yellow-900">Common Issue:</p>
                      <p className="text-yellow-700 italic">&ldquo;I am a software developer with experience in various technologies.&rdquo;</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Why it is a problem:</p>
                      <p className="text-yellow-700">Generic statements do not highlight your unique value or specific expertise.</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">How to improve:</p>
                      <ol className="list-decimal list-inside text-yellow-700 space-y-1 ml-4">
                        <li>Start with your years of experience and specialization</li>
                        <li>Include 2-3 key skills or achievements</li>
                        <li>Mention the impact you have made</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Example improvement:</p>
                      <p className="text-yellow-700 italic bg-yellow-100 p-2 rounded">&ldquo;Experienced Full-Stack Developer with 5+ years specializing in React and Node.js. Successfully delivered 15+ web applications, improving user engagement by 40% and reducing load times by 60%.&rdquo;</p>
                    </div>
                  </div>
                </div>

                {/* Experience Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">💼 Experience Section</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-yellow-900">Common Issue:</p>
                      <p className="text-yellow-700 italic">&ldquo;Developed applications&rdquo; or &ldquo;Worked on projects&rdquo;</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Why it&apos;s a problem:</p>
                      <p className="text-yellow-700">Vague descriptions don&apos;t show what you actually did or the results achieved.</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">How to improve:</p>
                      <ol className="list-decimal list-inside text-yellow-700 space-y-1 ml-4">
                        <li>Use strong action verbs (Developed, Implemented, Optimized)</li>
                        <li>Include specific technologies and tools used</li>
                        <li>Add quantifiable results and impact</li>
                        <li>Mention challenges overcome</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Example improvement:</p>
                      <div className="text-yellow-700 bg-yellow-100 p-2 rounded">
                        <p className="font-medium">Before:</p>
                        <p className="italic">&ldquo;Developed web applications using React&rdquo;</p>
                        <p className="font-medium mt-1">After:</p>
                        <p className="italic">&ldquo;Developed and deployed 3 responsive web applications using React and TypeScript, serving 10,000+ users and reducing bounce rate by 35% through optimized performance and intuitive UX design&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">🛠️ Skills Section</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-yellow-900">Common Issue:</p>
                      <p className="text-yellow-700 italic">Listing skills without proficiency levels or relevance</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Why it&apos;s a problem:</p>
                      <p className="text-yellow-700">Employers can&apos;t gauge your expertise level or how skills apply to their needs.</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">How to improve:</p>
                      <ol className="list-decimal list-inside text-yellow-700 space-y-1 ml-4">
                        <li>Categorize skills (Technical, Soft Skills, Tools)</li>
                        <li>Include proficiency levels (Beginner, Intermediate, Expert)</li>
                        <li>Prioritize relevant skills for target roles</li>
                        <li>Include certifications or years of experience</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Example improvement:</p>
                      <div className="text-yellow-700 bg-yellow-100 p-2 rounded">
                        <p className="font-medium">Before:</p>
                        <p className="italic">&ldquo;JavaScript, Python, React&rdquo;</p>
                        <p className="font-medium mt-1">After:</p>
                        <p className="italic"><strong>Programming Languages:</strong> JavaScript (Expert, 4 years), Python (Intermediate, 2 years)<br/><strong>Frameworks:</strong> React (Expert), Node.js (Advanced)<br/><strong>Tools:</strong> Git, Docker, AWS (Certified)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">🎓 Education Section</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-yellow-900">Common Issue:</p>
                      <p className="text-yellow-700 italic">Only listing degree and institution without relevant details</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Why it&apos;s a problem:</p>
                      <p className="text-yellow-700">Misses opportunities to highlight relevant coursework, projects, or achievements.</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">How to improve:</p>
                      <ol className="list-decimal list-inside text-yellow-700 space-y-1 ml-4">
                        <li>Include GPA if above 3.5</li>
                        <li>Add relevant coursework or projects</li>
                        <li>Mention honors, awards, or leadership roles</li>
                        <li>Include relevant certifications</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Example improvement:</p>
                      <div className="text-yellow-700 bg-yellow-100 p-2 rounded">
                        <p className="font-medium">Before:</p>
                        <p className="italic">&ldquo;Bachelor of Computer Science, XYZ University, 2020&rdquo;</p>
                        <p className="font-medium mt-1">After:</p>
                        <p className="italic"><strong>Bachelor of Computer Science</strong>, XYZ University, 2020<br/>GPA: 3.8/4.0 | Relevant Coursework: Data Structures, Algorithms, Software Engineering<br/>Projects: Developed AI chatbot (Python, TensorFlow) | Awarded Dean&rsquo;s List 3 semesters</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects Section */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">🚀 Projects Section</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-yellow-900">Common Issue:</p>
                      <p className="text-yellow-700 italic">&ldquo;Built a website&rdquo; without details</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Why it&apos;s a problem:</p>
                      <p className="text-yellow-700">Doesn&apos;t showcase technical skills or problem-solving abilities.</p>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">How to improve:</p>
                      <ol className="list-decimal list-inside text-yellow-700 space-y-1 ml-4">
                        <li>Describe the problem solved</li>
                        <li>List technologies and tools used</li>
                        <li>Include results or impact</li>
                        <li>Add links to live demos or code repositories</li>
                      </ol>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900">Example improvement:</p>
                      <div className="text-yellow-700 bg-yellow-100 p-2 rounded">
                        <p className="font-medium">Before:</p>
                        <p className="italic">&ldquo;E-commerce Website - Built using React&rdquo;</p>
                        <p className="font-medium mt-1">After:</p>
                        <p className="italic"><strong>E-commerce Platform</strong> | React, Node.js, MongoDB<br/>Developed full-stack e-commerce solution with user authentication, payment integration, and admin dashboard. Implemented responsive design serving 500+ users, reducing cart abandonment by 25%. Features: Real-time inventory, order tracking, and automated email notifications. <a href="#" className="underline">Live Demo</a> | <a href="#" className="underline">GitHub</a></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional ATS-specific warnings */}
              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-gray-900">Additional ATS Issues Found:</h4>
                {ats.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <span className="text-yellow-500 mt-1">⚠</span>
                    <span className="text-yellow-800">{reason}</span>
                  </div>
                ))}
                {ats.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded p-3">
                    <span className="text-red-500 mt-1">✗</span>
                    <span className="text-red-800">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        {ai.strengths.length > 0 && (
          <Card title="AI-Identified Strengths" className="border-green-200 bg-green-50">
            <ul className="space-y-2">
              {ai.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">💪</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {ai.recommendations.length > 0 && (
          <Card title="AI Recommendations for Improvement" className="border-blue-200 bg-blue-50">
            <ul className="space-y-2">
              {ai.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">💡</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Job Description Match */}
        {ai.job_description_match && ai.job_description_match.overall_fit_score > 0 && (
          <Card title="Job Description Alignment" className="border-purple-200 bg-purple-50">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Fit Score</p>
                <p className="text-2xl font-bold text-purple-600">{ai.job_description_match.overall_fit_score}/100</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Justification</p>
                <p>{ai.job_description_match.justification}</p>
              </div>
            </div>
            {ai.job_description_match.missing_skills.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Missing Skills/Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {ai.job_description_match.missing_skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Meta Info */}
        <Card title="Analysis Details" className="text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>File:</strong> {meta.filename}</p>
              <p><strong>Size:</strong> {Math.round(meta.fileSize / 1024)} KB</p>
            </div>
            <div>
              <p><strong>Text Length:</strong> {meta.textLength} characters</p>
              <p><strong>Timestamp:</strong> {new Date(meta.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
        <p>Powered by AI analysis for better resume optimization.</p>
      </footer>
    </div>
  )
}