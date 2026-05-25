/* MEMO OS - Notion API Client (proxies via /api/notion serverless function) */
(function() {
  const params = new URLSearchParams(window.location.search);
  const proxyUrl = params.get('api') || localStorage.getItem('memoOS.apiUrl') || '';
  const enabled = !!proxyUrl;

  async function request(path, body) {
    if (!enabled) return null;
    const res = await fetch(proxyUrl.replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  }

  window.MemoOSAPI = {
    enabled,
    async listMemos() {
      return await request('/list', {});
    },
    async createMemo(memo) {
      return await request('/create', { memo });
    },
    async updateMemo(id, patch) {
      return await request('/update', { id, patch });
    },
    async deleteMemo(id) {
      return await request('/delete', { id });
    }
  };
})();
