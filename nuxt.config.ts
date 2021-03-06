import { api } from './plugins/cms'

const createFeed = async (feed: any, extension: string) => {
  const {
    data: { data: articles }
  } = await api.get('articles')

  const filteredArticles = articles
    .filter(article => article.status === 'published')
    .sort((a, b) => {
      a = new Date(a.date)
      b = new Date(b.date)
      return a > b ? 1 : a < b ? -1 : 0
    })

  feed.options = {
    title: 'Simon Wuyts - Articles',
    link: `https://www.simonwuyts.com/articles/feed.${extension}`
  }

  filteredArticles.forEach(article => {
    feed.addItem({
      title: article.title,
      id: article.slug,
      date: new Date(article.date),
      link: `https://www.simonwuyts.com/articles/${article.slug}`,
      description: article.introduction,
      content: article.content
    })
  })

  feed.addContributor({
    name: 'Simon Wuyts',
    email: 'hi@simonwuyts.com',
    link: 'https://www.simonwuyts.com/'
  })
}

const getDynamicRoutes = async () => {
  const {
    data: { data: articles }
  } = await api.get('articles')
  const {
    data: { data: cases }
  } = await api.get('cases')
  const articleRoutes = articles
    .filter(article => article.status === 'published')
    .map(article => `/articles/${article.slug}`)
  const caseRoutes = cases
    .filter(item => item.status === 'published')
    .map(item => `/work/${item.slug}`)
  return [...articleRoutes, ...caseRoutes]
}

export default {
  mode: 'universal',

  head: {
    titleTemplate: '%s - Simon Wuyts',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Interaction designer and front-end developer. Dreams in HTML, CSS and Javascript, lives in Ghent, Belgium. Helps other people build digital products.'
      },
      {
        property: 'og:type',
        content: 'website'
      },
      {
        hid: 'ogtitle',
        property: 'og:title',
        content: 'Simon Wuyts - Interaction Designer & Front-end Developer'
      },
      {
        hid: 'ogimage',
        property: 'og:image',
        content: 'https://www.simonwuyts.com/images/share.png'
      },
      {
        hid: 'ogdescription',
        property: 'og:description',
        content: 'I help other people build digital products.'
      },
      {
        property: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        hid: 'twitterimage',
        property: 'twitter:image',
        content: 'https://www.simonwuyts.com/images/share.png'
      },
      {
        hid: 'twittertitle',
        property: 'twitter:title',
        content: 'Simon Wuyts - Interaction Designer & Front-end Developer'
      }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'https://rsms.me/inter/inter.css'
      },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        href: 'https://www.simonwuyts.com/articles/feed.xml',
        title: 'Simon Wuyts - Interaction Designer & Front-end Developer'
      },
      {
        rel: 'alternate',
        type: 'application/json',
        href: 'https://www.simonwuyts.com/articles/feed.json',
        title: 'Simon Wuyts - Interaction Designer & Front-end Developer'
      }
    ]
  },

  loading: { color: '#fff' },
  css: ['@/assets/scss/main.scss'],

  plugins: ['@/plugins/composition-api'],
  modules: [
    'nuxt-payload-extractor',
    ['nuxt-matomo', { matomoUrl: '//analytics.simonwuyts.eu/', siteId: 1 }],
    ['@nuxtjs/feed'],
    'nuxt-svg-loader',
    '@nuxtjs/sitemap'
  ],
  buildModules: ['@nuxt/typescript-build'],

  build: {
    extractCSS: true,
    babel: {
      plugins: [
        [
          'prismjs',
          {
            languages: ['javascript', 'css', 'markup', 'swift'],
            css: false
          }
        ]
      ]
    }
  },

  svgLoader: {
    svgoConfig: {
      plugins: [{ prefixIds: false }]
    }
  },

  feed: [
    {
      path: '/articles/feed.xml',
      async create(feed) {
        await createFeed(feed, 'xml')
      },
      cacheTime: 1000 * 60 * 15,
      type: 'rss2'
    },
    {
      path: '/articles/feed.json',
      async create(feed) {
        await createFeed(feed, 'json')
      },
      cacheTime: 1000 * 60 * 15,
      type: 'json1'
    }
  ],

  generate: {
    async routes() {
      return await getDynamicRoutes()
    }
  },

  sitemap: {
    hostname: 'https://www.simonwuyts.com',
    async routes() {
      return await getDynamicRoutes()
    }
  }
}
