'use client';

import PageContainer from '@/components/layout/PageContainer';
import { Network, ArrowRight, Cpu, Layers, Server, Shield, CheckCircle, Milestone } from 'lucide-react';
import Mascot from '@/components/mascot/Mascot';

export default function ArchitecturePage() {
  return (
    <PageContainer
      title="Topology Map"
      description="Inspect microservices structures, request routing logic, and system configurations."
    >
      <div className="space-y-6 max-w-5xl font-sans text-left">
        {/* Core Layout Card */}
        <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#FFE5D9] pb-4">
            <div className="flex items-center gap-2.5">
              <Network className="h-5 w-5 text-[#FFB7B2]" />
              <h3 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider">Cluster Ingress Pipeline</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-sans font-bold">MODE: KUBERNETES_DECOUPLED</span>
          </div>

          {/* Interactive Topology Graph Diagram */}
          <div className="bg-[#FFFBF4]/40 border border-[#FFE5D9]/40 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-x-auto select-none">
            {/* Frontend Block */}
            <div className="flex flex-col items-center bg-white border border-[#FFE5D9] p-4 rounded-2xl shadow-sm w-full md:w-44 text-center">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">FRONTEND_INGRESS</span>
              <span className="text-xs font-bold text-[#2E2522] mt-1">Next.js Web Client</span>
              <span className="text-[9px] text-[#FFB7B2] font-mono mt-0.5">// Port: 3000</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <ArrowRight className="h-4 w-4 text-[#FFB7B2]/60 rotate-90 md:rotate-0" />
              <span className="text-[8px] text-slate-400 mt-1 hidden md:block">Routing</span>
            </div>

            {/* Gateway Block */}
            <div className="flex flex-col items-center bg-white border-2 border-[#FFB7B2] p-4 rounded-2xl shadow-sm w-full md:w-44 text-center">
              <span className="text-[8px] font-bold text-[#FFB7B2] uppercase tracking-widest">INGRESS_PROXY</span>
              <span className="text-xs font-bold text-[#2E2522] mt-1">FastAPI Gateway</span>
              <span className="text-[9px] text-[#B8B8FF] font-mono mt-0.5">// Port: 8000</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <ArrowRight className="h-4 w-4 text-[#FFB7B2]/60 rotate-90 md:rotate-0" />
              <span className="text-[8px] text-slate-400 mt-1 hidden md:block">Forward</span>
            </div>

            {/* Microservices Cluster */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white border border-[#FFE5D9] p-3 rounded-2xl text-center">
                <span className="text-xs font-bold text-[#2E2522] block">User Service</span>
                <span className="text-[9px] text-slate-400 font-mono">Port: 8001 | JWT</span>
              </div>
              <div className="bg-white border border-[#FFE5D9] p-3 rounded-2xl text-center">
                <span className="text-xs font-bold text-[#2E2522] block">Product Service</span>
                <span className="text-[9px] text-slate-400 font-mono">Port: 8002 | DB</span>
              </div>
              <div className="bg-white border border-[#FFE5D9] p-3 rounded-2xl text-center">
                <span className="text-xs font-bold text-[#2E2522] block">Order Service</span>
                <span className="text-[9px] text-slate-400 font-mono">Port: 8003 | DB</span>
              </div>
              <div className="bg-white border border-[#FFE5D9] p-3 rounded-2xl text-center">
                <span className="text-xs font-bold text-[#2E2522] block">Inventory Service</span>
                <span className="text-[9px] text-slate-400 font-mono">Port: 8004 | DB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Implemented vs Future Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Implemented Components */}
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#4ADE80]" />
              Implemented Modules
            </h4>
            <p className="text-xs text-[#7D726D] leading-relaxed font-sans">
              These backend microservices, databases, and gateways are fully active and communicate within the Docker Compose cluster network:
            </p>

            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <Server className="h-4 w-4 text-[#FFB7B2] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-[#2E2522] font-bold uppercase tracking-tight">Next.js Web Client</strong>
                  <span className="font-sans text-[#7D726D]">Compiles to a lightweight container, serving components, pages, and auth hooks.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <Server className="h-4 w-4 text-[#FFB7B2] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-[#2E2522] font-bold uppercase tracking-tight">FastAPI API Gateway</strong>
                  <span className="font-sans text-[#7D726D]">Reverse proxy dispatching public calls from browser to internal docker-bridge ports.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <Server className="h-4 w-4 text-[#FFB7B2] mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-[#2E2522] font-bold uppercase tracking-tight">PostgreSQL Storage Isolation</strong>
                  <span className="font-sans text-[#7D726D]">Dedicated database tables run independently per microservice to guarantee domain data separation.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Future Roadmap */}
          <div className="bg-white border border-[#FFE5D9] rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[#2E2522] uppercase tracking-wider flex items-center gap-2">
              <Milestone className="h-4 w-4 text-[#B8B8FF]" />
              Roadmap Improvements
            </h4>
            <p className="text-xs text-[#7D726D] leading-relaxed font-sans">
              Planned features and performance extensions to decouple components and scale workloads:
            </p>

            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <div className="text-[#FFB7B2] text-xs font-bold mt-0.5 flex-shrink-0">●</div>
                <div>
                  <strong className="block text-[#2E2522] font-bold uppercase tracking-tight">Kubernetes Ingress Controllers</strong>
                  <span className="font-sans text-[#7D726D]">Define cluster ingress rules, routing namespaces, and ConfigMap values.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <div className="text-[#FFB7B2] text-xs font-bold mt-0.5 flex-shrink-0">●</div>
                <div>
                  <strong className="block text-[#2E2522] font-bold uppercase tracking-tight">AI Recommendation Microservice</strong>
                  <span className="font-sans text-[#7D726D]">Introduce machine learning endpoints to scan purchase logs and propose suggestions.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600">
                <div className="text-[#FFB7B2] text-xs font-bold mt-0.5 flex-shrink-0">●</div>
                <div>
                  <strong className="block text-[#2E2522] font-bold uppercase tracking-tight">Kafka Event Decoupling</strong>
                  <span className="font-sans text-[#7D726D]">Decouple stock reserves from checkouts asynchronously using message queue brokers.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
