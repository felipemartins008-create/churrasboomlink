/**
 * template.js - Gera o HTML com tags Open Graph para WhatsApp e a Landing Page de Alta Conversão da ChurrasBoom
 */

function formatCurrency(val) {
  if (!val) return 'R$ 0,00';
  let clean = String(val).replace('R$', '').trim();
  // Se contiver vírgula mas não formato normal
  return clean.startsWith('R$') ? clean : `R$ ${clean}`;
}

function generateKitPage(kit, baseUrl = '', config = {}) {
  const storeName = config.storeName || 'ChurrasBoom';
  const phone = config.whatsappNumber || '5511918992002';
  const phoneDisplay = config.whatsappDisplay || '+55 11 91899-2002';

  // Garantir URL absoluta da imagem para o scraper do WhatsApp
  let absoluteImageUrl = kit.bannerUrl || '/assets/banner-churrasco-prime.jpg';
  if (!absoluteImageUrl.startsWith('http')) {
    const cleanBase = baseUrl.replace(/\/$/, '');
    absoluteImageUrl = `${cleanBase}${absoluteImageUrl.startsWith('/') ? '' : '/'}${absoluteImageUrl}`;
  }

  const precoPor = formatCurrency(kit.precoReal);

  const itens = Array.isArray(kit.itens) ? kit.itens.filter(i => i && i.trim().length > 0) : [];

  // Título e Descrição para Open Graph / WhatsApp
  const pageTitle = `🥩 ${kit.nome} | ${storeName}`;
  
  // Resumo dos primeiros itens para caber perfeitamente no balão do WhatsApp
  const itensResumo = itens.slice(0, 4).join(', ');
  const pageDesc = `🔥 VALOR DO KIT: ${precoPor}! ${itensResumo ? 'Inclui: ' + itensResumo + '...' : ''} Toque para pedir no WhatsApp!`;

  // Mensagem do WhatsApp pré-definida
  const defaultMsg = kit.whatsappMsg || `Olá ChurrasBoom! Tenho interesse no *${kit.nome}* por *${precoPor}*. Gostaria de fazer meu pedido!`;
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMsg)}`;

  // Itens HTML
  const itensHtml = itens.map((item, index) => `
    <li class="item-row">
      <div class="item-badge">#${index + 1}</div>
      <div class="item-text">
        <span class="item-name">${escapeHtml(item)}</span>
      </div>
      <span class="item-check">✓</span>
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtml(pageTitle)}</title>

  <!-- Meta Tags Essenciais para o WhatsApp (Open Graph com Foto em Destaque) -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(storeName)}" />
  <meta property="og:title" content="${escapeHtml(kit.nome)}" />
  <meta property="og:description" content="" />
  <meta name="description" content="" />
  <meta property="og:image" content="${absoluteImageUrl}" />
  <meta property="og:image:secure_url" content="${absoluteImageUrl}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(kit.nome)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(kit.nome)}" />
  <meta name="twitter:description" content="" />
  <meta name="twitter:image" content="${absoluteImageUrl}" />

  <!-- Fontes -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #0d0e12;
      --card-bg: #151821;
      --card-inner: #1c212e;
      --primary: #f97316;
      --primary-hover: #ea580c;
      --fire: #ef4444;
      --gold: #f59e0b;
      --green-zap: #22c55e;
      --green-zap-hover: #16a34a;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --border: #283145;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: radial-gradient(circle at top, #1e130c 0%, #0d0e12 55%, #050608 100%);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 16px 12px 40px;
    }

    .container {
      width: 100%;
      max-width: 480px;
      background: var(--card-bg);
      border-radius: 28px;
      border: 1px solid var(--border);
      overflow: hidden;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px rgba(249, 115, 22, 0.12);
      position: relative;
    }

    /* Top Brand Bar */
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      background: rgba(13, 14, 18, 0.85);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--border);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #fff;
    }

    .brand-logo span.highlight {
      color: var(--primary);
    }

    .brand-badge {
      font-size: 11px;
      font-weight: 700;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 3px 10px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Banner */
    .banner-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #111;
      overflow: hidden;
    }

    .banner-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    .banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(13, 14, 18, 0.85) 100%);
      pointer-events: none;
    }

    .floating-tag {
      position: absolute;
      top: 14px;
      left: 14px;
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 999px;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .banner-link {
      display: block;
      text-decoration: none;
      cursor: pointer;
    }

    .banner-link:hover .banner-img {
      transform: scale(1.03);
    }

    .tap-photo-badge {
      position: absolute;
      bottom: 14px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(34, 197, 94, 0.95);
      color: #ffffff;
      padding: 9px 18px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.3px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 197, 94, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.3);
      white-space: nowrap;
      animation: pulseBadge 1.8s infinite;
      z-index: 5;
    }

    @keyframes pulseBadge {
      0% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 197, 94, 0.6); }
      50% { transform: translateX(-50%) scale(1.04); box-shadow: 0 6px 25px rgba(0, 0, 0, 0.7), 0 0 25px rgba(34, 197, 94, 0.9); }
      100% { transform: translateX(-50%) scale(1); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 197, 94, 0.6); }
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 8px #ffffff;
    }

    /* Content Area */
    .content {
      padding: 22px 20px 24px;
    }

    .kit-title {
      font-size: 22px;
      font-weight: 800;
      line-height: 1.25;
      color: #ffffff;
      margin-bottom: 8px;
    }

    .kit-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 20px;
    }

    /* Price Box with Anchoring */
    .price-box {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%);
      border: 1px solid rgba(249, 115, 22, 0.3);
      border-radius: 18px;
      padding: 18px 20px;
      margin-bottom: 22px;
      position: relative;
    }

    .price-row-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .price-anchor-label {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .price-anchor-value {
      font-size: 15px;
      font-weight: 700;
      color: #ef4444;
      text-decoration: line-through;
    }

    .price-real-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-top: 4px;
    }

    .price-real-label {
      font-size: 14px;
      font-weight: 700;
      color: #e2e8f0;
    }

    .price-real-value {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -1px;
      color: #34d399;
      line-height: 1;
      text-shadow: 0 0 20px rgba(52, 211, 153, 0.25);
    }

    .price-pix-badge {
      font-size: 11px;
      font-weight: 700;
      background: rgba(52, 211, 153, 0.15);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
      padding: 2px 8px;
      border-radius: 6px;
      margin-left: auto;
    }

    /* Items Section */
    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .items-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }

    .item-row {
      background: var(--card-inner);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
    }

    .item-row:hover {
      border-color: rgba(249, 115, 22, 0.4);
      background: #23293a;
    }

    .item-badge {
      font-size: 11px;
      font-weight: 800;
      background: rgba(249, 115, 22, 0.15);
      color: var(--primary);
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-text {
      flex: 1;
      font-size: 13.5px;
      font-weight: 600;
      color: #f1f5f9;
      line-height: 1.35;
    }

    .item-check {
      color: #34d399;
      font-weight: 800;
      font-size: 14px;
    }

    /* Benefits Grid */
    .benefits-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 24px;
    }

    .benefit-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      font-weight: 600;
      color: #94a3b8;
    }

    .benefit-card span.icon {
      font-size: 16px;
    }

    /* Big CTA Button */
    .cta-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #ffffff;
      font-size: 16px;
      font-weight: 800;
      padding: 16px 20px;
      border-radius: 16px;
      text-decoration: none;
      box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5), 0 0 15px rgba(34, 197, 94, 0.3);
      transition: all 0.25s ease;
      cursor: pointer;
      border: none;
      width: 100%;
      animation: pulse 2.2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5); }
      50% { transform: scale(1.02); box-shadow: 0 15px 35px -5px rgba(34, 197, 94, 0.7); }
      100% { transform: scale(1); box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5); }
    }

    .cta-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-2px);
    }

    .cta-btn svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    .phone-support {
      text-align: center;
      margin-top: 14px;
      font-size: 12px;
      color: #64748b;
    }

    .phone-support a {
      color: #94a3b8;
      text-decoration: none;
      font-weight: 700;
    }

    .phone-support a:hover {
      color: var(--primary);
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- Top Brand -->
    <div class="top-bar">
      <div class="brand-logo">
        🥩 <span>CHURRAS</span><span class="highlight">BOOM</span>
      </div>
      <div class="brand-badge">🔥 OFERTA EXCLUSIVA</div>
    </div>

    <!-- Banner Clicável que Direciona para o WhatsApp da Loja -->
    <a href="${whatsappUrl}" class="banner-wrapper banner-link" id="bannerLink" title="Toque na foto para pedir este kit no WhatsApp">
      <span class="floating-tag">🥩 CORTES SELECIONADOS</span>
      <img src="${absoluteImageUrl}" alt="${escapeHtml(kit.nome)}" class="banner-img" />
      <div class="banner-overlay"></div>
      <div class="tap-photo-badge">
        <span class="pulse-dot"></span>
        <span>👉 TOQUE NA FOTO PARA PEDIR NO WHATSAPP</span>
      </div>
    </a>

    <!-- Content -->
    <div class="content">
      <h1 class="kit-title">${escapeHtml(kit.nome)}</h1>
      <p class="kit-desc">${escapeHtml(kit.descricao || 'Kit completo para seu churrasco perfeito com carnes nobres e acompanhamentos da melhor qualidade.')}</p>

      <!-- Price Box -->
      <div class="price-box">
        <div class="price-real-row">
          <span class="price-real-label">Valor do Kit</span>
          <span class="price-real-value">${precoPor}</span>
          <span class="price-pix-badge">⚡ À VISTA / PIX</span>
        </div>
      </div>

      <!-- Itens do Kit (Até 8 Itens) -->
      <div class="section-title">
        <span>🔪</span> O que vem incluso no seu kit:
      </div>
      <ul class="items-list">
        ${itensHtml}
      </ul>

      <!-- Benefícios ChurrasBoom -->
      <div class="benefits-grid">
        <div class="benefit-card">
          <span class="icon">❄️</span>
          <span>Carnes Embaladas a Vácuo</span>
        </div>
        <div class="benefit-card">
          <span class="icon">🛵</span>
          <span>Entrega Rápida e Térmica</span>
        </div>
        <div class="benefit-card">
          <span class="icon">⭐</span>
          <span>Qualidade & Padrão Prime</span>
        </div>
        <div class="benefit-card">
          <span class="icon">💳</span>
          <span>Pague na Entrega ou Pix</span>
        </div>
      </div>

      <!-- Botão Direcionamento WhatsApp -->
      <a href="${whatsappUrl}" class="cta-btn" id="btnWhatsapp">
        <svg viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.97.534 1.769.82 2.781.82 3.182 0 5.768-2.587 5.768-5.766.001-3.182-2.585-5.804-5.769-5.804zm4.187 8.309c-.174.49-1.009.938-1.404.998-.396.06-1.077.088-2.651-.564-1.921-.796-3.167-2.734-3.262-2.863-.096-.129-.773-1.028-.773-1.96 0-.933.489-1.393.663-1.583.174-.19.38-.238.507-.238.127 0 .254.002.365.008.118.006.277-.045.435.333.167.397.57 1.393.618 1.49.048.096.079.208.016.334-.063.127-.095.207-.19.318-.095.111-.201.248-.287.333-.095.096-.195.2-.084.391.111.191.493.813 1.058 1.316.727.647 1.339.848 1.53.943.19.095.302.079.413-.048.111-.127.476-.556.603-.746.127-.19.254-.159.428-.095.174.063 1.109.523 1.3.618.19.095.317.143.365.222.048.079.048.777-.127 1.267z"/>
        </svg>
        <span>Pedir Este Kit no WhatsApp</span>
      </a>

      <div class="phone-support">
        Atendimento Oficial ChurrasBoom: <a href="${whatsappUrl}">${phoneDisplay}</a>
      </div>
    </div>
  </div>

  <script>
    // Direcionamento automático para o WhatsApp da ChurrasBoom
    setTimeout(function() {
      window.location.href = "${whatsappUrl}";
    }, 1800);
  </script>

</body>
</html>`;
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  generateKitPage,
  formatCurrency
};
