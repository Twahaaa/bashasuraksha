"use client"
import { useState } from "react"
import { Sparkles, Users, Lightbulb, ArrowRight, Plus, Shield, Globe, Lock } from "lucide-react"

// --- Modern Abstract Background Component ---
const ModernBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="w-full h-full absolute bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
      <style>
        {`
                .flow-line {
                    position: absolute;
                    border: 1px solid;
                    border-radius: 50%;
                    opacity: 0.1;
                    animation: float 25s ease-in-out infinite;
                }

                .flow-line-1 {
                    width: 600px;
                    height: 600px;
                    top: -10%;
                    right: -5%;
                    border-color: #FACC15; /* Yellow-400 */
                    animation-delay: 0s;
                }

                .flow-line-2 {
                    width: 800px;
                    height: 800px;
                    top: 30%;
                    left: -10%;
                    border-color: #737373; /* Neutral-500 */
                    animation-delay: -5s;
                }

                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(20px, 20px) rotate(5deg); }
                }

                .gold-glow {
                    position: absolute;
                    width: 800px;
                    height: 800px;
                    background: radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(82, 82, 82, 0.05) 40%, rgba(0,0,0,0) 70%);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }
            `}
      </style>
      <div className="gold-glow"></div>
      <div className="flow-line flow-line-1"></div>
      <div className="flow-line flow-line-2"></div>
    </div>
  </div>
)

// --- FAQ Data ---
const faqs = [
  {
    id: 1,
    question: "What kind of data does BhashaSuraksha analyze?",
    answer:
      "BhashaSuraksha processes and analyzes large-scale linguistic data (text, speech transcripts) to identify security risks, safety violations, and communication anomalies.",
  },
  {
    id: 2,
    question: "How does the Risk HeatMap work?",
    answer:
      "The HeatMap visually represents areas of high linguistic risk, allowing users to instantly identify problematic communication channels, geographical regions, or time periods requiring immediate attention.",
  },
  {
    id: 3,
    question: "Is BhashaSuraksha compliant with data privacy regulations?",
    answer:
      "Yes, we prioritize privacy. All linguistic data is processed anonymously and securely, ensuring compliance with major global data protection standards like GDPR and CCPA.",
  },
  {
    id: 4,
    question: "Can I integrate BhashaSuraksha into my existing app?",
    answer:
      "Absolutely. We offer flexible API endpoints for seamless integration, allowing you to incorporate real-time linguistic safety checks into any web, mobile, or enterprise application.",
  },
]

// --- FAQ Item Component ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="group border-b border-neutral-800 hover:border-yellow-600/50 transition-all duration-300 bg-gradient-to-r from-transparent via-transparent to-transparent hover:via-yellow-900/5">
      <button className="flex justify-between items-center w-full py-6 text-left" onClick={() => setIsOpen(!isOpen)}>
        <span
          className={`text-lg font-medium transition-colors duration-300 ${isOpen ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600" : "text-neutral-200 group-hover:text-yellow-500"}`}
        >
          {question}
        </span>
        <Plus
          className={`w-5 h-5 flex-shrink-0 transform transition-transform duration-300 ${isOpen ? "rotate-45 text-yellow-500" : "rotate-0 text-neutral-500"}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-48 opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-neutral-400 leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  )
}

// --- FAQ Section Component ---
const FAQSection = () => (
  <section className="py-32 px-6 relative" id="about">
    <div className="max-w-4xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
          Frequently Asked{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-700">
            Questions
          </span>
        </h2>
        <p className="text-xl text-neutral-400">Everything you need to know about our security protocols.</p>
      </div>

      <div className="space-y-2">
        {faqs.map((faq) => (
          <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  </section>
)

// --- Main App Component ---
export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-neutral-200 selection:bg-yellow-500/30 selection:text-yellow-200 font-serif">
      {/* Modern Background */}
      <div className="fixed inset-0 -z-10">
        <ModernBackground />
      </div>

      {/* Main Content Container */}
      <div className="relative flex flex-col min-h-screen z-10">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-6 pt-20 pb-20">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="lg:col-span-7 space-y-10">
              {/* Brand Mark (Replacing Navbar) */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 rounded-sm flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 uppercase">
                  BhashaSuraksha
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight text-white">
                  Secure your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700">
                    Digital Voice.
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-neutral-400 leading-relaxed max-w-xl border-l-2 border-yellow-600/30 pl-6 font-sans">
                  Advanced linguistic data analysis for real-time threat detection and communication security.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-lg group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-neutral-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-neutral-900/80 backdrop-blur-sm rounded-lg p-2 border border-neutral-800">
                  <input
                    type="text"
                    placeholder="Analyze a text stream..."
                    className="w-full px-4 py-3 bg-transparent text-white placeholder-neutral-500 focus:outline-none text-lg"
                  />
                  <button className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black rounded-md transition-all duration-200 shadow-lg shadow-yellow-500/20">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-6 pt-4">
                <button className="px-8 py-4 bg-gradient-to-r from-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-200 text-black rounded-sm font-bold text-sm tracking-widest uppercase transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Start Free Trial
                </button>

                <button className="px-8 py-4 bg-transparent border border-neutral-700 hover:border-yellow-500/50 text-neutral-300 hover:text-yellow-400 rounded-sm font-bold text-sm tracking-widest uppercase transition-all duration-200 hover:bg-yellow-500/5">
                  View Documentation
                </button>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="lg:col-span-5 relative">
              <div className="relative z-10 bg-neutral-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                      Live Analysis
                    </h3>
                    <p className="text-yellow-500 text-sm font-medium mt-1">System Active</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Threat Detection", value: "99.9%", icon: Shield },
                    { label: "Global Coverage", value: "142 Regions", icon: Globe },
                    { label: "Encryption", value: "End-to-End", icon: Lock },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 bg-neutral-950/50 rounded-lg border border-white/5 hover:border-yellow-500/30 transition-colors group"
                    >
                      <div className="p-3 bg-neutral-900 rounded-md text-yellow-500 group-hover:text-yellow-400 transition-colors">
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-neutral-500 text-xs uppercase tracking-wider">{stat.label}</p>
                        <p className="text-white font-bold text-lg">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full w-[75%] bg-gradient-to-r from-yellow-600 to-yellow-400"></div>
                    </div>
                    <span>Processing...</span>
                  </div>
                </div>
              </div>

              {/* Decorative Elements behind card */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-yellow-600/20 to-transparent rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-gradient-to-tr from-neutral-500/10 to-transparent rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="py-32 px-6 bg-gradient-to-b from-neutral-900/50 to-black border-y border-white/5"
          id="features"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="group p-8 border-l border-neutral-800 hover:border-yellow-500 transition-all duration-500 bg-gradient-to-b from-transparent to-transparent hover:to-yellow-900/10">
                <Lightbulb className="w-10 h-10 text-yellow-600 group-hover:text-yellow-400 transition-colors mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">Deep Analysis</h3>
                <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  Advanced models analyze communication patterns, tone, and sentiment to detect risks and anomalies in
                  real-time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 border-l border-neutral-800 hover:border-yellow-500 transition-all duration-500 bg-gradient-to-b from-transparent to-transparent hover:to-yellow-900/10">
                <Users className="w-10 h-10 text-yellow-600 group-hover:text-yellow-400 transition-colors mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">Risk Visualization</h3>
                <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  Interactive heatmaps instantly identify high-risk communication channels and contexts across your
                  organization.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 border-l border-neutral-800 hover:border-yellow-500 transition-all duration-500 bg-gradient-to-b from-transparent to-transparent hover:to-yellow-900/10">
                <Sparkles className="w-10 h-10 text-yellow-600 group-hover:text-yellow-400 transition-colors mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">Seamless Integration</h3>
                <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                  Deploy our security pipelines into existing applications for continuous real-time linguistic safety
                  and compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5 bg-gradient-to-b from-neutral-900 to-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <span className="text-neutral-500 font-bold tracking-widest text-sm">BHASHASURAKSHA</span>
            </div>
            <p className="text-sm text-neutral-400">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
