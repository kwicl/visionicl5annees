/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LayoutGrid, Eye, PlusCircle, RotateCcw, AlertTriangle, Compass, Heart, Github, ExternalLink } from 'lucide-react';
import { TimeNode, TimelineConfig } from './types';
import { INITIAL_NODES, DEFAULT_CONFIG } from './initialData';
import { Header } from './components/Header';
import { SerpentineTimeline } from './components/SerpentineTimeline';
import { SaisieForm } from './components/SaisieForm';
import { SummaryDashboard } from './components/SummaryDashboard';

export default function App() {
  // Tab Management: 'view' for Page 1, 'saisie' for Page 2
  const [activeTab, setActiveTab] = useState<'view' | 'saisie'>('view');
  
  // Timeline Configuration
  const [config] = useState<TimelineConfig>(DEFAULT_CONFIG);

  // Load state from localStorage or fallback to pre-populated examples
  const [nodes, setNodes] = useState<TimeNode[]>(() => {
    try {
      const saved = localStorage.getItem('serpentine_vision_nodes_v4');
      return saved ? JSON.parse(saved) : INITIAL_NODES;
    } catch (e) {
      console.error("Erreur lors de la lecture du localStorage", e);
      return INITIAL_NODES;
    }
  });

  // Highlighted node ID in accordion/timeline
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Editing state
  const [selectedNodeToEdit, setSelectedNodeToEdit] = useState<TimeNode | null>(null);

  // Sync state to localStorage on every update
  useEffect(() => {
    localStorage.setItem('serpentine_vision_nodes_v4', JSON.stringify(nodes));
  }, [nodes]);

  // Handler: Add new node
  const handleAddNode = (newNode: TimeNode) => {
    setNodes((prev) => [...prev, newNode]);
    // Automatically focus the newly created node
    setSelectedNodeId(newNode.id);
  };

  // Handler: Update existing node
  const handleUpdateNode = (updatedNode: TimeNode) => {
    setNodes((prev) => prev.map((node) => (node.id === updatedNode.id ? updatedNode : node)));
    setSelectedNodeToEdit(null);
    setSelectedNodeId(updatedNode.id);
    
    // Switch to view page to see the updated node
    setActiveTab('view');
  };

  // Handler: Quietly update a node without redirecting or clearing edit states (e.g. checkbox state toggle)
  const handleUpdateNodeQuietly = (updatedNode: TimeNode) => {
    setNodes((prev) => prev.map((node) => (node.id === updatedNode.id ? updatedNode : node)));
  };

  // Handler: Delete node
  const handleDeleteNode = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet élément de votre timeline ?')) {
      setNodes((prev) => prev.filter((node) => node.id !== id));
      if (selectedNodeId === id) {
        setSelectedNodeId(null);
      }
    }
  };

  // Trigger editing a node
  const handleSelectNodeToEdit = (node: TimeNode) => {
    setSelectedNodeToEdit(node);
    setActiveTab('saisie'); // Redirect to entry page
    
    // Scroll smoothly to form
    setTimeout(() => {
      const element = document.getElementById('saisie-form-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setSelectedNodeToEdit(null);
  };

  // Restore initial mockup data
  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données et recharger la timeline d\'exemples ? Vos modifications actuelles seront écrasées.')) {
      setNodes(INITIAL_NODES);
      setSelectedNodeId(null);
      setSelectedNodeToEdit(null);
      localStorage.setItem('serpentine_vision_nodes_v4', JSON.stringify(INITIAL_NODES));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans antialiased">
      
      {/* Dynamic Header & Stats Center */}
      <Header config={config} nodes={nodes} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs (Pages 1 & 2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-xs">
          
          <div className="flex bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto border border-gray-200/40">
            {/* TAB 1: Visualisation (Page 1) */}
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 text-orange-500" />
              1. Visualisation & Serpentin
            </button>

            {/* TAB 2: Saisie & Synthèse (Page 2) */}
            <button
              onClick={() => setActiveTab('saisie')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'saisie'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              2. Saisie & Récapitulatifs
            </button>
          </div>

          {/* Quick actions: Reset timeline demo */}
          <button
            onClick={handleResetData}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-500 hover:text-orange-600 hover:bg-orange-50 bg-white border border-gray-100 hover:border-orange-100 rounded-xl transition-all cursor-pointer"
            title="Recharger la timeline de démonstration sur 5 ans"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser les exemples
          </button>
        </div>

        {/* Tab views with layout animations */}
        <div className="transition-all duration-300">
          
          {/* PAGE 1: Visualisation et Serpentin */}
          {activeTab === 'view' && (
            <div className="space-y-6">
              
              {/* Informative Header Banner */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                    <Compass className="w-5 h-5 animate-pulse-slow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Le Concept Serpentin & Projection de Vie</h3>
                    <p className="text-xs text-gray-600 font-normal mt-0.5 max-w-2xl leading-relaxed">
                      Chaque boucle sinueuse représente une année d'opportunités de 2024 à 2029. 
                      La partie <strong className="text-orange-600 font-semibold">Rouge/Orange</strong> est le temps accompli (Le Passé). 
                      La partie <strong className="text-emerald-600 font-semibold">Verte/Bleue</strong> est le futur à écrire (Le Futur & Projection).
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('saisie')}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Ajouter un jalon
                </button>
              </div>

              {/* Serpentine Timeline Component & Accordion List Grid */}
              <SerpentineTimeline
                config={config}
                nodes={nodes}
                onSelectNodeToEdit={handleSelectNodeToEdit}
                onDeleteNode={handleDeleteNode}
                selectedNodeId={selectedNodeId}
                onSelectNodeId={setSelectedNodeId}
                onUpdateNode={handleUpdateNodeQuietly}
              />
            </div>
          )}

          {/* PAGE 2: Saisie, Observations et Récapitulatifs */}
          {activeTab === 'saisie' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Saisie Input Form (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {selectedNodeToEdit && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-orange-900">Mode modification actif</div>
                      <div className="text-[11px] text-orange-700 font-medium">Vous modifiez actuellement : "{selectedNodeToEdit.title}"</div>
                    </div>
                  </div>
                )}

                <SaisieForm
                  config={config}
                  onAddNode={handleAddNode}
                  selectedNodeToEdit={selectedNodeToEdit}
                  onUpdateNode={handleUpdateNode}
                  onCancelEdit={handleCancelEdit}
                />
              </div>

              {/* Right Column: Summary Dashboard Center (lg:col-span-7) */}
              <div className="lg:col-span-7">
                <SummaryDashboard
                  nodes={nodes}
                  onEditNode={handleSelectNodeToEdit}
                  onDeleteNode={handleDeleteNode}
                />
              </div>

            </div>
          )}

        </div>

      </main>

      {/* Elegant minimalist footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto py-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="flex items-center gap-1">
            Kwicl vision — Visualisateur de Projection Temporelle. Fait avec
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> pour les bâtisseurs d'objectifs.
          </p>
          <div className="flex gap-4 font-medium">
            <span className="text-gray-300">|</span>
            <span className="font-mono text-[10px]">Aujourd'hui : {config.todayDate} (2026)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
