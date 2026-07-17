'use client';

import PageContainer from '@/components/layout/PageContainer';
import { Network, ArrowRight, Cpu, Layers, Server, Shield, CheckCircle2, Milestone } from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <PageContainer
      title="System Architecture Topology"
      description="Visual representation of CloudCart's cloud-native microservices layout, routing paths, and technical specifications."
    >
      <div className="space-y-6 max-w-5xl">
        {/* Core Layout Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Current Topology Map</h3>
          </div>

          {/* Interactive Topology Graph Diagram */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-x-auto">
            {/* Frontend Block */}
            <div className="flex flex-col items-center bg-white border border-slate-200 p-4 rounded shadow-sm w-full md:w-44 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frontend App</span>
              <span className="text-sm font-bold text-slate-800 mt-1">Next.js Client</span>
              <span className="text-xs text-slate-500 font-mono mt-0.5">Port 3000</span>
            </div>

            <ArrowRight className="h-5 w-5 text-slate-400 rotate-90 md:rotate-0" />

            {/* Gateway Block */}
            <div className="flex flex-col items-center bg-blue-50 border border-blue-200 p-4 rounded shadow-sm w-full md:w-44 text-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">API Gateway</span>
              <span className="text-sm font-bold text-slate-800 mt-1">FastAPI Proxy</span>
              <span className="text-xs text-slate-500 font-mono mt-0.5">Port 8000</span>
            </div>

            <ArrowRight className="h-5 w-5 text-slate-400 rotate-90 md:rotate-0" />

            {/* Microservices Cluster */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-white border border-slate-200 p-3 rounded shadow-sm text-center">
                <span className="text-xs font-bold text-slate-800 block">User Service</span>
                <span className="text-[10px] text-slate-400 font-mono">Port 8001 (JWT Auth)</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded shadow-sm text-center">
                <span className="text-xs font-bold text-slate-800 block">Product Service</span>
                <span className="text-[10px] text-slate-400 font-mono">Port 8002</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded shadow-sm text-center">
                <span className="text-xs font-bold text-slate-800 block">Order Service</span>
                <span className="text-[10px] text-slate-400 font-mono">Port 8003</span>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded shadow-sm text-center">
                <span className="text-xs font-bold text-slate-800 block">Inventory Service</span>
                <span className="text-[10px] text-slate-400 font-mono">Port 8004</span>
              </div>
            </div>
          </div>
        </div>

        {/* Implemented vs Future Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Implemented Components */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Currently Implemented
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              These backend microservices, datastores, and interfaces are fully active, communication routing securely through the API Gateway:
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <Server className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">Next.js App Router Client</strong>
                  <span>Server components, hook systems, Tailwind styling, and dynamic layouts.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <Server className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">FastAPI API Gateway</strong>
                  <span>Reverse proxy layer dispatching request payloads to downstream ports.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <Server className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">User Service (JWT Auth)</strong>
                  <span>Handles credentials verification and returns token structures containing user identities.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <Server className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">Product Service</strong>
                  <span>Hosts products and filters entries by search parameters or categories.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <Server className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">Inventory & Order Services</strong>
                  <span>Controls order lifecycles and reserves item allocations sequentially.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <Server className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900 font-bold">PostgreSQL Databases</strong>
                  <span>Relational schema engines configured individually per microservice for isolation.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Future Roadmap */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Milestone className="h-5 w-5 text-blue-600" />
              Future Improvements Roadmap
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Planned cloud infrastructure extensions to decouple components and scale workloads:
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="text-amber-500 text-sm font-bold mt-0.5 flex-shrink-0">🚧</div>
                <div>
                  <strong className="block text-slate-900 font-bold">API Gateway JWT Enforcement</strong>
                  <span>Add middleware directly at the Gateway layer to validate token signatures before forwarding downstreams.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="text-amber-500 text-sm font-bold mt-0.5 flex-shrink-0">🚧</div>
                <div>
                  <strong className="block text-slate-900 font-bold">Kafka Event Broker</strong>
                  <span>Introduce event-driven queues to decouple order updates from inventory state updates asynchronously.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="text-amber-500 text-sm font-bold mt-0.5 flex-shrink-0">🚧</div>
                <div>
                  <strong className="block text-slate-900 font-bold">Kubernetes Orchestration</strong>
                  <span>Define manifest pods, deployments, services, and ingress patterns for multi-replica scaling.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="text-amber-500 text-sm font-bold mt-0.5 flex-shrink-0">🚧</div>
                <div>
                  <strong className="block text-slate-900 font-bold">Prometheus / Grafana Stack</strong>
                  <span>Enable telemetry scraper channels to log microservice CPU metrics and payload error rates dynamically.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
