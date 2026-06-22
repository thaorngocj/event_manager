/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function Footer() {
  return (
    <footer className="h-10 border-t border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
        &copy; {new Date().getFullYear()} RedEvent System • v1.4.0 • Academic Affairs
      </div>
      <div className="flex gap-6">
        <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors">Privacy</a>
        <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors">Terms</a>
        <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors">Support</a>
      </div>
    </footer>
  );
}


