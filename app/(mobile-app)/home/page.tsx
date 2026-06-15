import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FiActivity,
  FiZap,
  FiTrendingUp,
  FiCpu,
  FiAlertCircle,
  FiTarget,
  FiCheckCircle,
  FiArrowRight,
  FiBookOpen,
} from "react-icons/fi";
import CreateTopicButton from "@/components/topic/CreateTopicButton";

export default async function WorkspaceHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const topics = await prisma.topic.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" }, // Diubah menjadi asc untuk alur roadmap
    include: { subtopics: true },
  });

  const firstName = session.user.name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] text-gray-900 font-sans p-6 md:p-10 pb-32">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* HEADER / HERO SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-[#6D28D9] mb-4 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6D28D9] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6D28D9]"></span>
              </span>
              Cognitive Engine Active
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-gray-900">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6]">{firstName}</span>.
            </h1>
            <p className="text-gray-500 mt-2 text-base max-w-xl">
              AI has analyzed your recent exercises. Here is your personalized cognitive performance dashboard.
            </p>
          </div>
          <div className="shrink-0">
            <CreateTopicButton />
          </div>
        </div>

        {/* TOP METRICS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Learning Score (Col 1) */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-3 text-gray-500 font-medium text-sm mb-4">
              <div className="p-2 bg-[#6D28D9]/10 text-[#6D28D9] rounded-xl"><FiTarget size={18} /></div>
              Cognitive Score
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-extrabold font-heading text-gray-900">85</span>
              <span className="text-gray-400 font-bold mb-1">/100</span>
            </div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-[#6D28D9] h-2 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>

          {/* Weekly Progress (Col 2) */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-3 text-gray-500 font-medium text-sm mb-4">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl"><FiTrendingUp size={18} /></div>
              Weekly Progress
            </div>
            <div>
              <div className="text-4xl font-extrabold font-heading text-gray-900">+12%</div>
              <p className="text-emerald-500 text-sm font-semibold mt-1">Faster problem solving</p>
            </div>
          </div>

          {/* Learning Streak (Col 3) */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-3 text-gray-500 font-medium text-sm mb-4">
              <div className="p-2 bg-[#FF7849]/10 text-[#FF7849] rounded-xl"><FiZap size={18} /></div>
              Active Streak
            </div>
            <div>
              <div className="text-4xl font-extrabold font-heading text-gray-900">5 <span className="text-xl text-gray-400">Days</span></div>
              <p className="text-[#FF7849] text-sm font-semibold mt-1">Keep the momentum!</p>
            </div>
          </div>

          {/* Access Pocket Book (Col 4) */}
          <Link href="/catatan" className="group bg-gradient-to-br from-[#6D28D9] to-[#4c1d95] rounded-[24px] p-6 shadow-[0_10px_30px_rgba(109,40,217,0.2)] flex flex-col justify-between hover:scale-[1.02] transition-transform relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[30px] rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-3 text-violet-200 font-medium text-sm mb-4 relative z-10">
              <div className="p-2 bg-white/20 text-white rounded-xl"><FiBookOpen size={18} /></div>
              Personalized Notes
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold font-heading text-white">AI Pocket Book</h3>
              <div className="mt-2 text-violet-200 text-sm flex items-center gap-1 group-hover:text-white transition-colors">
                View your resolved gaps <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* MIDDLE SECTION: AI Insights & Knowledge Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dedicated AI Insight Panel */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[24px] p-8 border border-[#FF7849]/20 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#FF7849]/5 blur-[60px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold font-heading text-gray-900 flex items-center gap-3">
                <FiCpu className="text-[#FF7849]" /> Cognitive Insights
              </h2>
              <span className="bg-[#FF7849]/10 text-[#FF7849] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">New Detection</span>
            </div>

            <div className="bg-[#FFF8E7] border border-[#FF7849]/30 rounded-[20px] p-6 flex flex-col md:flex-row gap-6">
              <div className="w-12 h-12 bg-[#FF7849]/20 rounded-2xl flex items-center justify-center shrink-0">
                <FiAlertCircle className="text-[#FF7849]" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-heading">Learning Gap Detected: Variable Isolation</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  In your last 3 exercises, you consistently made errors when moving negative variables across the equation. This indicates a minor disconnect in prerequisite understanding.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-white border border-[#FF7849] text-[#FF7849] hover:bg-[#FF7849] hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
                    Review Prerequisite
                  </button>
                  <button className="bg-transparent text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                    View Problem Trace
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Concept Mastery Radar / Analytics Mockup */}
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col">
            <h2 className="text-xl font-extrabold font-heading text-gray-900 mb-6 flex items-center gap-2">
              <FiActivity className="text-[#6D28D9]" /> Mastery Profile
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-semibold text-gray-700">
                  <span>Algebraic Equations</span>
                  <span className="text-[#6D28D9]">82%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#6D28D9] h-2 rounded-full shadow-[0_0_10px_#6D28D940]" style={{ width: "82%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1.5 font-semibold text-gray-700">
                  <span>Linear Functions</span>
                  <span className="text-[#FF7849]">45%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#FF7849] h-2 rounded-full shadow-[0_0_10px_#FF784940]" style={{ width: "45%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5 font-semibold text-gray-700">
                  <span>Basic Arithmetic</span>
                  <span className="text-emerald-500">98%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "98%" }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* INTERACTIVE LEARNING ROADMAP */}
        <section className="pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold font-heading text-gray-900">Learning Roadmap</h2>
            <div className="text-sm font-semibold text-gray-500">
              {topics.length} Modules Active
            </div>
          </div>

          {topics.length === 0 ? (
            <div className="text-center p-20 bg-white border border-dashed border-gray-200 rounded-[32px] shadow-sm">
              <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-[24px] flex items-center justify-center mx-auto mb-6">
                <FiTarget size={32} />
              </div>
              <h3 className="text-2xl font-bold font-heading text-gray-900 mb-3">Your path is waiting</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 leading-relaxed">
                Start by generating your first learning topic. The AI will instantly build a custom progression graph tailored to your knowledge level.
              </p>
              <CreateTopicButton />
            </div>
          ) : (
            <div className="relative">
              {/* Timeline background line */}
              <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-1/2 w-1 bg-gray-100 -translate-x-1/2 rounded-full hidden md:block"></div>
              
              <div className="space-y-6 md:space-y-12 relative z-10">
                {topics.map((topic, index) => {
                  const isEven = index % 2 === 0;
                  // Dummy progress simulation
                  const progress = topic.isCompleted ? 100 : Math.floor(Math.random() * 50) + 10;
                  
                  return (
                    <div key={topic.id} className={`flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                      
                      {/* Card Content */}
                      <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                        <Link
                          href={`/learn/${topic.id}`}
                          className="block w-full max-w-lg bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(109,40,217,0.1)] hover:border-[#6D28D9]/30 transition-all duration-300 group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-extrabold font-heading text-gray-900 group-hover:text-[#6D28D9] transition-colors leading-tight">
                              {topic.title}
                            </h3>
                            <div className={`shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${topic.isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-[#6D28D9]/10 text-[#6D28D9]'}`}>
                              {topic.isCompleted ? "Mastered" : "In Progress"}
                            </div>
                          </div>
                          
                          <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                            {topic.description || "AI-generated curriculum mapped to your optimal learning trajectory."}
                          </p>

                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-1000 ${topic.isCompleted ? 'bg-emerald-500' : 'bg-[#6D28D9]'}`} style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{progress}%</span>
                          </div>
                        </Link>
                      </div>

                      {/* Timeline Node */}
                      <div className="absolute left-8 md:relative md:left-auto md:w-16 flex justify-center hidden md:flex">
                        <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shadow-md z-10 transition-colors duration-300 ${topic.isCompleted ? 'bg-emerald-500 text-white' : 'bg-[#6D28D9] text-white'}`}>
                          {topic.isCompleted ? <FiCheckCircle size={20} /> : <span className="font-bold font-heading">{index + 1}</span>}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}