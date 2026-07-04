import { TimeNode, TimelineConfig } from './types';

// The timeline spans from 2026-01-01 to 2030-12-31 (5 Years)
// Today is exactly 2026-07-04
export const DEFAULT_CONFIG: TimelineConfig = {
  startDate: '2026-01-01',
  endDate: '2030-12-31',
  todayDate: '2026-07-04',
};

export const INITIAL_NODES: TimeNode[] = [
  {
    id: 'demo-node-1',
    title: "Création de l'identité de marque & Charte graphique",
    description: "Définition de la charte visuelle de Kwicl Vision",
    date: '2026-03-15',
    type: 'project',
    category: 'Growth',
    notes: "Nous avons validé les palettes de couleurs chaleureuses, les typographies Inter & Space Grotesk, et les principes d'expérience utilisateur fluides et réactifs.",
    completed: true,
    prerequisites: [
      { id: 'p1-1', text: "Séance créative de recherche de nom", completed: true },
      { id: 'p1-2', text: "Définition de la palette chromatique & contraste", completed: true },
      { id: 'p1-3', text: "Conception et test des maquettes d'interface", completed: true }
    ]
  },
  {
    id: 'demo-node-2',
    title: "Lancement de la plateforme SaaS",
    description: "Mise en ligne de la version d'essai publique (v1)",
    date: '2026-11-20',
    type: 'project',
    category: 'Professional',
    notes: "Le jalon phare de l'année. Ce lancement marque l'entrée en production du moteur de projection temporelle interactif.",
    completed: false,
    prerequisites: [
      { id: 'p2-1', text: "Développement du moteur de calcul et rendu", completed: true },
      { id: 'p2-2', text: "Tests utilisateurs et corrections d'ergonomie", completed: false },
      { id: 'p2-3', text: "Rédaction de la documentation d'intégration", completed: false },
      { id: 'p2-4', text: "Création de la page d'inscription précoce", completed: false }
    ]
  },
  {
    id: 'demo-node-3',
    title: "Seuil de Rentabilité & 10k Membres",
    description: "Objectif clé d'expansion utilisateur et d'autofinancement",
    date: '2027-06-15',
    type: 'milestone',
    category: 'Financial',
    notes: "Valider la traction et l'adéquation au marché. Ce seuil financier nous donnera l'élan pour déployer des serveurs dédiés performants.",
    completed: false,
    prerequisites: [
      { id: 'p3-1', text: "Optimiser le parcours de souscription", completed: false },
      { id: 'p3-2', text: "Mettre en place une boucle virale de parrainage", completed: false },
      { id: 'p3-3', text: "Partenariats stratégiques de co-marketing", completed: false }
    ]
  }
];
