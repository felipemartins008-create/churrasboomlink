const express = require('express');
const fs = require('fs');
const path = require('path');
const { generateKitPage } = require('./template');

const app = express();
const PORT = process.env.PORT || 3334;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'kits.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

function getKits() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveKits(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      baseUrl: `http://localhost:${PORT}`,
      whatsappNumber: '5511918992002',
      whatsappDisplay: '+55 11 91899-2002',
      storeName: 'ChurrasBoom',
      slogan: 'O melhor churrasco no conforto da sua casa'
    };
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    return {
      baseUrl: `http://localhost:${PORT}`,
      whatsappNumber: '5511918992002',
      whatsappDisplay: '+55 11 91899-2002',
      storeName: 'ChurrasBoom'
    };
  }
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Upload para Imgur com fallback local
async function uploadToCloud(buffer) {
  const base64Data = buffer.toString('base64');
  const clientIds = ['546c25a59c58ad7', 'e1ff1b53c613e51', '28eb2e1f1634699'];

  for (const clientId of clientIds) {
    try {
      const res = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${clientId}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Data, type: 'base64' })
      });
      const json = await res.json();
      if (json.success && json.data?.link) {
        return json.data.link.replace('http://', 'https://');
      }
    } catch (err) {
      console.warn(`Imgur ${clientId} falhou:`, err.message);
    }
  }

  return null;
}

// API: Listar todos os kits e config
app.get('/api/kits', (req, res) => {
  const kits = getKits();
  const config = getConfig();
  res.json({ kits, config });
});

// API: Obter configurações
app.get('/api/config', (req, res) => {
  res.json(getConfig());
});

// API: Salvar configurações
app.post('/api/config', (req, res) => {
  const { baseUrl, whatsappNumber, whatsappDisplay, storeName } = req.body;
  const config = getConfig();
  if (baseUrl !== undefined) config.baseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : '';
  if (whatsappNumber !== undefined) config.whatsappNumber = whatsappNumber.replace(/\D/g, '');
  if (whatsappDisplay !== undefined) config.whatsappDisplay = whatsappDisplay;
  if (storeName !== undefined) config.storeName = storeName;
  saveConfig(config);
  res.json({ success: true, config });
});

// API: Upload de imagem
app.post('/api/upload-image', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Salva localmente em public/uploads para garantia
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileName = `kit-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
    fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
    const localUrl = `/uploads/${fileName}`;

    // 2. Tenta upload em nuvem pública (Imgur) para que o robô do WhatsApp consiga buscar
    let cloudUrl = null;
    try {
      cloudUrl = await uploadToCloud(buffer);
    } catch (e) {
      console.log('Upload em nuvem Imgur falhou, usando local:', e.message);
    }

    res.json({
      success: true,
      url: cloudUrl || localUrl,
      localUrl: localUrl,
      isCloud: !!cloudUrl
    });
  } catch (err) {
    console.error('Erro no upload de imagem:', err);
    res.status(500).json({ error: 'Erro ao processar imagem: ' + err.message });
  }
});

// API: Criar ou Editar kit
app.post('/api/kits', async (req, res) => {
  try {
    const { id, nome, precoAncoragem, precoReal, itens, bannerUrl, imageBase64, descricao, whatsappMsg } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'O nome do kit é obrigatório' });
    }

    const kits = getKits();
    let finalBannerUrl = bannerUrl || '/assets/banner-churrasco-prime.jpg';

    // Upload se houver imagem em Base64
    if (imageBase64) {
      try {
        const base64Data = imageBase64.includes('base64,')
          ? imageBase64.split('base64,')[1]
          : imageBase64;
        const buffer = Buffer.from(base64Data, 'base64');
        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `kit-${Date.now()}.jpg`;
        fs.writeFileSync(path.join(uploadsDir, fileName), buffer);
        finalBannerUrl = `/uploads/${fileName}`;

        // Tentar Imgur
        const cloud = await uploadToCloud(buffer);
        if (cloud) finalBannerUrl = cloud;
      } catch (err) {
        console.error('Erro ao salvar imagem:', err);
      }
    }

    // Filtrar itens (máximo 8 itens)
    let processedItens = [];
    if (Array.isArray(itens)) {
      processedItens = itens.map(i => String(i).trim()).filter(i => i.length > 0).slice(0, 8);
    }

    // Se é edição de um kit existente
    if (id) {
      const idx = kits.findIndex(k => String(k.id) === String(id));
      if (idx !== -1) {
        kits[idx] = {
          ...kits[idx],
          nome: nome.trim(),
          precoAncoragem: precoAncoragem || '0,00',
          precoReal: precoReal || '0,00',
          bannerUrl: finalBannerUrl,
          itens: processedItens,
          descricao: descricao || '',
          whatsappMsg: whatsappMsg || ''
        };
        saveKits(kits);
        return res.json({ success: true, kit: kits[idx], updated: true });
      }
    }

    // Novo Kit
    let baseSlug = generateSlug(nome);
    let count = 1;
    let finalSlug = baseSlug;
    while (kits.some(k => k.slug === finalSlug)) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const newKit = {
      id: Date.now().toString(),
      slug: finalSlug,
      nome: nome.trim(),
      precoAncoragem: precoAncoragem || '0,00',
      precoReal: precoReal || '0,00',
      bannerUrl: finalBannerUrl,
      itens: processedItens,
      descricao: descricao || 'Kit completo para seu churrasco perfeito com carnes nobres e acompanhamentos.',
      whatsappMsg: whatsappMsg || `Olá ChurrasBoom! Quero pedir o *${nome.trim()}* por *R$ ${precoReal}*.`
    };

    kits.unshift(newKit);
    saveKits(kits);

    res.json({ success: true, kit: newKit });
  } catch (err) {
    console.error('Erro ao salvar kit:', err);
    res.status(500).json({ error: 'Erro interno ao salvar kit: ' + err.message });
  }
});

// API: Deletar kit
app.delete('/api/kits/:id', (req, res) => {
  let kits = getKits();
  kits = kits.filter(k => String(k.id) !== String(req.params.id));
  saveKits(kits);
  res.json({ success: true });
});

// Rota Cloud Dinâmica (/c) - Funciona com parâmetros de query string sem depender de banco
app.get('/c', (req, res) => {
  const { n, nome, de, por, i, img, items, d, desc, msg } = req.query;

  const kitNome = n || nome || 'Kit Churrasco ChurrasBoom';
  const kitDe = de || '0,00';
  const kitPor = por || '0,00';
  const banner = i || img || '/assets/banner-churrasco-prime.jpg';

  let kitItens = [];
  if (items) {
    kitItens = decodeURIComponent(items).split('|').map(x => x.trim()).filter(Boolean).slice(0, 8);
  }

  const config = getConfig();
  const host = config.baseUrl || `${req.protocol}://${req.get('host')}`;

  const kit = {
    nome: kitNome,
    precoAncoragem: kitDe,
    precoReal: kitPor,
    bannerUrl: banner,
    itens: kitItens.length > 0 ? kitItens : [
      'Picanha Bovina Angus Selecionada',
      'Linguiça Toscana Especial',
      'Pão de Alho Crocante',
      'Farofa da Casa'
    ],
    descricao: d || desc || '',
    whatsappMsg: msg || `Olá ChurrasBoom! Vi a promoção e quero pedir o *${kitNome}* por *R$ ${kitPor}*!`
  };

  const html = generateKitPage(kit, host, config);
  res.send(html);
});

// Rota Slug do Kit (/k/:slug ou /:slug)
app.get(['/k/:slug', '/:slug'], (req, res, next) => {
  const slug = req.params.slug;
  if (['api', 'assets', 'uploads', 'c'].includes(slug)) {
    return next();
  }

  const kits = getKits();
  const kit = kits.find(k => k.slug === slug);

  if (!kit) {
    return next();
  }

  const config = getConfig();
  const host = config.baseUrl || `${req.protocol}://${req.get('host')}`;
  const html = generateKitPage(kit, host, config);
  res.send(html);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🥩 ChurrasBoom - Gerador de Links para WhatsApp`);
    console.log(`🔥 Painel Administrativo rodando em: http://localhost:${PORT}`);
    console.log(`📱 WhatsApp da Loja configurado: ${getConfig().whatsappDisplay}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
