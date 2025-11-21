"use client"

import { useState } from "react"
import {
  Shield,
  Mic,
  Activity,
  Network,
  FileText,
  Database,
  Map as MapIcon,
  ChevronDown,
  Cpu
} from "lucide-react"
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence
} from "framer-motion";

import Link from "next/link";
const COLORS = {
  yellow: "#FACC15",
  yellowDim: "#CA8A04", 
  bg: "#050505",
  text: "#E5E5E5",
  textDim: "#737373"
}

const STEPS = [
  { icon: Mic, title: "Record", desc: "User speaks 5-10 seconds in any language." },
  { icon: Activity, title: "Detect", desc: "AI identifies language or marks as 'unknown dialect'." },
  { icon: Network, title: "Cluster", desc: "Similar unknown dialects grouped automatically." },
  { icon: FileText, title: "Transcribe", desc: "Convert speech to text + extract cultural keywords." },
  { icon: Database, title: "Archive", desc: "Store audio + metadata in digital repository." },
  { icon: MapIcon, title: "Visualize", desc: "Interactive map shows linguistic diversity across India." },
]

const FAQS = [
  { q: "What is the core mission?", a: "To create a permanent digital archive of India's 196 endangered languages using voice-first technology." },
  { q: "How does the AI work?", a: "It uses unsupervised clustering to group similar speech patterns without needing pre-labeled training data." },
  { q: "Is the data public?", a: "The visualized map is public, but raw audio data is anonymized and securely archived." },
]


const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

const TextReveal = ({ text, className }) => {
  const words = text.split(" ")
  return (
    <div className={`overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}

const BackgroundGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(${COLORS.textDim} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.textDim} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.1
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
  </div>
)

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-yellow-500 origin-left z-50"
      style={{ scaleX }}
    />
  )
}

const StepCard = ({ step, index }) => {
  const Icon = step.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative flex flex-col p-8 border border-neutral-800 hover:border-yellow-500/50 bg-neutral-900/50 backdrop-blur-sm transition-colors duration-500"
    >
      <div className="absolute top-4 right-4 text-neutral-800 font-mono text-4xl font-bold group-hover:text-yellow-500/10 transition-colors">
        0{index + 1}
      </div>
      <div className="mb-6 p-3 w-fit rounded bg-neutral-800 group-hover:bg-yellow-500 transition-colors duration-300">
        <Icon className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-bold text-neutral-200 mb-3 group-hover:text-yellow-400 transition-colors">{step.title}</h3>
      <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
    </motion.div>
  )
}


export default function BhashaSuraksha() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 overflow-x-hidden">
      <ScrollProgress />
      <BackgroundGrid />

      <header className="fixed top-0 w-full z-40 px-6 py-6 mix-blend-difference">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-yellow-500" />
            <span className="font-bold tracking-widest text-sm uppercase text-white">BhashaSuraksha</span>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-8 space-y-8">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-12 bg-yellow-500 inline-block"></span>
                <span className="text-yellow-500 font-mono text-sm tracking-widest uppercase">Project Bharat</span>
              </div>
            </Reveal>

            <div className="space-y-2">
              <TextReveal
                text="Preserving India's"
                className="text-5xl md:text-7xl font-bold text-white tracking-tight"
              />
              <TextReveal
                text="196 Endangered Languages"
                className="text-5xl md:text-7xl font-bold text-yellow-400 tracking-tight"
              />
            </div>

            <Reveal delay={0.4}>
              <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed">
                An AI-powered platform leveraging crowdsourced voice recordings to create a permanent digital archive of our linguistic heritage.
              </p>
            </Reveal>

            <Reveal delay={0.6}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-yellow-500 px-8 py-4 mt-4"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <div className="relative flex items-center gap-3 text-black font-bold tracking-wide uppercase text-sm">
                  <Mic className="w-4 h-4" />
                  <Link href="/home"><span>Record Voice Sample</span></Link>
                  
                </div>
              </motion.button>
            </Reveal>
          </div>

          <div className="lg:col-span-4 relative hidden lg:block">
            <motion.div style={{ y: y2 }} className="absolute right-0 top-0 w-64 h-96 border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm z-0" />
            <motion.div style={{ y: y1 }} className="relative z-10 border border-yellow-500/30 p-8 bg-black">
              <div className="space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 opacity-50">
                    <div className="w-full h-1 bg-neutral-800 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: ["0%", "60%", "40%", "80%"] }}
                        transition={{ duration: 4, repeat: Infinity, delay: i * 1 }}
                        className="h-full bg-yellow-500"
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-neutral-800">
                  <p className="font-mono text-xs text-yellow-500">STATUS: LISTENING</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-500"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      <section className="py-32 px-6 relative border-t border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 flex items-center gap-4">
              <span className="w-8 h-8 border border-yellow-500 flex items-center justify-center text-yellow-500 text-sm font-mono">01</span>
              System Architecture
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
            {STEPS.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-500 via-transparent to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-mono uppercase tracking-widest mb-4">
                  <Cpu className="w-3 h-3" />
                  Key Innovation
                </div>
                <h3 className="text-4xl font-bold text-white">Unsupervised Dialect Discovery</h3>
                <p className="text-lg text-neutral-400 leading-relaxed">
                  Traditional models require labeled data. Our system uses advanced clustering algorithms to identify and group distinct linguistic patterns automatically. This allows us to discover and map dialects that have never been formally documented.
                </p>
              </Reveal>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square border border-neutral-700 relative flex items-center justify-center bg-black">
                <div className="relative w-64 h-64">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute border border-yellow-500/20 rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        x: '-50%',
                        y: '-50%',
                        width: `${(i + 1) * 40}px`,
                        height: `${(i + 1) * 40}px`
                      }}
                      animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                      transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-yellow-500 rounded-full absolute -top-1 left-1/2"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 border-t border-neutral-900">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-16 flex items-center gap-4">
              <span className="w-8 h-8 border border-yellow-500 flex items-center justify-center text-yellow-500 text-sm font-mono">02</span>
              Inquiries
            </h2>
          </Reveal>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 bg-black border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-neutral-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
          <p>&copy; {new Date().getFullYear()} BhashaSuraksha Initiative</p>
        </div>
      </footer>
    </div>
  )
}

const FAQItem = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={false}
      className="border-b border-neutral-800"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-6 text-left group"
      >
        <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-yellow-400' : 'text-neutral-300 group-hover:text-white'}`}>
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          className={`text-neutral-500 group-hover:text-yellow-500 transition-colors`}
        >
          <span className="text-2xl">+</span>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-neutral-400 leading-relaxed pr-8">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}