// Vercel Serverless Function — Notion API Proxy
// Endpoint paths handled by routing in vercel.json:
//   POST /api/list    → list memos
//   POST /api/create  → create memo
//   POST /api/update  → update memo
//   POST /api/delete  → delete memo

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DB_ID = process.env.NOTION_DB_ID;
const NOTION_VERSION = '2022-06-28';

async function notionFetch(path, options = {}) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API ${res.status}: ${text}`);
  }
  return await res.json();
}

function memoToProperties(memo) {
  const props = {
    '메모': { title: [{ text: { content: memo.text || '' } }] },
    '중요': { checkbox: !!memo.important },
    '고정': { checkbox: !!memo.pinned }
  };
  if (memo.folder && memo.folder !== 'all' && memo.folder !== '중요' && memo.folder !== '고정') {
    props['폴더'] = { select: { name: memo.folder } };
  }
  if (memo.reply) {
    props['RE'] = { rich_text: [{ text: { content: memo.reply } }] };
  }
  return props;
}

function pageToMemo(page) {
  const p = page.properties || {};
  const title = (p['메모']?.title || []).map(t => t.plain_text).join('');
  const folder = p['폴더']?.select?.name || '';
  const important = !!p['중요']?.checkbox;
  const pinned = !!p['고정']?.checkbox;
  const reply = (p['RE']?.rich_text || []).map(t => t.plain_text).join('');
  return {
    id: page.id,
    text: title,
    folder,
    important,
    pinned,
    reply,
    isTodo: false,
    checked: false,
    images: [],
    createdAt: new Date(page.created_time).getTime()
  };
}

function applyCors(res, req) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = async (req, res) => {
  if (applyCors(res, req)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!NOTION_TOKEN || !NOTION_DB_ID) {
    return res.status(500).json({
      error: 'Server not configured. Set NOTION_TOKEN and NOTION_DB_ID env vars.'
    });
  }

  try {
    const action = (req.url || '').split('/').pop().split('?')[0];
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (action === 'list') {
      const data = await notionFetch(`/databases/${NOTION_DB_ID}/query`, {
        method: 'POST',
        body: JSON.stringify({
          sorts: [{ property: '생성 시각', direction: 'descending' }],
          page_size: 100
        })
      });
      return res.status(200).json({ memos: (data.results || []).map(pageToMemo) });
    }

    if (action === 'create') {
      const memo = body.memo || {};
      const created = await notionFetch('/pages', {
        method: 'POST',
        body: JSON.stringify({
          parent: { database_id: NOTION_DB_ID },
          properties: memoToProperties(memo)
        })
      });
      return res.status(200).json({ memo: pageToMemo(created) });
    }

    if (action === 'update') {
      const { id, patch } = body;
      const updated = await notionFetch(`/pages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties: memoToProperties(patch) })
      });
      return res.status(200).json({ memo: pageToMemo(updated) });
    }

    if (action === 'delete') {
      const { id } = body;
      await notionFetch(`/pages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ archived: true })
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(404).json({ error: 'Unknown action: ' + action });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
