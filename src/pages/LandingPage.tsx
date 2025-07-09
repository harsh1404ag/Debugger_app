import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BGPattern } from '../components/ui/bg-pattern';
import { 
  Code, 
  Shield, 
  Zap, 
  CheckCircle, 
  Star, 
  ChevronDown,
  ArrowRight,
  Github,
  Twitter,
  Mail,
  Clock,
  Users,
  Target,
  FileText,
  Lock,
  Sparkles,
  Play,
  Layers,
  Cpu,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Time",
      description: "Get instant feedback instead of waiting for manual reviews"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Boost Quality",
      description: "Catch bugs and issues before they reach production"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Learn & Grow",
      description: "Improve your coding skills with expert-level insights"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Write Secure Code",
      description: "Identify security vulnerabilities and best practices"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Support Your Stack",
      description: "Works with JavaScript, Python, Java, C#, and more"
    }
  ];

  const faqs = [
    {
      question: "What programming languages do you support?",
      answer: "We support all major programming languages including JavaScript, TypeScript, Python, Java, C#, Go, Rust, PHP, and more. Our AI is trained on a diverse codebase."
    },
    {
      question: "How accurate are the code reviews?",
      answer: "Our AI provides expert-level insights with 95% accuracy for common issues. It's trained on millions of code reviews and best practices from top developers."
    },
    {
      question: "Is my code private and secure?",
      answer: "Absolutely. Your code is encrypted in transit and at rest. We never store your code permanently and process it in secure, isolated environments."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for Pro subscriptions. If you're not satisfied, contact us for a full refund."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Enhanced Background with BGPattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary grid pattern */}
        <BGPattern 
          variant="grid" 
          mask="fade-edges" 
          size={40} 
          fill="rgba(139, 92, 246, 0.08)" 
          className="opacity-60"
        />
        
        {/* Secondary dots pattern */}
        <BGPattern 
          variant="dots" 
          mask="fade-center" 
          size={60} 
          fill="rgba(99, 102, 241, 0.06)" 
          className="opacity-40"
        />
        
        {/* Diagonal stripes for texture */}
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-y" 
          size={80} 
          fill="rgba(168, 85, 247, 0.03)" 
          className="opacity-30"
        />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/15 rounded-full filter blur-[96px] animate-pulse delay-1000" />
        
        {/* Geometric elements */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-violet-500/20 rounded-lg rotate-45 animate-pulse delay-500" />
        <div className="absolute bottom-40 left-20 w-24 h-24 border border-indigo-500/20 rounded-full animate-pulse delay-1500" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-lg rotate-12 animate-pulse delay-2000" />
        
        {/* Additional floating elements */}
        <motion.div 
          className="absolute top-1/4 left-1/6 w-8 h-8 bg-violet-400/30 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/6 w-6 h-6 bg-indigo-400/30 rounded-full"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.2, 0.7, 0.2]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              CodeReview AI
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4"
          >
            <a
              href="#pricing" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="/app"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 font-medium"
            >
              Launch App
            </a>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-8">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-gray-300">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                Instant Code
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Reviews
              </span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Get expert-level feedback on your code in seconds. Leverage AI-powered insights 
            and best practices from millions of code reviews to write better code, faster.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <a
              href="/app"
              className="group relative px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-white/25 transition-all duration-200 flex items-center gap-3"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Play className="w-5 h-5 text-black" />
              <span className="text-black">Start Your Free Review</span>
              <motion.div
                animate={{ x: isHovering ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="w-5 h-5 text-black" />
              </motion.div>
            </a>
            
            <div className="flex items-center gap-3 text-gray-400">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full border-2 border-black" />
                ))}
              </div>
              <span className="text-sm">Join 10,000+ developers</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { icon: <Users className="w-6 h-6" />, value: "10K+", label: "Developers" },
              { icon: <FileText className="w-6 h-6" />, value: "100K+", label: "Reviews" },
              { icon: <Globe className="w-6 h-6" />, value: "50+", label: "Languages" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl border border-white/10 mb-3 text-violet-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-gray-400 text-xl">Three simple steps to better code</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Paste Your Code",
                description: "Copy your code into our intelligent editor with syntax highlighting and smart detection",
                icon: <FileText className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "Get Instant Feedback",
                description: "Our AI analyzes your code for bugs, performance issues, security vulnerabilities, and best practices",
                icon: <Cpu className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Improve & Learn",
                description: "Apply suggestions and level up your coding skills with detailed explanations and examples",
                icon: <Sparkles className="w-8 h-8" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <div className="absolute -top-4 left-8 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold">
                  {item.step}
                </div>
                <div className="text-violet-400 mb-6 mt-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 px-6 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose CodeReview AI?
            </h2>
            <p className="text-gray-400 text-xl">Powerful features that make you a better developer</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-xl">Start free, upgrade when you need more</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4 text-white">Free</h3>
                <div className="text-5xl font-bold mb-4 text-white">$0<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400">Perfect for getting started</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "10 messages per day",
                  "Max 250 lines per message", 
                  "Basic review focus",
                  "Standard AI model",
                  "Community support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="/app"
                className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 rounded-xl text-center font-semibold transition-all duration-200 block text-white border border-white/20"
              >
                Get Started Free
              </a>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-2xl border border-violet-500/30 backdrop-blur-sm relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-semibold">
                Most Popular
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4 text-white">Pro</h3>
                <div className="text-5xl font-bold mb-4 text-white">$15<span className="text-lg text-gray-400">/month</span></div>
                <p className="text-gray-400">For serious developers</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  "50 messages per day",
                  "Up to 1000 lines per message",
                  "Advanced review focus",
                  "Advanced AI model",
                  "Security & Performance analysis",
                  "Review history saved",
                  "Priority support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 rounded-xl text-center font-semibold transition-all duration-200 text-white shadow-lg shadow-violet-500/25">
                Choose Pro Plan
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-6 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-xl">Everything you need to know</p>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">CodeReview AI</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making code reviews instant and intelligent for developers worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-white">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }} className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 CodeReview AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
