import { Algorithm } from "@/data/algorithms";

export default function AlgorithmCard({ alg }: { alg: Algorithm }) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex items-center gap-8 cursor-pointer">
      <div className="w-28 h-28 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
        <img 
          src={alg.imageUrl} 
          alt={alg.name} 
          className="w-full h-full object-contain p-2 mix-blend-multiply"
        />
      </div>

      <div className="flex-grow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">
            {alg.name}
          </h3>
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-slate-200">
            {alg.category}
          </span>
        </div>
        
        <div className="relative">
          <div className="bg-slate-900 p-4 rounded-xl shadow-inner">
            <code className="text-indigo-300 font-mono text-sm sm:text-base tracking-widest">
              {alg.notation}
            </code>
          </div>
          {/* "Click to Copy" or "Visualize" hint */}
          <span className="absolute -bottom-6 right-2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase">
            Click to visualize →
          </span>
        </div>
      </div>
    </div>
  );
}