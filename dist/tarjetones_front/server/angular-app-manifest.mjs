
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/tarjetones"
  },
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2268, hash: '7c53f0492f536ac8426643d589eb66a3c7b7b304dfa1d288e22b75ccd3d41956', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1165, hash: '513492a1ba2a4de19b3c62c71e6d0b8930b8c662ef22e8246af7ab347f2064e3', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'tarjetones/index.html': {size: 2463, hash: '464fc9aa19b21c6fc046c7fd53febefbea8a591dd80c9f897262e6ed2a5f5a4b', text: () => import('./assets-chunks/tarjetones_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 13619, hash: 'ad2885d14eed53dd72699883a41f157b4a2ae891ce1faea382448dcaf5705149', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-HOZWRADD.css': {size: 16326, hash: '4FxiHFaMeAg', text: () => import('./assets-chunks/styles-HOZWRADD_css.mjs').then(m => m.default)}
  },
};
