import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, UserSquare, UserPlus, FileSignature, CheckCircle, Video, CopyX, Clock, Cpu, Users, ArrowRight, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      <Navbar />

      {/* --- FLOATING QUICK LOGIN MENU --- */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 bg-white/90 backdrop-blur-md shadow-[-4px_0_20px_rgba(0,0,0,0.08)] border-l border-y border-gray-100 p-2 rounded-l-2xl animate-fade-in">
        <button onClick={() => navigate('/login/student')} className="group relative p-3 rounded-xl hover:bg-tomato-50 text-gray-500 hover:text-tomato-500 smooth-transition">
          <UserSquare size={24} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-dark-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 smooth-transition whitespace-nowrap shadow-lg">
            Student Portal
          </span>
        </button>
        <button onClick={() => navigate('/login/teacher')} className="group relative p-3 rounded-xl hover:bg-tomato-50 text-gray-500 hover:text-tomato-500 smooth-transition">
          <GraduationCap size={24} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-dark-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 smooth-transition whitespace-nowrap shadow-lg">
            Teacher Console
          </span>
        </button>
        <button onClick={() => navigate('/login/admin')} className="group relative p-3 rounded-xl hover:bg-tomato-50 text-gray-500 hover:text-tomato-500 smooth-transition">
          <Shield size={24} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-dark-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 smooth-transition whitespace-nowrap shadow-lg">
            Admin Panel
          </span>
        </button>
      </div>

      {/* --- SECTION 1: HERO --- */}
      <section id="home" className="relative pt-24 pb-32 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tomato-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-tomato-600 font-semibold text-xs mb-6 border border-tomato-200 shadow-sm animate-fade-in">
          <Shield size={14} />
          <span>Real-time AI-Proctored Exam Platform</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-dark-900 tracking-tight leading-tight mb-6 animate-scale-up">
          Conduct Secure, Honest, and <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-tomato-500 to-tomato-600">Smart Online Exams</span>
        </h1>
        
        <p className="text-gray-500 max-w-2xl text-lg mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
          A premium exam-taking application integrated with advanced proctoring logs. Monitors copy-paste actions, webcam feeds, and demerit blocks to maintain academic integrity at scale.
        </p>

        <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <a href="#portals" className="tomato-btn py-3.5 px-8 text-base">
            Get Started <ArrowRight size={18} />
          </a>
          <a href="#how-it-works" className="tomato-btn-outline py-3.5 px-8 text-base">
            See How It Works
          </a>
        </div>
      </section>

      {/* --- SECTION 2: FEATURES --- */}
      <section id="features" className="py-24 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark-900 mb-4">Powerful Proctoring Features</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Our AI-driven system automatically detects and prevents cheating, ensuring a fair testing environment for everyone.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md smooth-transition">
              <div className="w-14 h-14 bg-tomato-50 text-tomato-500 rounded-2xl flex items-center justify-center mb-6">
                <Video size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Webcam Logs</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Continuous capturing of webcam feeds to ensure the correct student is present and looking at the screen.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md smooth-transition">
              <div className="w-14 h-14 bg-tomato-50 text-tomato-500 rounded-2xl flex items-center justify-center mb-6">
                <CopyX size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Copy-Paste Blocking</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Strict clipboard monitoring restricts copy, paste, and tab-switching, flagging violations in real-time.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md smooth-transition">
              <div className="w-14 h-14 bg-tomato-50 text-tomato-500 rounded-2xl flex items-center justify-center mb-6">
                <Cpu size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Demerits</h3>
              <p className="text-gray-500 text-sm leading-relaxed">AI automatically assigns demerits for suspicious actions. Too many demerits trigger automatic exam blockage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark-900 mb-4">How SafeExam.AI Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A seamless workflow designed for educational institutions to conduct exams without friction.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-100 -z-10"></div>

            <div className="text-center relative">
              <div className="w-24 h-24 bg-white border-4 border-tomato-50 rounded-full flex items-center justify-center text-3xl font-bold text-tomato-500 mx-auto mb-6 shadow-sm">1</div>
              <h3 className="text-xl font-bold mb-3">Admin Setup</h3>
              <p className="text-gray-500 text-sm">System Admin creates courses and approves teacher accounts for access.</p>
            </div>
            <div className="text-center relative">
              <div className="w-24 h-24 bg-white border-4 border-tomato-50 rounded-full flex items-center justify-center text-3xl font-bold text-tomato-500 mx-auto mb-6 shadow-sm">2</div>
              <h3 className="text-xl font-bold mb-3">Exam Creation</h3>
              <p className="text-gray-500 text-sm">Teachers formulate question banks, schedule exams, and assign students.</p>
            </div>
            <div className="text-center relative">
              <div className="w-24 h-24 bg-tomato-500 border-4 border-tomato-100 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-md">3</div>
              <h3 className="text-xl font-bold mb-3">Secure Execution</h3>
              <p className="text-gray-500 text-sm">Students take the exam under strict AI proctoring, with automated real-time grading.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: ABOUT US --- */}
      <section id="about" className="py-24 bg-dark-900 text-white px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tomato-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Redefining Academic Integrity</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              SafeExam.AI was born out of the necessity to maintain fairness in remote education. We believe that distance learning shouldn't compromise the quality and credibility of assessments.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              By leveraging cutting-edge Artificial Intelligence, we provide institutions with a zero-friction, highly secure platform that completely removes the possibility of malpractice.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={20} className="text-tomato-500"/> Trusted by top universities</li>
              <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={20} className="text-tomato-500"/> 99.9% Uptime Guarantee</li>
              <li className="flex items-center gap-3 text-gray-300"><CheckCircle size={20} className="text-tomato-500"/> Privacy-First Data Processing</li>
            </ul>
          </div>
          <div className="flex-1 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
             <div className="grid grid-cols-2 gap-6">
               <div className="text-center p-6 bg-white/5 rounded-2xl">
                 <div className="text-4xl font-bold text-tomato-500 mb-2">50k+</div>
                 <div className="text-sm text-gray-400">Exams Proctored</div>
               </div>
               <div className="text-center p-6 bg-white/5 rounded-2xl">
                 <div className="text-4xl font-bold text-tomato-500 mb-2">99%</div>
                 <div className="text-sm text-gray-400">Cheat Prevention</div>
               </div>
               <div className="text-center p-6 bg-white/5 rounded-2xl">
                 <div className="text-4xl font-bold text-tomato-500 mb-2">200+</div>
                 <div className="text-sm text-gray-400">Institutions</div>
               </div>
               <div className="text-center p-6 bg-white/5 rounded-2xl">
                 <div className="text-4xl font-bold text-tomato-500 mb-2">24/7</div>
                 <div className="text-sm text-gray-400">Support</div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: PORTALS --- */}
      <section id="portals" className="py-24 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark-900 mb-4">Access Your Portal</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Select your designated portal to log in or request a new account registration.</p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Student Login Card */}
            <div 
              onClick={() => navigate('/login/student')}
              className="group card-hover p-8 cursor-pointer flex flex-col items-center text-center hover:border-tomato-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-tomato-50 text-tomato-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-tomato-500 group-hover:text-white smooth-transition">
                <UserSquare size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Student Portal</h3>
              <p className="text-sm text-gray-500 mb-6 flex-grow">Login with your Student ID and attend scheduled exams securely.</p>
              <button className="text-sm font-semibold text-tomato-600 group-hover:text-tomato-700 inline-flex items-center gap-1">
                Enter Student ID &rarr;
              </button>
            </div>

            {/* Teacher Login Card */}
            <div 
              onClick={() => navigate('/login/teacher')}
              className="group card-hover p-8 cursor-pointer flex flex-col items-center text-center hover:border-tomato-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-tomato-50 text-tomato-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-tomato-500 group-hover:text-white smooth-transition">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Teacher Console</h3>
              <p className="text-sm text-gray-500 mb-6 flex-grow">Manage courses, set exam questions, and view live logs.</p>
              <button className="text-sm font-semibold text-tomato-600 group-hover:text-tomato-700 inline-flex items-center gap-1">
                Teacher Login &rarr;
              </button>
            </div>

            {/* Admin Login Card */}
            <div 
              onClick={() => navigate('/login/admin')}
              className="group card-hover p-8 cursor-pointer flex flex-col items-center text-center hover:border-tomato-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-tomato-50 text-tomato-500 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-tomato-500 group-hover:text-white smooth-transition">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-3">Admin Panel</h3>
              <p className="text-sm text-gray-500 mb-6 flex-grow">Control credentials, approve teachers, and assign courses.</p>
              <button className="text-sm font-semibold text-tomato-600 group-hover:text-tomato-700 inline-flex items-center gap-1">
                System Admin &rarr;
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto mt-8">
            <button 
              onClick={() => navigate('/register/student')}
              className="tomato-btn sm:flex-1 py-3"
            >
              <UserPlus size={18} />
              <span>Register as Student</span>
            </button>
            <button 
              onClick={() => navigate('/register/teacher')}
              className="tomato-btn-outline sm:flex-1 py-3 bg-white"
            >
              <FileSignature size={18} />
              <span>Register as Teacher</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- SECTION 6: FOOTER --- */}
      <footer className="bg-dark-900 text-gray-400 py-12 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-tomato-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                S
              </span>
              <span className="font-bold text-xl tracking-tight text-white">
                SafeExam<span className="text-tomato-500">.AI</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm">
              Empowering education through AI. Conduct secure, fair, and seamless online examinations from anywhere in the world.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="hover:text-tomato-500 smooth-transition">Home</a></li>
              <li><a href="#features" className="hover:text-tomato-500 smooth-transition">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-tomato-500 smooth-transition">How It Works</a></li>
              <li><a href="#about" className="hover:text-tomato-500 smooth-transition">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail size={16} className="text-tomato-500"/> support@safeexam.ai</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-tomato-500"/> +1 (800) 123-4567</li>
              <li className="flex items-center gap-2"><MapPin size={16} className="text-tomato-500"/> 123 AI Boulevard, Tech City</li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto pt-8 border-t border-white/10 text-center text-xs">
          &copy; {new Date().getFullYear()} SafeExam.AI. All rights reserved. Powered by YOLOv8 Proctoring System.
        </div>
      </footer>
    </div>
  );
}
