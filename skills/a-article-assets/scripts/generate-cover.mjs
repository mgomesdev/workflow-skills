#!/usr/bin/env node

/**
 * Gerador Criativo de Capas de Artigos (Design-as-Code: HTML/CSS/SVG -> PNG 1200x630)
 * Cada artigo possui uma composição visual e artefato gráfico EXCLUSIVO baseado no seu contexto real,
 * seguindo a identidade Dark Editorial (.stitch/DESIGN.md e LLM Wiki).
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const REPO_ROOT = process.cwd();
const PHOTO_PATH = path.join(REPO_ROOT, 'public/brand/photo/profile-photo-tight.jpg');
const AUTHOR_NAME = process.env.COVER_AUTHOR_NAME || 'Author Name';
const AUTHOR_ROLE = process.env.COVER_AUTHOR_ROLE || 'Frontend Engineer';
const AUTHOR_DOMAIN = process.env.COVER_AUTHOR_DOMAIN || 'example.dev';

function getPhotoDataUri() {
  if (!fs.existsSync(PHOTO_PATH)) return '';
  const base64 = fs.readFileSync(PHOTO_PATH).toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background-color: #0A0A0C;
    color: #F8FAFC;
    font-family: 'Outfit', system-ui, sans-serif;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px 44px 24px 44px;
  }
  .top-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
  }
  .command-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(18, 19, 24, 0.85);
    border: 1px solid #1E293B;
    border-radius: 999px;
    padding: 5px 16px 5px 6px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .author-badge {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
  }
  .author-name {
    font-size: 13.5px;
    font-weight: 700;
    color: #F8FAFC;
  }
  .author-role {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10.5px;
    color: #94A3B8;
  }
  .badge-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .category-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 4px 12px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .series-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #94A3B8;
    padding: 4px 10px;
    border-radius: 999px;
    background: #0A0A0C;
    border: 1px solid #1E293B;
  }
  .hero-center {
    text-align: center;
    max-width: 980px;
    margin: 2px auto 0 auto;
  }
  .main-title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: #F8FAFC;
    margin-bottom: 5px;
  }
  .main-subtitle {
    font-family: 'Geist', sans-serif;
    font-size: 13.5px;
    color: #94A3B8;
    max-width: 840px;
    margin: 0 auto 9px auto;
    line-height: 1.4;
  }
  .metrics-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .metric-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #E2E8F0;
    background: #121318;
    border: 1px solid #1E293B;
    padding: 4px 10px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .stage-deck-container {
    width: 100%;
    height: 310px;
    position: relative;
  }
`;

function wrapPage({ bgStyle, topBarColor, pillColor, pillBg, pillBorder, category, seriesTag, titleHtml, subtitle, metrics, photoDataUri, rightVisualHtml, extraCss = '' }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    ${BASE_CSS}
    body { ${bgStyle} }
    .top-accent {
      background: ${topBarColor};
    }
    .category-pill {
      color: ${pillColor};
      background: ${pillBg};
      border: 1px solid ${pillBorder};
    }
    .pulse-dot {
      background: ${pillColor};
      box-shadow: 0 0 8px ${pillColor};
    }
    ${extraCss}
  </style>
</head>
<body>
  <div class="top-accent"></div>

  <!-- TOP COMMAND BAR -->
  <div class="command-bar">
    <div class="author-badge">
      ${photoDataUri ? `<img class="avatar" style="border:2px solid ${pillColor}" src="${photoDataUri}" alt="${AUTHOR_NAME}" />` : ''}
      <div>
        <div class="author-name">${AUTHOR_NAME}</div>
        <div class="author-role">${AUTHOR_ROLE} · ${AUTHOR_DOMAIN}</div>
      </div>
    </div>
    <div class="badge-group">
      <span class="category-pill"><span class="pulse-dot"></span>${category}</span>
      <span class="series-tag">${seriesTag}</span>
    </div>
  </div>

  <!-- CENTER EDITORIAL HERO -->
  <div class="hero-center">
    <h1 class="main-title">${titleHtml}</h1>
    <p class="main-subtitle">${subtitle}</p>
    <div class="metrics-row">
      ${metrics.map((m) => `<span class="metric-chip"><span style="color:${pillColor};font-weight:700;">●</span> ${m}</span>`).join('')}
    </div>
  </div>

  <!-- INTEGRATED PANORAMIC STAGE DECK -->
  <div class="stage-deck-container">
    ${rightVisualHtml}
  </div>
</body>
</html>`;
}

// ============================================================================
// 1. PROJECT BRAIN: Grafo de Conhecimento + Árvore Git knowledge/
// ============================================================================
function buildProjectBrainCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.12), transparent 50%), radial-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px); background-size: 100% 100%, 28px 28px;`,
    topBarColor: 'linear-gradient(90deg, #F59E0B 0%, #3B82F6 100%)',
    pillColor: '#F59E0B',
    pillBg: 'rgba(245, 158, 11, 0.1)',
    pillBorder: 'rgba(245, 158, 11, 0.35)',
    category: 'ARQUITETURA DE SISTEMAS IA',
    seriesTag: 'AI-DLC #01 · KNOWLEDGE GRAPH',
    titleHtml: '<span style="color:#F59E0B">Project Brain</span>: Memória Persistente para IA com <span style="color:#3B82F6">LLM Wiki</span> e Git',
    subtitle: 'Arquitetura em 3 camadas (Karpathy) versionada no Azure DevOps e consultada via MCP sem estourar a janela de contexto.',
    metrics: ['knowledge/index.md', 'MCP Least Privilege', 'lint:wiki (Zod)'],
    photoDataUri,
    extraCss: `
      .brain-stage {
        width: 100%;
        height: 310px;
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 14px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.55);
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: stretch;
        padding: 14px;
        gap: 14px;
      }
      .tree-card {
        width: 36%;
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 10px;
        padding: 14px 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        line-height: 1.7;
        color: #E2E8F0;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .tree-folder { color: #F59E0B; font-weight: 700; }
      .tree-file { color: #60A5FA; }
      .tree-comment { color: #64748B; font-size: 10px; }
      .graph-box {
        flex: 1;
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 10px;
        position: relative;
        overflow: hidden;
      }
      .node-pill {
        position: absolute;
        padding: 6px 12px;
        border-radius: 999px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        background: #121318;
        color: #F8FAFC;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 6px 16px rgba(0,0,0,0.5);
      }
    `,
    rightVisualHtml: `
      <div class="brain-stage">
        <div class="tree-card">
          <div><span class="tree-folder">📂 knowledge/</span> <span class="tree-comment"># Single Source of Truth</span></div>
          <div style="padding-left:14px">├── <span class="tree-file">SCHEMA.md</span> <span class="tree-comment">➔ Contrato YAML & IA</span></div>
          <div style="padding-left:14px">├── <span class="tree-file">index.md</span> <span class="tree-comment">➔ Catálogo Low-Token</span></div>
          <div style="padding-left:14px">├── <span class="tree-folder">raw/</span> <span class="tree-comment">➔ Fontes Imutáveis (Camada 1)</span></div>
          <div style="padding-left:14px">└── <span class="tree-folder">wiki/</span> <span class="tree-comment">➔ Síntese Viva (Camada 2)</span></div>
        </div>

        <div class="graph-box">
          <svg width="100%" height="100%" viewBox="0 0 620 280" fill="none">
            <line x1="310" y1="140" x2="120" y2="65" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4 4"/>
            <line x1="310" y1="140" x2="500" y2="65" stroke="#3B82F6" stroke-width="1.5"/>
            <line x1="310" y1="140" x2="120" y2="215" stroke="#10B981" stroke-width="1.5"/>
            <line x1="310" y1="140" x2="500" y2="215" stroke="#3B82F6" stroke-width="1.5"/>
            <circle cx="310" cy="140" r="48" fill="rgba(59, 130, 246, 0.12)" stroke="#3B82F6" stroke-width="2"/>
          </svg>
          <div class="node-pill" style="top:118px;left:240px;border:2px solid #3B82F6;background:#1E293B;">
            <span style="color:#60A5FA">●</span> index.md (SSoT)
          </div>
          <div class="node-pill" style="top:46px;left:50px;border:1px solid #F59E0B;">
            <span style="color:#F59E0B">●</span> raw/sources
          </div>
          <div class="node-pill" style="top:46px;right:50px;border:1px solid #3B82F6;">
            <span style="color:#3B82F6">●</span> wiki/concepts
          </div>
          <div class="node-pill" style="bottom:46px;left:50px;border:1px solid #10B981;">
            <span style="color:#10B981">✓</span> lint:wiki (Zod)
          </div>
          <div class="node-pill" style="bottom:46px;right:50px;border:1px solid #3B82F6;">
            <span style="color:#60A5FA">⚡</span> MCP Server ADO
          </div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 2. INVEST-SMART-AGIL: Fatia Vertical do Bolo + Board Kanban + HEART Pulse
// ============================================================================
function buildInvestSmartCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, transparent 50%), linear-gradient(to right, rgba(30, 41, 59, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.3) 1px, transparent 1px); background-size: 100% 100%, 64px 64px, 64px 64px;`,
    topBarColor: 'linear-gradient(90deg, #10B981 0%, #F59E0B 100%)',
    pillColor: '#10B981',
    pillBg: 'rgba(16, 185, 129, 0.1)',
    pillBorder: 'rgba(16, 185, 129, 0.35)',
    category: 'ENGENHARIA ÁGIL & IA',
    seriesTag: 'AI-DLC #02 · INVEST + SMART',
    titleHtml: 'Refinamento Ágil com IA: Histórias <span style="color:#F59E0B">INVEST</span> em Tasks <span style="color:#10B981">SMART</span> no Azure Boards',
    subtitle: 'A história é a fatia vertical de valor; as tasks são as camadas horizontais com 100% de cobertura BDD e telemetria HEART.',
    metrics: ['6 Dimensões INVEST', '100% Cobertura BDD', 'Métricas HEART'],
    photoDataUri,
    extraCss: `
      .agile-deck {
        width: 100%;
        height: 310px;
        display: flex;
        gap: 14px;
        align-items: stretch;
      }
      .slice-matrix {
        width: 48%;
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 14px;
        padding: 14px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
      }
      .matrix-header {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #94A3B8;
        display: flex;
        justify-content: space-between;
      }
      .layer-bar {
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 8px;
        padding: 10px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11.5px;
      }
      .vertical-pillar {
        position: absolute;
        top: 44px;
        bottom: 14px;
        right: 20px;
        width: 116px;
        background: rgba(245, 158, 11, 0.14);
        border: 2px solid #F59E0B;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 8px;
        backdrop-filter: blur(4px);
      }
      .kanban-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
      }
      .kanban-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        flex: 1;
      }
      .kanban-col {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
      }
      .kanban-col-title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: #94A3B8;
        text-transform: uppercase;
        display: flex;
        justify-content: space-between;
      }
      .kanban-card {
        background: #0A0A0C;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 10px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #F8FAFC;
      }
      .heart-strip {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      }
    `,
    rightVisualHtml: `
      <div class="agile-deck">
        <div class="slice-matrix">
          <div class="matrix-header">
            <span>CAMADAS HORIZONTAIS (SMART TASKS)</span>
            <span style="color:#F59E0B">FATIA VERTICAL</span>
          </div>
          <div class="layer-bar" style="border-left:3px solid #3B82F6">
            <span>Task 1 · UI & 4 Estados</span>
            <span style="color:#64748B;padding-right:124px">CA1, CA2</span>
          </div>
          <div class="layer-bar" style="border-left:3px solid #10B981">
            <span>Task 2 · Schemas Zod & Logic</span>
            <span style="color:#64748B;padding-right:124px">CA3, CA4</span>
          </div>
          <div class="layer-bar" style="border-left:3px solid #F59E0B;margin-bottom:0">
            <span>Task 3 · E2E & Eventos HEART</span>
            <span style="color:#64748B;padding-right:124px">CA5 (100%)</span>
          </div>
          <div class="vertical-pillar">
            <span style="font-family:'JetBrains Mono';font-size:11px;font-weight:700;color:#F59E0B">HISTÓRIA INVEST</span>
            <span style="font-family:'JetBrains Mono';font-size:10px;color:#F8FAFC;margin-top:4px">Valor Ponta a Ponta</span>
          </div>
        </div>

        <div class="kanban-section">
          <div class="kanban-row">
            <div class="kanban-col">
              <div class="kanban-col-title"><span>Proposing</span><span style="color:#F59E0B">M1</span></div>
              <div class="kanban-card" style="border-top:2px solid #F59E0B">
                <div>US #82 · Escopo</div>
                <div style="color:#94A3B8;font-size:10px;margin-top:4px">[I][N][V][E][S][T]</div>
              </div>
            </div>
            <div class="kanban-col">
              <div class="kanban-col-title"><span>Refinement</span><span style="color:#3B82F6">M2</span></div>
              <div class="kanban-card" style="border-top:2px solid #3B82F6">
                <div>Critérios BDD</div>
                <div style="color:#60A5FA;font-size:10px;margin-top:4px">+ Riscos Mapeados</div>
              </div>
            </div>
            <div class="kanban-col">
              <div class="kanban-col-title"><span>Developing</span><span style="color:#10B981">GATE</span></div>
              <div class="kanban-card" style="border-top:2px solid #10B981">
                <div>Tasks SMART</div>
                <div style="color:#10B981;font-size:10px;margin-top:4px">✓ 100% Cobertura</div>
              </div>
            </div>
          </div>

          <div class="heart-strip">
            <span style="color:#94A3B8">📊 TELEMETRIA HEART:</span>
            <span style="color:#10B981">scroll_depth</span>
            <span style="color:#3B82F6">code_copy</span>
            <span style="color:#F59E0B">toc_click</span>
          </div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 3. PROTOTIPACAO STITCH MCP: Panoramic 4 UI States Track (Default, Loading, Error, Empty)
// ============================================================================
function buildStitchPrototypingCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.12), transparent 50%), radial-gradient(rgba(59, 130, 246, 0.14) 1px, transparent 1px); background-size: 100% 100%, 24px 24px;`,
    topBarColor: 'linear-gradient(90deg, #3B82F6 0%, #10B981 50%, #EF4444 100%)',
    pillColor: '#3B82F6',
    pillBg: 'rgba(59, 130, 246, 0.12)',
    pillBorder: 'rgba(59, 130, 246, 0.35)',
    category: 'PROTOTIPAÇÃO UX & MCP',
    seriesTag: 'AI-DLC #03 · 4 UI STATES',
    titleHtml: 'Prototipação UX com <span style="color:#3B82F6">Google Stitch MCP</span>: Os <span style="color:#10B981">4 Estados de UI</span> no Terminal',
    subtitle: 'Contrato .stitch/DESIGN.md e geração dos estados Default, Loading, Error e Empty em HTML antes de codificar.',
    metrics: ['.stitch/DESIGN.md', '4 Estados Obrigatórios', 'HTML Semântico no Git'],
    photoDataUri,
    extraCss: `
      .states-panoramic {
        width: 100%;
        height: 310px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .state-window {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 14px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 36px rgba(0,0,0,0.55);
      }
      .state-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10.5px;
        padding-bottom: 8px;
        border-bottom: 1px solid #1E293B;
      }
      .mock-canvas {
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 8px;
        padding: 12px;
        flex: 1;
        margin-top: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }
      .bar { height: 9px; border-radius: 4px; }
      .card-mini {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 6px;
        padding: 8px;
      }
    `,
    rightVisualHtml: `
      <div class="states-panoramic">
        <!-- 1. DEFAULT STATE -->
        <div class="state-window" style="border-top: 3px solid #10B981">
          <div class="state-top">
            <span style="color:#F8FAFC;font-weight:700">1. DEFAULT</span>
            <span style="color:#10B981;background:rgba(16,185,129,0.12);padding:2px 6px;border-radius:4px">REAL DATA</span>
          </div>
          <div class="mock-canvas">
            <div class="bar" style="width:45%;background:#3B82F6"></div>
            <div class="bar" style="width:85%;height:14px;background:#F8FAFC"></div>
            <div class="card-mini">
              <div class="bar" style="width:70%;background:#94A3B8;margin-bottom:6px"></div>
              <div class="bar" style="width:40%;height:6px;background:#10B981"></div>
            </div>
            <div class="card-mini">
              <div class="bar" style="width:60%;background:#94A3B8"></div>
            </div>
          </div>
        </div>

        <!-- 2. LOADING STATE -->
        <div class="state-window" style="border-top: 3px solid #3B82F6">
          <div class="state-top">
            <span style="color:#F8FAFC;font-weight:700">2. LOADING</span>
            <span style="color:#60A5FA;background:rgba(59,130,246,0.12);padding:2px 6px;border-radius:4px">SKELETON</span>
          </div>
          <div class="mock-canvas">
            <div class="bar" style="width:40%;background:#1E293B"></div>
            <div class="bar" style="width:80%;height:14px;background:#1E293B"></div>
            <div class="card-mini" style="background:#0F1117;border-style:dashed">
              <div class="bar" style="width:75%;background:#1E293B;margin-bottom:6px"></div>
              <div class="bar" style="width:50%;height:6px;background:#1E293B"></div>
            </div>
            <div class="card-mini" style="background:#0F1117;border-style:dashed">
              <div class="bar" style="width:65%;background:#1E293B"></div>
            </div>
          </div>
        </div>

        <!-- 3. ERROR STATE -->
        <div class="state-window" style="border-top: 3px solid #EF4444">
          <div class="state-top">
            <span style="color:#F8FAFC;font-weight:700">3. ERROR</span>
            <span style="color:#F87171;background:rgba(239,68,68,0.12);padding:2px 6px;border-radius:4px">RECOVERY</span>
          </div>
          <div class="mock-canvas" style="align-items:center;text-align:center;border-color:rgba(239,68,68,0.35)">
            <div style="width:26px;height:26px;border-radius:50%;background:rgba(239,68,68,0.15);color:#EF4444;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono';font-weight:700">!</div>
            <div style="font-family:'JetBrains Mono';font-size:11px;color:#F8FAFC">Falha ao ler artigos</div>
            <div style="font-family:'JetBrains Mono';font-size:10px;background:#EF4444;color:#F8FAFC;padding:4px 10px;border-radius:6px;margin-top:4px">[Recarregar]</div>
          </div>
        </div>

        <!-- 4. EMPTY STATE -->
        <div class="state-window" style="border-top: 3px solid #F59E0B">
          <div class="state-top">
            <span style="color:#F8FAFC;font-weight:700">4. EMPTY</span>
            <span style="color:#FBBF24;background:rgba(245,158,11,0.12);padding:2px 6px;border-radius:4px">GUIDANCE</span>
          </div>
          <div class="mock-canvas" style="align-items:center;text-align:center;border-style:dashed;border-color:#334155">
            <div style="font-family:'JetBrains Mono';font-size:11px;color:#94A3B8">Nenhum artigo publicado</div>
            <div style="font-family:'JetBrains Mono';font-size:10px;color:#F59E0B;border:1px solid rgba(245,158,11,0.4);padding:4px 8px;border-radius:6px;margin-top:4px">Acompanhar ➔</div>
          </div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 4. FLUXO DE VOLTA (REACT + PLAYWRIGHT): Split-Screen Diff Scanner (0.2%)
// ============================================================================
function buildFluxoDeVoltaCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.07) 100%), linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px); background-size: 100% 100%, 48px 48px, 48px 48px;`,
    topBarColor: 'linear-gradient(90deg, #3B82F6 0%, #EC4899 50%, #10B981 100%)',
    pillColor: '#3B82F6',
    pillBg: 'rgba(59, 130, 246, 0.12)',
    pillBorder: 'rgba(59, 130, 246, 0.35)',
    category: 'DESIGN SYSTEM & REACT',
    seriesTag: 'AI-DLC #04 · VISUAL DRIFT 0.2%',
    titleHtml: 'Do Protótipo ao <span style="color:#3B82F6">React 19</span>: Regressão Visual com <span style="color:#10B981">Playwright</span> (0.2%)',
    subtitle: 'Decomposição de HTML em Atomic Design flat e comparação pixel a pixel automática contra quebras de layout.',
    metrics: ['Atomic Design Flat', 'AST + Biome 13ms', 'maxDiffPixelRatio: 0.002'],
    photoDataUri,
    extraCss: `
      .diff-deck {
        width: 100%;
        height: 310px;
        display: flex;
        gap: 14px;
        align-items: stretch;
      }
      .code-compare-col {
        width: 54%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .pane {
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 14px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.55);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .pane-title {
        font-size: 10.5px;
        color: #94A3B8;
        padding-bottom: 8px;
        border-bottom: 1px solid #1E293B;
        display: flex;
        justify-content: space-between;
      }
      .code-line { margin-bottom: 6px; color: #E2E8F0; }
      .diff-feedback-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
      }
      .matrix-card {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
      }
      .pixel-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
        margin-top: 8px;
      }
      .px {
        height: 16px;
        border-radius: 3px;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid rgba(16, 185, 129, 0.4);
      }
      .px.diff {
        background: rgba(236, 72, 153, 0.35);
        border: 1px solid #EC4899;
      }
      .terminal-out {
        background: #0A0A0C;
        border: 1px solid #10B981;
        border-radius: 12px;
        padding: 12px 14px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        line-height: 1.6;
        box-shadow: 0 16px 36px rgba(0,0,0,0.55);
      }
    `,
    rightVisualHtml: `
      <div class="diff-deck">
        <div class="code-compare-col">
          <div class="pane" style="border-top:3px solid #F59E0B">
            <div class="pane-title"><span>.stitch/home.html</span><span style="color:#F59E0B">CONTRACT</span></div>
            <div>
              <div class="code-line" style="color:#94A3B8">&lt;section class="py-12"&gt;</div>
              <div class="code-line" style="padding-left:10px;color:#60A5FA">&lt;h1 class="font-display"&gt;</div>
              <div class="code-line" style="padding-left:10px;color:#34D399">&lt;a class="mt-4 bg-brand"&gt;</div>
              <div class="code-line" style="color:#94A3B8">&lt;/section&gt;</div>
            </div>
            <div style="font-size:10px;color:#64748B">Single HTML Contract</div>
          </div>

          <div class="pane" style="border-top:3px solid #3B82F6">
            <div class="pane-title"><span>hero-section.tsx</span><span style="color:#60A5FA">REACT 19</span></div>
            <div>
              <div class="code-line" style="color:#94A3B8">export const Hero = () =&gt; (</div>
              <div class="code-line" style="padding-left:10px;color:#60A5FA">&lt;HeroTitle /&gt;</div>
              <div class="code-line" style="padding-left:10px;color:#34D399">&lt;Button className="mt-4" /&gt;</div>
              <div class="code-line" style="color:#94A3B8">);</div>
            </div>
            <div style="font-size:10px;color:#64748B">Atomic Components</div>
          </div>
        </div>

        <div class="diff-feedback-col">
          <div class="matrix-card">
            <div style="font-family:'JetBrains Mono';font-size:10.5px;color:#94A3B8;display:flex;justify-content:space-between">
              <span>PLAYWRIGHT PIXEL MATRIX</span>
              <span style="color:#10B981">TOLERANCE: 0.2%</span>
            </div>
            <div class="pixel-grid">
              <div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div>
              <div class="px"></div><div class="px"></div><div class="px diff" title="Detected Layout Drift"></div><div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div><div class="px"></div>
            </div>
          </div>

          <div class="terminal-out">
            <div style="color:#10B981">✓ Drift check: blog-home-default (1.1s)</div>
            <div style="color:#10B981">✓ Drift check: blog-home-loading (885ms)</div>
            <div style="color:#10B981">✓ Drift check: error &amp; empty (910ms)</div>
            <div style="color:#94A3B8;font-size:10px;margin-top:4px">Zero hex hardcoded (AST) · 4/4 Matched ✅</div>
          </div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 5. CI/CD AZURE DEVOPS & VERCEL DORA: Pipeline 7 Gates + PR Bot + 4 DORA Cards
// ============================================================================
function buildCiCdDoraCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.1), transparent 55%), linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px); background-size: 100% 100%, 72px 72px, 72px 72px;`,
    topBarColor: 'linear-gradient(90deg, #3B82F6 0%, #10B981 60%, #F59E0B 100%)',
    pillColor: '#10B981',
    pillBg: 'rgba(16, 185, 129, 0.1)',
    pillBorder: 'rgba(16, 185, 129, 0.35)',
    category: 'CI/CD & DEVOPS',
    seriesTag: 'AI-DLC #05 · PIPELINE & DORA',
    titleHtml: 'CI/CD no <span style="color:#3B82F6">Azure DevOps</span> e <span style="color:#10B981">Vercel</span>: 7 Quality Gates, Previews e <span style="color:#F59E0B">DORA</span>',
    subtitle: 'Print de referência gerado na hora no container Linux, comentário automático de preview na PR e dashboard DORA.',
    metrics: ['7 Quality Gates', '0 MB .png no Git', '-20 min/release'],
    photoDataUri,
    extraCss: `
      .cicd-deck {
        width: 100%;
        height: 310px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
      }
      .gates-track {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 12px 18px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
      }
      .gates-nodes {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;
      }
      .gate-circle {
        width: 125px;
        height: 42px;
        border-radius: 8px;
        background: #0A0A0C;
        border: 1.5px solid #10B981;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: 'JetBrains Mono', monospace;
      }
      .cicd-bottom-row {
        flex: 1;
        display: flex;
        gap: 12px;
      }
      .pr-bot-card {
        width: 44%;
        background: #121318;
        border: 1px solid #3B82F6;
        border-radius: 12px;
        padding: 14px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .dora-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .dora-kpi {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 10px;
        padding: 10px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 12px 24px rgba(0,0,0,0.4);
      }
      .kpi-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        color: #94A3B8;
        text-transform: uppercase;
      }
      .kpi-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 15px;
        font-weight: 700;
        color: #F8FAFC;
        margin-top: 2px;
      }
    `,
    rightVisualHtml: `
      <div class="cicd-deck">
        <!-- 7 GATES HORIZONTAL PIPELINE -->
        <div class="gates-track">
          <div style="font-family:'JetBrains Mono';font-size:10.5px;color:#94A3B8;display:flex;justify-content:space-between">
            <span>STAGE 1 · 7 SEQUENTIAL QUALITY GATES</span>
            <span style="color:#10B981">ALL PASSED ✓</span>
          </div>
          <div class="gates-nodes">
            <div class="gate-circle"><span style="font-size:11px;color:#10B981;font-weight:700">G1</span><span style="font-size:10px;color:#94A3B8">Stitch</span></div>
            <div class="gate-circle"><span style="font-size:11px;color:#10B981;font-weight:700">G2</span><span style="font-size:10px;color:#94A3B8">Biome</span></div>
            <div class="gate-circle"><span style="font-size:11px;color:#10B981;font-weight:700">G3</span><span style="font-size:10px;color:#94A3B8">TS 7</span></div>
            <div class="gate-circle"><span style="font-size:11px;color:#10B981;font-weight:700">G4</span><span style="font-size:10px;color:#94A3B8">Vitest</span></div>
            <div class="gate-circle"><span style="font-size:11px;color:#F59E0B;font-weight:700">G5</span><span style="font-size:10px;color:#94A3B8">Build</span></div>
            <div class="gate-circle"><span style="font-size:11px;color:#3B82F6;font-weight:700">G6</span><span style="font-size:10px;color:#94A3B8">E2E</span></div>
            <div class="gate-circle"><span style="font-size:11px;color:#10B981;font-weight:700">G7</span><span style="font-size:10px;color:#94A3B8">Visual</span></div>
          </div>
        </div>

        <div class="cicd-bottom-row">
          <!-- AZURE DEVOPS PR BOT COMMENT -->
          <div class="pr-bot-card">
            <div style="display:flex;justify-content:space-between;color:#60A5FA;font-weight:700">
              <span>💬 ADO Bot · PR #27</span>
              <span style="color:#10B981">🚀 Preview Ready</span>
            </div>
            <div style="background:#0A0A0C;padding:8px 10px;border-radius:8px;border:1px solid #1E293B;color:#E2E8F0">
              <div>🔗 <strong>Preview URL:</strong> <span style="color:#3B82F6">app-preview-pr27.vercel.app</span></div>
              <div style="color:#94A3B8;margin-top:2px;font-size:10px">📦 Env: preview · 📌 Commit: 97702a8</div>
            </div>
            <div style="font-size:10px;color:#10B981">Automatic Branch Cleanup &amp; Zero Manual Step</div>
          </div>

          <!-- 4 DORA METRICS CARDS -->
          <div class="dora-grid">
            <div class="dora-kpi" style="border-left:3px solid #10B981">
              <div><div class="kpi-label">Deployment Freq</div><div class="kpi-val">On-Demand</div></div>
              <span style="color:#10B981;font-family:'JetBrains Mono';font-size:10px">ELITE</span>
            </div>
            <div class="dora-kpi" style="border-left:3px solid #3B82F6">
              <div><div class="kpi-label">Lead Time</div><div class="kpi-val">&lt; 15 min</div></div>
              <span style="color:#60A5FA;font-family:'JetBrains Mono';font-size:10px">TRACKED</span>
            </div>
            <div class="dora-kpi" style="border-left:3px solid #10B981">
              <div><div class="kpi-label">Change Failure</div><div class="kpi-val">0.0%</div></div>
              <span style="color:#10B981;font-family:'JetBrains Mono';font-size:10px">7 GATES</span>
            </div>
            <div class="dora-kpi" style="border-left:3px solid #F59E0B">
              <div><div class="kpi-label">MTTR Recovery</div><div class="kpi-val">Instant</div></div>
              <span style="color:#F59E0B;font-family:'JetBrains Mono';font-size:10px">ROLLBACK</span>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 6. JORNADA & APRENDIZADOS: Panoramic 5-Stage Architecture Deck
// ============================================================================
function buildJornadaStandardCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.14), transparent 50%), radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.08), transparent 45%), radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.1), transparent 45%), radial-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 100% 100%, 28px 28px;`,
    topBarColor: 'linear-gradient(90deg, #F59E0B 0%, #3B82F6 50%, #10B981 100%)',
    pillColor: '#3B82F6',
    pillBg: 'rgba(59, 130, 246, 0.12)',
    pillBorder: 'rgba(59, 130, 246, 0.35)',
    category: 'ENGENHARIA COM IA',
    seriesTag: 'LANÇAMENTO · VISÃO DE PONTA A PONTA',
    titleHtml: 'Da Ideia ao <span style="color:#10B981">Deploy com IA</span>: Minha Jornada e <span style="color:#3B82F6">Aprendizados</span> no SDLC',
    subtitle: 'Como conectei memória em Git, histórias INVEST, protótipos de 4 estados, testes visuais e CI/CD sem perder o controle.',
    metrics: ['5 Pilares Conectados', 'Custo Zero Infra', 'Sensores Determinísticos'],
    photoDataUri,
    extraCss: `
      .journey-panoramic {
        width: 100%;
        height: 310px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
      }
      .stages-row-deck {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
        flex: 1;
      }
      .stage-card {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
      }
      .stage-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        padding-bottom: 6px;
        border-bottom: 1px solid #1E293B;
      }
      .stage-title {
        font-size: 13px;
        font-weight: 700;
        color: #F8FAFC;
        margin-top: 6px;
        line-height: 1.25;
      }
      .stage-learn {
        font-family: 'Geist', sans-serif;
        font-size: 11px;
        color: #94A3B8;
        margin-top: 4px;
        line-height: 1.35;
      }
      .stage-bottom {
        margin-top: auto;
        padding-top: 6px;
        border-top: 1px solid #1E293B;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        display: flex;
        justify-content: space-between;
      }
      .summary-banner {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 10px;
        padding: 10px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        box-shadow: 0 10px 24px rgba(0,0,0,0.4);
      }
    `,
    rightVisualHtml: `
      <div class="journey-panoramic">
        <div class="stages-row-deck">
          <!-- 1 -->
          <div class="stage-card" style="border-top: 3px solid #F59E0B">
            <div>
              <div class="stage-top">
                <span style="color:#F59E0B;font-weight:700">01 · MEMÓRIA</span>
                <span style="color:#64748B">knowledge/</span>
              </div>
              <div class="stage-title">Project Brain</div>
              <div class="stage-learn">Contexto vivo versionado em Git + MCP Least Privilege.</div>
            </div>
            <div class="stage-bottom">
              <span style="color:#94A3B8">Sensor:</span>
              <span style="color:#F59E0B">✓ lint:wiki</span>
            </div>
          </div>

          <!-- 2 -->
          <div class="stage-card" style="border-top: 3px solid #10B981">
            <div>
              <div class="stage-top">
                <span style="color:#10B981;font-weight:700">02 · ESCOPO</span>
                <span style="color:#64748B">Azure Boards</span>
              </div>
              <div class="stage-title">INVEST + SMART</div>
              <div class="stage-learn">Fatia vertical de valor com 100% cobertura BDD e HEART.</div>
            </div>
            <div class="stage-bottom">
              <span style="color:#94A3B8">Gate:</span>
              <span style="color:#10B981">✓ 100% BDD</span>
            </div>
          </div>

          <!-- 3 -->
          <div class="stage-card" style="border-top: 3px solid #3B82F6">
            <div>
              <div class="stage-top">
                <span style="color:#60A5FA;font-weight:700">03 · DESIGN</span>
                <span style="color:#64748B">.stitch/</span>
              </div>
              <div class="stage-title">Google Stitch</div>
              <div class="stage-learn">Contrato DESIGN.md e 4 estados de UI em HTML.</div>
            </div>
            <div class="stage-bottom">
              <span style="color:#94A3B8">Sensor:</span>
              <span style="color:#60A5FA">✓ 4/4 States</span>
            </div>
          </div>

          <!-- 4 -->
          <div class="stage-card" style="border-top: 3px solid #3B82F6">
            <div>
              <div class="stage-top">
                <span style="color:#60A5FA;font-weight:700">04 · CÓDIGO</span>
                <span style="color:#64748B">React 19</span>
              </div>
              <div class="stage-title">Fluxo de Volta</div>
              <div class="stage-learn">Atomic components com regressão visual Playwright.</div>
            </div>
            <div class="stage-bottom">
              <span style="color:#94A3B8">Drift:</span>
              <span style="color:#60A5FA">✓ &lt;= 0.2%</span>
            </div>
          </div>

          <!-- 5 -->
          <div class="stage-card" style="border-top: 3px solid #10B981">
            <div>
              <div class="stage-top">
                <span style="color:#10B981;font-weight:700">05 · DEPLOY</span>
                <span style="color:#64748B">Vercel + DORA</span>
              </div>
              <div class="stage-title">CI/CD &amp; DORA</div>
              <div class="stage-learn">7 Quality Gates, bot de preview e telemetria contínua.</div>
            </div>
            <div class="stage-bottom">
              <span style="color:#94A3B8">Release:</span>
              <span style="color:#10B981">✓ -20 min</span>
            </div>
          </div>
        </div>

        <div class="summary-banner">
          <div style="font-weight:700;color:#F8FAFC">⚡ ARQUITETURA DE PONTA A PONTA</div>
          <div style="display:flex;gap:20px;">
            <span><strong style="color:#F59E0B">●</strong> Memória Compartilhada (MCP)</span>
            <span><strong style="color:#3B82F6">●</strong> Contratos no Git</span>
            <span><strong style="color:#10B981">●</strong> Sensores Determinísticos</span>
          </div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 6B. JORNADA & APRENDIZADOS (VERSÃO 2 ESPECIAL: ARQUITETURA PANORÂMICA DE LANÇAMENTO — FULL-WIDTH COMMAND DECK)
// ============================================================================
function buildJornadaSpecialCover(photoDataUri) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background-color: #0A0A0C;
      background-image:
        radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.16), transparent 58%),
        radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.08), transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.1), transparent 45%),
        linear-gradient(to right, rgba(30, 41, 59, 0.28) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(30, 41, 59, 0.28) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px;
      color: #F8FAFC;
      font-family: 'Outfit', system-ui, sans-serif;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 48px 34px 48px;
    }
    .top-accent {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 5px;
      background: linear-gradient(90deg, #F59E0B 0%, #3B82F6 50%, #10B981 100%);
    }
    /* HEADER PANORÂMICO COM PERFIL À ESQUERDA E STATUS DE LANÇAMENTO À DIREITA */
    .command-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(18, 19, 24, 0.9);
      border: 1px solid #1E293B;
      border-radius: 999px;
      padding: 8px 18px 8px 10px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.45);
    }
    .author-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-special {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #3B82F6;
      box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
    }
    .author-meta-name {
      font-size: 15px;
      font-weight: 700;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .role-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #60A5FA;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 2px 8px;
      border-radius: 999px;
    }
    .author-meta-sub {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #94A3B8;
      margin-top: 2px;
    }
    .launch-pills {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .pill-live {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10B981;
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    .dot-live {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }
    .pill-domain {
      padding: 6px 12px;
      border-radius: 999px;
      background: #0A0A0C;
      border: 1px solid #1E293B;
      color: #E2E8F0;
    }

    /* BLOCO EDITORIAL CENTRAL */
    .hero-center {
      text-align: center;
      max-width: 1020px;
      margin: 0 auto;
    }
    .kicker {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #F59E0B;
      margin-bottom: 10px;
    }
    .main-title {
      font-family: 'Outfit', sans-serif;
      font-size: 44px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #F8FAFC;
      margin-bottom: 12px;
    }
    .main-subtitle {
      font-family: 'Geist', sans-serif;
      font-size: 16px;
      color: #94A3B8;
      max-width: 860px;
      margin: 0 auto;
      line-height: 1.45;
    }

    /* TRILHA HORIZONTAL PANORÂMICA DOS 5 PILARES DA JORNADA */
    .pipeline-deck {
      position: relative;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      align-items: stretch;
    }
    .connector-line {
      position: absolute;
      top: 50%;
      left: 40px;
      right: 40px;
      height: 2px;
      background: linear-gradient(90deg, #F59E0B 0%, #10B981 25%, #3B82F6 50%, #3B82F6 75%, #10B981 100%);
      z-index: 1;
      opacity: 0.5;
    }
    .stage-card {
      background: #121318;
      border: 1px solid #1E293B;
      border-radius: 14px;
      padding: 14px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 188px;
      box-shadow: 0 18px 36px rgba(0,0,0,0.6);
      position: relative;
    }
    .stage-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      gap: 6px;
    }
    .step-tag {
      padding: 3px 7px;
      border-radius: 6px;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .stage-artifact {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #64748B;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .stage-title {
      font-size: 16px;
      font-weight: 700;
      color: #F8FAFC;
      line-height: 1.25;
      margin-top: 8px;
    }
    .stage-learn {
      font-family: 'Geist', sans-serif;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.38;
      margin-top: 6px;
    }
    .stage-sensor {
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid #1E293B;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* BARRA INFERIOR DE SÍNTESE DE PAPEL & IMPACTO */
    .bottom-summary {
      background: #121318;
      border: 1px solid #1E293B;
      border-radius: 12px;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .summary-items {
      display: flex;
      align-items: center;
      gap: 22px;
    }
  </style>
</head>
<body>
  <div class="top-accent"></div>

  <!-- 1. TOP COMMAND BAR -->
  <div class="command-bar">
    <div class="author-badge">
      ${photoDataUri ? `<img class="avatar-special" src="${photoDataUri}" alt="${AUTHOR_NAME}" />` : ''}
      <div>
        <div class="author-meta-name">
          <span>${AUTHOR_NAME}</span>
          <span class="role-tag">${AUTHOR_ROLE}</span>
        </div>
        <div class="author-meta-sub">Arquiteto, Revisor, Aprovador e Responsável pelo Resultado</div>
      </div>
    </div>
    <div class="launch-pills">
      <span class="pill-domain">🌐 ${AUTHOR_DOMAIN}</span>
      <span class="pill-live"><span class="dot-live"></span>LANÇAMENTO OFICIAL · SÉRIE COMPLETA</span>
    </div>
  </div>

  <!-- 2. CENTER EDITORIAL HEADLINE -->
  <div class="hero-center">
    <div class="kicker">DO ZERO AO DEPLOY COM AGENTES DE IA · SÍNTESE DE ARQUITETURA E APRENDIZADOS</div>
    <h1 class="main-title">
      Da Ideia ao <span style="color:#10B981">Deploy com IA</span>: Minha Jornada Construindo um <span style="color:#3B82F6">Sistema de Engenharia</span>
    </h1>
    <p class="main-subtitle">
      Como conectei memória persistente, planejamento ágil, prototipação de 4 estados, testes visuais e CI/CD em 5 etapas onde cada entrega alimenta a próxima sem perder o controle.
    </p>
  </div>

  <!-- 3. PANORAMIC 5-STAGE BLUEPRINT -->
  <div class="pipeline-deck">
    <div class="connector-line"></div>

    <!-- PILAR 1 -->
    <div class="stage-card" style="border-top: 3px solid #F59E0B">
      <div>
        <div class="stage-top">
          <span class="step-tag" style="background:rgba(245,158,11,0.15);color:#F59E0B">01 · MEMÓRIA</span>
          <span class="stage-artifact">knowledge/</span>
        </div>
        <div class="stage-title">Project Brain &amp; LLM Wiki</div>
        <div class="stage-learn">Contexto versionado em Git para trocar de modelo sem amnésia.</div>
      </div>
      <div class="stage-sensor">
        <span style="color:#94A3B8">Sensor:</span>
        <span style="color:#F59E0B">✓ lint:wiki (Zod)</span>
      </div>
    </div>

    <!-- PILAR 2 -->
    <div class="stage-card" style="border-top: 3px solid #10B981">
      <div>
        <div class="stage-top">
          <span class="step-tag" style="background:rgba(16,185,129,0.15);color:#10B981">02 · ESCOPO</span>
          <span class="stage-artifact">Azure Boards</span>
        </div>
        <div class="stage-title">Histórias INVEST &amp; Tasks SMART</div>
        <div class="stage-learn">Critérios BDD, riscos e telemetria HEART definidos antes do código.</div>
      </div>
      <div class="stage-sensor">
        <span style="color:#94A3B8">Gate:</span>
        <span style="color:#10B981">✓ 100% Cobertura</span>
      </div>
    </div>

    <!-- PILAR 3 -->
    <div class="stage-card" style="border-top: 3px solid #3B82F6">
      <div>
        <div class="stage-top">
          <span class="step-tag" style="background:rgba(59,130,246,0.15);color:#60A5FA">03 · DESIGN</span>
          <span class="stage-artifact">.stitch/</span>
        </div>
        <div class="stage-title">Fluxo de Ida (Google Stitch)</div>
        <div class="stage-learn">Contrato DESIGN.md e os 4 estados (Default, Loading, Error, Empty).</div>
      </div>
      <div class="stage-sensor">
        <span style="color:#94A3B8">Sensor:</span>
        <span style="color:#60A5FA">✓ 4/4 UI States</span>
      </div>
    </div>

    <!-- PILAR 4 -->
    <div class="stage-card" style="border-top: 3px solid #3B82F6">
      <div>
        <div class="stage-top">
          <span class="step-tag" style="background:rgba(59,130,246,0.15);color:#60A5FA">04 · CÓDIGO</span>
          <span class="stage-artifact">src/components/</span>
        </div>
        <div class="stage-title">Fluxo de Volta (React 19)</div>
        <div class="stage-learn">Decomposição do HTML em componentes limpos e comparação pixel a pixel.</div>
      </div>
      <div class="stage-sensor">
        <span style="color:#94A3B8">Drift:</span>
        <span style="color:#60A5FA">✓ &lt;= 0.2% Pixels</span>
      </div>
    </div>

    <!-- PILAR 5 -->
    <div class="stage-card" style="border-top: 3px solid #10B981">
      <div>
        <div class="stage-top">
          <span class="step-tag" style="background:rgba(16,185,129,0.15);color:#10B981">05 · DEPLOY</span>
          <span class="stage-artifact">CI/CD + DORA</span>
        </div>
        <div class="stage-title">CI/CD, Previews &amp; DORA</div>
        <div class="stage-learn">7 Quality Gates no container, preview automático na PR e métricas DORA.</div>
      </div>
      <div class="stage-sensor">
        <span style="color:#94A3B8">Release:</span>
        <span style="color:#10B981">✓ -20 min/deploy</span>
      </div>
    </div>
  </div>

  <!-- 4. BOTTOM SUMMARY BAR -->
  <div class="bottom-summary">
    <div style="color:#F8FAFC;font-weight:700">⚡ ARQUITETURA DE PONTA A PONTA</div>
    <div class="summary-items">
      <span><strong style="color:#F59E0B">●</strong> Memória Compartilhada (MCP)</span>
      <span><strong style="color:#3B82F6">●</strong> Contratos Declarativos no Git</span>
      <span><strong style="color:#10B981">●</strong> Sensores Determinísticos · Custo Zero</span>
    </div>
  </div>
</body>
</html>`;
}

function buildOuterLoopCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.12), transparent 55%), linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px); background-size: 100% 100%, 72px 72px, 72px 72px;`,
    topBarColor: 'linear-gradient(90deg, #10B981 0%, #3B82F6 50%, #F59E0B 100%)',
    pillColor: '#10B981',
    pillBg: 'rgba(16, 185, 129, 0.1)',
    pillBorder: 'rgba(16, 185, 129, 0.35)',
    category: 'TELEMETRIA & AUTOMAÇÃO COM IA',
    seriesTag: 'THE AGENTIC CURATOR · TELEMETRIA & TRIAGEM',
    titleHtml: 'Da <span style="color:#10B981">Telemetria</span> ao <span style="color:#3B82F6">Backlog</span>: Automação no <span style="color:#F59E0B">Azure Boards</span>',
    subtitle: 'Por que dashboards isolados falham e como conectei Sentry, Vercel e sinais do GA4 para priorizar tarefas críticas sem intervenção manual.',
    metrics: ['Sentry + Vercel + GA4', 'Triagem com IA', 'Azure Boards Priorizado'],
    photoDataUri,
    extraCss: `
      .outer-deck {
        width: 100%;
        height: 310px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
      }
      .telemetry-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .telemetry-box {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 10px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-family: 'JetBrains Mono', monospace;
      }
      .box-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .box-stat {
        font-size: 13px;
        font-weight: 700;
        color: #F8FAFC;
      }
      .box-metric {
        font-size: 9px;
        color: #94A3B8;
      }
      .engine-card {
        background: #121318;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.5);
      }
      .engine-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
      }
      .matrix-pills {
        display: flex;
        gap: 6px;
      }
      .matrix-pill {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        padding: 3px 6px;
        border-radius: 4px;
        font-weight: 700;
      }
      .board-output {
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 8px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
      }
    `,
    rightVisualHtml: `
      <div class="outer-deck">
        <div class="telemetry-row">
          <div class="telemetry-box" style="border-top: 2px solid #EF4444">
            <span class="box-label" style="color: #F87171">SENTRY MCP</span>
            <span class="box-stat">Zero Errors</span>
            <span class="box-metric">Taxa Exceção &lt; 0.01%</span>
          </div>
          <div class="telemetry-box" style="border-top: 2px solid #3B82F6">
            <span class="box-label" style="color: #60A5FA">VERCEL MCP</span>
            <span class="box-stat">Edge Ready</span>
            <span class="box-metric">Builds Verdes · 5xx = 0</span>
          </div>
          <div class="telemetry-box" style="border-top: 2px solid #10B981">
            <span class="box-label" style="color: #34D399">GA4 DATA API</span>
            <span class="box-stat">Sinais HEART</span>
            <span class="box-metric">Scroll &gt; 75% · Engajamento</span>
          </div>
        </div>

        <div class="engine-card">
          <div class="engine-header">
            <span style="color:#F59E0B;font-weight:700">⚡ AVALIADOR DE RISCO (IA)</span>
            <span style="color:#94A3B8">Digest Unificado</span>
          </div>
          <div class="matrix-pills">
            <div class="matrix-pill" style="background:rgba(239,68,68,0.15);color:#F87171;border:1px solid #EF4444">Alto: P0 Topo</div>
            <div class="matrix-pill" style="background:rgba(245,158,11,0.15);color:#FBBF24;border:1px solid #F59E0B">Médio: S1 INVEST</div>
            <div class="matrix-pill" style="background:rgba(16,185,129,0.15);color:#34D399;border:1px solid #10B981">Baixo: Backlog</div>
          </div>
        </div>

        <div class="board-output" style="border-left: 3px solid #10B981">
          <div>
            <div style="color:#F8FAFC;font-weight:700">AZURE BOARDS · TOP DO BACKLOG</div>
            <div style="color:#94A3B8;font-size:9px;margin-top:2px">Stack Rank 950+ · Conventional Commits</div>
          </div>
          <div style="color:#10B981;font-weight:700">✓ AUTOMATIZADO</div>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// 8. DO BACKLOG AO DEPLOY (FLUXO AUTÔNOMO POR SEVERIDADE BAIXA E MÉDIA):
//    Worktrees Simultâneas (.worktrees/ :3100-3600) + 3 Níveis de Severidade + Exceção SMART
// ============================================================================
function buildAutonomousFlowCover(photoDataUri) {
  return wrapPage({
    bgStyle: `background-image: radial-gradient(circle at 20% 85%, rgba(59, 130, 246, 0.12), transparent 50%), radial-gradient(circle at 85% 20%, rgba(16, 185, 129, 0.1), transparent 50%), linear-gradient(to right, rgba(30, 41, 59, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.35) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 56px 56px, 56px 56px;`,
    topBarColor: 'linear-gradient(90deg, #3B82F6 0%, #10B981 50%, #F59E0B 100%)',
    pillColor: '#3B82F6',
    pillBg: 'rgba(59, 130, 246, 0.12)',
    pillBorder: 'rgba(59, 130, 246, 0.35)',
    category: 'TELEMETRIA & AUTOMAÇÃO COM IA',
    seriesTag: 'AI-DLC · WORKTREES & 3 SEVERIDADES',
    titleHtml:
      'Do <span style="color:#3B82F6">Backlog</span> ao <span style="color:#10B981">Deploy</span>: Execução de Cards por <span style="color:#F59E0B">Severidade</span>',
    subtitle:
      'Worktrees simultâneas em sandbox para tarefas de baixa e média; auto-merge nas simples, minha revisão na média e execução manual na alta.',
    metrics: ['Worktrees em Sandbox', 'Baixa: Auto-Merge | Média: Revisão', 'Alta: Eu Faço do Início ao Fim'],
    photoDataUri,
    extraCss: `
      .flow-deck {
        width: 100%;
        height: 310px;
        display: grid;
        grid-template-columns: 0.92fr 1.28fr;
        gap: 14px;
        align-items: stretch;
      }
      .hierarchy-col {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 14px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 36px rgba(0,0,0,0.55);
      }
      .col-header {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: #94A3B8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 7px;
        border-bottom: 1px solid #1E293B;
      }
      .track-box {
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 10px;
        padding: 9px 11px;
        font-family: 'JetBrains Mono', monospace;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .track-title {
        font-size: 10.5px;
        font-weight: 700;
        color: #F8FAFC;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .track-sub {
        font-size: 9.5px;
        color: #94A3B8;
        line-height: 1.35;
      }
      .port-badges {
        display: flex;
        gap: 5px;
        margin-top: 2px;
      }
      .port-pill {
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(59, 130, 246, 0.14);
        border: 1px solid rgba(59, 130, 246, 0.4);
        color: #60A5FA;
      }
      .risk-col {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 9px;
      }
      .diff-gate {
        background: #0A0A0C;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 8px 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 8px 20px rgba(0,0,0,0.45);
      }
      .severity-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 9px;
        flex: 1;
      }
      .sev-card {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 12px;
        padding: 10px 10px;
        font-family: 'JetBrains Mono', monospace;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 16px 36px rgba(0,0,0,0.5);
      }
      .sev-item {
        font-size: 9px;
        color: #E2E8F0;
        padding: 4px 6px;
        background: #0A0A0C;
        border: 1px solid #1E293B;
        border-radius: 5px;
        line-height: 1.3;
      }
      .roll-strip {
        background: #121318;
        border: 1px solid #1E293B;
        border-radius: 10px;
        padding: 7px 12px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,
    rightVisualHtml: `
      <div class="flow-deck">
        <!-- LEFT: SIMULTANEOUS WORKTREES IN SANDBOX -->
        <div class="hierarchy-col">
          <div class="col-header">
            <span>WORKTREES EM SANDBOX</span>
            <span style="color:#3B82F6;font-weight:700">SEM CONFLITO</span>
          </div>

          <div class="track-box" style="border-left: 3px solid #10B981">
            <div class="track-title">
              <span>1. Entrega Direta (Sem Subtarefas)</span>
              <span style="color:#10B981;font-size:9px">➔ main</span>
            </div>
            <div class="track-sub">Calcula SemVer + CHANGELOG.md na worktree isolada</div>
          </div>

          <div class="track-box" style="border-left: 3px solid #3B82F6">
            <div class="track-title">
              <span>2. História + Subtarefas</span>
              <span style="color:#60A5FA;font-size:9px">PR N1 ➔ PR N2</span>
            </div>
            <div class="track-sub">Subtarefas simples fazem auto-merge na história; média eu reviso:</div>
            <div class="port-badges">
              <span class="port-pill">Subtarefa 1</span>
              <span class="port-pill">Subtarefa 2</span>
              <span class="port-pill">Subtarefa 3</span>
            </div>
          </div>

          <div style="font-family:'JetBrains Mono';font-size:9.5px;color:#94A3B8;display:flex;justify-content:space-between;padding-top:2px">
            <span>✓ Isolado em Sandbox</span>
            <span style="color:#10B981">✓ 1 Único git push</span>
          </div>
        </div>

        <!-- RIGHT: 3 SEVERITY LEVELS -->
        <div class="risk-col">
          <div class="diff-gate">
            <span style="color:#F8FAFC;font-weight:700">$ git diff --name-only origin/target...HEAD</span>
            <span style="color:#F59E0B;background:rgba(245,158,11,0.14);padding:2px 8px;border-radius:4px;font-size:9px">3 NÍVEIS DE SEVERIDADE</span>
          </div>

          <div class="severity-grid">
            <!-- LOW SEVERITY -->
            <div class="sev-card" style="border-top: 3px solid #10B981">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:10px;font-weight:700;color:#10B981">1. BAIXA</span>
                <span style="font-size:8.5px;color:#94A3B8">Simples</span>
              </div>
              <div class="sev-item">✓ Worktree + Sandbox</div>
              <div class="sev-item">✓ Sem arquivo sensível</div>
              <div class="sev-item">✓ Direta ou Subtarefa</div>
              <div style="font-size:9px;color:#10B981;font-weight:700;text-align:center;background:rgba(16,185,129,0.12);padding:4px;border-radius:5px">
                ➔ Merge Automático
              </div>
            </div>

            <!-- MEDIUM SEVERITY -->
            <div class="sev-card" style="border-top: 3px solid #F59E0B">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:10px;font-weight:700;color:#F59E0B">2. MÉDIA</span>
                <span style="font-size:8.5px;color:#FBBF24">Até a PR</span>
              </div>
              <div class="sev-item">✓ Worktree + Sandbox</div>
              <div class="sev-item">⚠ Vai até abrir a PR</div>
              <div class="sev-item">⏸ Worktree em espera</div>
              <div style="font-size:9px;color:#F59E0B;font-weight:700;text-align:center;background:rgba(245,158,11,0.12);padding:4px;border-radius:5px">
                ➔ Eu Reviso e Aprovo
              </div>
            </div>

            <!-- HIGH SEVERITY -->
            <div class="sev-card" style="border-top: 3px solid #FB7185">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:10px;font-weight:700;color:#FB7185">3. ALTA</span>
                <span style="font-size:8.5px;color:#FDA4AF">Complexa</span>
              </div>
              <div class="sev-item">👤 Eu pego para fazer</div>
              <div class="sev-item">🛠 Mesmo processo da IA</div>
              <div class="sev-item">✓ Worktree + TDD + Wiki</div>
              <div style="font-size:9px;color:#FB7185;font-weight:700;text-align:center;background:rgba(251,113,133,0.12);padding:4px;border-radius:5px">
                ➔ Faço do Início ao Fim
              </div>
            </div>
          </div>

          <div class="roll-strip">
            <span style="color:#E2E8F0">🔄 Correção para Frente (Roll-Forward)</span>
            <span style="color:#60A5FA">🧹 Limpeza Manual de Branches</span>
          </div>
        </div>
      </div>
    `,
  });
}

async function main() {
  const photoDataUri = getPhotoDataUri();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });

  const jobs = [
    {
      output: 'public/articles/project-brain/cover-project-brain-blueprint.png',
      html: buildProjectBrainCover(photoDataUri),
    },
    {
      output: 'public/articles/invest-smart-agil/cover-invest-smart-agil-blueprint.png',
      html: buildInvestSmartCover(photoDataUri),
    },
    {
      output:
        'public/articles/prototipacao-ux-google-stitch-mcp/cover-prototipacao-stitch-mcp-blueprint.png',
      html: buildStitchPrototypingCover(photoDataUri),
    },
    {
      output:
        'public/articles/fluxo-de-volta-stitch-para-codigo-react/cover-fluxo-de-volta-stitch-codigo-blueprint.png',
      html: buildFluxoDeVoltaCover(photoDataUri),
    },
    {
      output: 'public/articles/ci-cd-azure-devops-vercel-dora/cover-ci-cd-dora-blueprint.png',
      html: buildCiCdDoraCover(photoDataUri),
    },
    {
      output:
        'public/articles/jornada-e-aprendizados-do-zero-ao-deploy-com-ia/cover-jornada-e-aprendizados-blueprint.png',
      html: buildJornadaStandardCover(photoDataUri),
    },
    {
      output:
        'public/articles/da-telemetria-ao-backlog-automacao-triagem-azure-boards/cover-da-telemetria-ao-backlog-blueprint.png',
      html: buildOuterLoopCover(photoDataUri),
    },
    {
      output:
        'public/articles/do-backlog-ao-deploy-fluxo-autonomo-severidade-baixa-e-media/cover-do-backlog-ao-deploy-blueprint.png',
      html: buildAutonomousFlowCover(photoDataUri),
    },
  ];

  for (const job of jobs) {
    const outputPath = path.join(REPO_ROOT, job.output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await page.setContent(job.html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✅ Capa exclusiva gerada em: ${job.output}`);
  }

  // Também atualiza os 4 prints dos protótipos da Home do Blog a partir de .stitch/designs/blog-home-*.html
  const prototypeScreens = [
    {
      htmlFile: '.stitch/designs/blog-home-default.html',
      output: 'public/articles/prototipacao-ux-google-stitch-mcp/prototype-blog-home-default.png',
      fullPage: true,
    },
    {
      htmlFile: '.stitch/designs/blog-home-loading.html',
      output: 'public/articles/prototipacao-ux-google-stitch-mcp/prototype-blog-home-loading.png',
      fullPage: false,
      height: 1000,
    },
    {
      htmlFile: '.stitch/designs/blog-home-error.html',
      output: 'public/articles/prototipacao-ux-google-stitch-mcp/prototype-blog-home-error.png',
      fullPage: false,
      height: 900,
    },
    {
      htmlFile: '.stitch/designs/blog-home-empty.html',
      output: 'public/articles/prototipacao-ux-google-stitch-mcp/prototype-blog-home-empty.png',
      fullPage: true,
    },
  ];

  const protoPage = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    deviceScaleFactor: 2,
  });
  await protoPage.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });

  for (const screen of prototypeScreens) {
    const htmlAbsPath = path.join(REPO_ROOT, screen.htmlFile);
    const outAbsPath = path.join(REPO_ROOT, screen.output);
    if (!fs.existsSync(htmlAbsPath)) continue;

    await protoPage.setViewportSize({ width: 1280, height: screen.height || 1000 });
    await protoPage.goto(`file://${htmlAbsPath}`, { waitUntil: 'networkidle' });
    await protoPage.evaluate(() => document.fonts.ready);
    await protoPage.screenshot({
      path: outAbsPath,
      type: 'png',
      fullPage: Boolean(screen.fullPage),
      animations: 'disabled',
    });
    console.log(`✅ Print de protótipo atualizado em: ${screen.output}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error('Erro ao gerar capas:', err);
  process.exit(1);
});
