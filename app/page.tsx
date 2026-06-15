import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  FiChevronRight,
  FiCpu,
  FiActivity,
  FiShare2,
  FiPieChart,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-brand-cream font-sans selection:bg-brand-secondary selection:text-white pb-24">
      {/* Background Soft Blobs */}
      <div className="absolute top-[-10%] left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[120px]" />
      <div className="absolute top-[20%] right-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-brand-accent/10 blur-[120px]" />
      <div className="absolute bottom-[10%] left-[-10%] -z-10 h-[400px] w-[400px] rounded-full bg-brand-secondary/10 blur-[100px]" />

      {/* Navbar Atas */}
      <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 font-heading font-bold text-2xl text-brand-primary tracking-tight">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <FiCpu className="text-white" size={22} />
          </div>
          ThinkTrack
        </div>
        <div>
          {session ? (
            <Link
              href="/home"
              className="text-sm font-semibold text-brand-primary hover:text-brand-secondary transition-colors"
            >
              Go to Workspace
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold bg-white px-6 py-2.5 rounded-full shadow-sm text-brand-primary border border-gray-100 hover:shadow-md hover:border-brand-primary/30 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <main className="z-10 flex w-full flex-col items-center px-4 pt-12 md:pt-20 text-center flex-1">
        {/* Hero Section */}
        <div className="max-w-4xl space-y-6 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/10 bg-white/60 backdrop-blur-md px-5 py-2 text-sm font-semibold text-brand-primary shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent"></span>
            </span>
            AI-Powered Learning Analytics
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight font-heading text-[#1F173A] sm:text-6xl md:text-[5.5rem] leading-[1.1]">
            Track Learning.
            <br />
            Discover{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              Understanding.
            </span>
            <br />
            Unlock Potential.
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600 mt-6">
            Empower students and educators with intelligent tracking that
            pinpoints learning gaps, adapts to individual cognitive levels, and
            accelerates true mastery.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row px-4">
          <Link
            href={session ? "/home" : "/register"}
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-[20px] bg-brand-accent px-8 py-4 text-base font-semibold text-white transition-all hover:bg-[#fa6533] hover:scale-105 hover:shadow-[0_15px_30px_rgba(255,120,73,0.3)]"
          >
            Start Tracking
            <FiChevronRight
              className="transition-transform group-hover:translate-x-1"
              size={20}
            />
          </Link>
          <Link
            href="#features"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-[20px] border-2 border-brand-primary text-brand-primary bg-transparent px-8 py-4 text-base font-semibold transition-all hover:bg-brand-primary/5"
          >
            Learn More
          </Link>
        </div>

        {/* Dashboard Preview Mockup (Premium SaaS Style) */}
        <div className="mt-20 w-full max-w-6xl px-4">
          <div className="relative rounded-[40px] bg-white/40 backdrop-blur-3xl border border-white p-4 shadow-[0_20px_80px_-15px_rgba(109,40,217,0.15)] ring-1 ring-black/5">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-[500px]">
              {/* Header Mockup */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-200"></div>
                    <div className="h-3 w-3 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="text-sm font-semibold text-gray-400">
                    Dashboard Overview
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                  A
                </div>
              </div>

              {/* Grid Content Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-6 flex-1 bg-gray-50/50">
                {/* Left: Progress Card */}
                <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-gray-800">
                      Concept Mastery
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Algebra Fundamentals
                    </p>
                  </div>
                  <div className="flex justify-center py-6">
                    <div className="relative w-32 h-32 rounded-full border-8 border-gray-50 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-brand-secondary"
                          strokeDasharray="351"
                          strokeDashoffset="87"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="text-2xl font-bold font-heading text-brand-primary">
                        75%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle: AI Insights */}
                <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-[24px] p-6 shadow-lg text-white flex flex-col relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <FiCpu size={20} className="text-brand-cream" />
                    <h3 className="font-heading font-semibold">AI Insight</h3>
                  </div>
                  <p className="text-sm text-brand-cream leading-relaxed relative z-10">
                    We noticed a slight misconception in handling negative
                    exponents. Let&apos;s review the fundamentals before moving
                    on to complex algebraic fractions.
                  </p>
                  <div className="mt-auto pt-4 relative z-10">
                    <button className="bg-white text-brand-primary px-4 py-2 rounded-xl text-xs font-bold w-full shadow-sm hover:bg-brand-cream transition-colors">
                      Review Prerequisite Concept
                    </button>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                      <FiActivity size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium">
                        Learning Gap
                      </h4>
                      <div className="text-lg font-bold text-gray-800">
                        Detected
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <FiTrendingUp size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs text-gray-500 font-medium">
                        Weekly Growth
                      </h4>
                      <div className="text-lg font-bold text-gray-800">
                        +14.2%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="w-full max-w-6xl px-4 mt-32 text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-[#1F173A]">
              Intelligent Features for Modern Education
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              Built specifically to elevate the learning experience with
              cutting-edge data and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-accent/10 text-brand-accent rounded-[16px] flex items-center justify-center text-2xl mb-6">
                <FiActivity />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#1F173A] mb-3">
                Learning Gap Detection
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Automatically identifies where understanding breaks down,
                pinpointing the exact prerequisite skills missing before they
                become major roadblocks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-[16px] flex items-center justify-center text-2xl mb-6">
                <FiShare2 />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#1F173A] mb-3">
                Concept Knowledge Graph
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Visualize learning pathways through interconnected nodes,
                showing how mastering one topic directly influences success in
                advanced materials.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-brand-secondary/10 text-brand-secondary rounded-[16px] flex items-center justify-center text-2xl mb-6">
                <FiPieChart />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#1F173A] mb-3">
                Progress Analytics
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Go beyond simple grades with comprehensive cognitive metrics
                that evaluate retention, problem-solving speed, and conceptual
                mastery.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-1">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-[16px] flex items-center justify-center text-2xl mb-6">
                <FiStar />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#1F173A] mb-3">
                Personalized Recommendations
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Tailored content delivery that matches each student&apos;s
                unique pace and cognitive profile.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-[16px] flex items-center justify-center text-2xl mb-6">
                <FiTrendingUp />
              </div>
              <h3 className="text-xl font-bold font-heading text-[#1F173A] mb-3">
                Performance Tracking
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                A seamless dashboard that provides educators and students with
                actionable performance data, shifting the focus from final
                scores to the actual learning journey. Let AI handle the
                tracking while you focus on teaching.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
