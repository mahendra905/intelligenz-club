import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface AdminSqlTabProps {
  sqlSchema: string;
}

export const AdminSqlTab: React.FC<AdminSqlTabProps> = ({ sqlSchema }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlSchema], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligenz_schema_backup_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            PostgreSQL &amp; Supabase Database Exporter
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Auto-generated DDL and DML migration script for moving local JSON records into production Supabase or Cloud SQL
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg bg-[#1A1C23] hover:bg-[#252833] text-white text-xs font-semibold border border-[#2A2E3D] flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#00E5FF]" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy SQL'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-lg bg-[#00E5FF] hover:bg-[#33ebff] text-[#0A0B0E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#00E5FF]/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Migration Steps Info */}
      <div className="p-4 rounded-xl bg-[#0D1017] border border-[#1A1C23] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#9CA3AF]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] shrink-0 border border-[#00E5FF]/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">How to deploy to Supabase:</div>
            <div>
              1. Open Supabase Dashboard → SQL Editor. 2. Paste the SQL script below. 3. Click Run. All tables, indexes, and initial data will be seeded.
            </div>
          </div>
        </div>

        <a
          href="https://supabase.com/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00E5FF] hover:underline font-semibold flex items-center gap-1 shrink-0"
        >
          <span>Supabase Docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-2xl bg-[#0A0B0E] border border-[#1A1C23] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#0D1017] border-b border-[#1A1C23] flex items-center justify-between text-xs text-[#6B7280]">
          <span className="font-mono text-[11px] text-[#9CA3AF]">schema.sql (PostgreSQL 15+)</span>
          <span>{sqlSchema ? `${sqlSchema.split('\n').length} lines` : 'Generating...'}</span>
        </div>

        <pre className="p-5 font-mono text-xs text-cyan-200/90 leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto selection:bg-[#00E5FF]/20 selection:text-white">
          <code>{sqlSchema || '-- Generating Supabase SQL export...'}</code>
        </pre>
      </div>
    </div>
  );
};
