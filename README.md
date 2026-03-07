# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## 🔎 Content search tuning

`POST /api/content-search` supports locale-aware search and can be tuned for production performance via environment variables.

### Recommended production defaults

```env
CONTENT_SEARCH_DATA_CACHE_TTL_MS=300000
CONTENT_SEARCH_CONCURRENCY=1
CONTENT_SEARCH_UID_TIMEOUT_MS=3000
CONTENT_SEARCH_SINGLE_TYPE_UID_TIMEOUT_MS=6000
CONTENT_SEARCH_MAX_ITEMS=1000
CONTENT_SEARCH_POPULATE_DEPTH=4
CONTENT_SEARCH_SINGLE_TYPE_POPULATE_DEPTH=8
```

### Variable reference

- `CONTENT_SEARCH_DATA_CACHE_TTL_MS`: TTL for in-memory precomputed searchable dataset per locale. Higher values reduce DB load and improve repeated query latency.
- `CONTENT_SEARCH_CONCURRENCY`: Number of content types scanned in parallel. Keep `1` unless DB pool headroom is confirmed.
- `CONTENT_SEARCH_UID_TIMEOUT_MS`: Per-collection-type fetch timeout (ms).
- `CONTENT_SEARCH_SINGLE_TYPE_UID_TIMEOUT_MS`: Per-single-type fetch timeout (ms).
- `CONTENT_SEARCH_MAX_ITEMS`: Max collection records loaded per type during scan.
- `CONTENT_SEARCH_POPULATE_DEPTH`: Populate depth for collection types.
- `CONTENT_SEARCH_SINGLE_TYPE_POPULATE_DEPTH`: Populate depth for single types (used for deeply nested page content).

### Request example

```json
{
	"word": "Աշոտ",
	"locale": "hy"
}
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
