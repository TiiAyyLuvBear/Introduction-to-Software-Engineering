import React from 'react'

export default function About() {
  return (
    <div className="px-4 py-6 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-border-dark bg-card-dark p-8 md:p-12 overflow-hidden relative">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="text-sm font-bold uppercase tracking-wider text-primary">About Money Lover</div>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">Build better money habits.</h1>
            <p className="mt-4 max-w-2xl text-text-secondary">
              This is a frontend-only demo based on the provided screen templates. It showcases budgeting, goals,
              categories, wallets, and reports.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Users', value: '5M+', icon: 'group' },
            { label: 'Tracked', value: '$10B+', icon: 'stacked_line_chart' },
            { label: 'Countries', value: '120+', icon: 'public' },
            { label: 'Rating', value: '4.8/5', icon: 'star' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-text-secondary">{s.label}</div>
                <span className="material-symbols-outlined text-primary">{s.icon}</span>
              </div>
              <div className="mt-3 text-3xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-sm text-text-secondary">Demo metric</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[
            { title: 'Security first', text: 'Local demo storage; template-inspired UI.', icon: 'security' },
            { title: 'Simple workflows', text: 'Quickly add wallets, categories, budgets, and goals.', icon: 'task_alt' },
            { title: 'Actionable insights', text: 'Reports summarize spending by category and wallet.', icon: 'insights' },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-border-dark bg-card-dark p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-primary">
                  <span className="material-symbols-outlined">{v.icon}</span>
                </div>
                <div className="text-lg font-bold text-white">{v.title}</div>
              </div>
              <p className="mt-3 text-text-secondary">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border-dark bg-card-dark p-6">
          <div className="text-lg font-bold text-white">Timeline</div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { year: '2021', text: 'Idea and early prototypes' },
              { year: '2023', text: 'Template-based redesign' },
              { year: '2025', text: 'Vite + React runnable demo' },
            ].map((t) => (
              <div key={t.year} className="rounded-xl border border-border-dark bg-surface-dark p-5">
                <div className="text-primary font-bold">{t.year}</div>
                <div className="mt-2 text-text-secondary">{t.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border-dark bg-card-dark p-6">
          <div className="text-lg font-bold text-white">Team</div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Alex Morgan', 'Jessica Doe', 'Taylor Kim', 'Sam Lee'].map((name) => (
              <div key={name} className="rounded-xl border border-border-dark bg-surface-dark p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-border-dark text-primary">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <div className="font-bold text-white">{name}</div>
                    <div className="text-xs text-text-secondary">Product</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
