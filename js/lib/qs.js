// Query-string helpers for passing record ids between static HTML pages
// (e.g. load.html?id=xyz) since there's no framework router.

export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function buildUrl(path, params = {}) {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") usp.set(key, value);
  }
  const query = usp.toString();
  return query ? `${path}?${query}` : path;
}

export function goTo(path, params = {}) {
  window.location.href = buildUrl(path, params);
}
