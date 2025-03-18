
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Resurvey Notices',
  tagline: 'Resurvey project notices generation made easy',
  favicon: 'img/favicon.ico',
  url: 'https://lokeshmetta.github.io',
  baseUrl: '/ground-truth-generator/',
  organizationName: 'lokeshmetta',
  projectName: 'ground-truth-generator',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, provide a locale here
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      navbar: {
        title: 'Resurvey Notices',
        logo: {
          alt: 'Resurvey Notices Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/',
            label: 'Home',
            position: 'left',
          },
          {
            to: '/groundtruthingnotice',
            label: 'Ground Truthing Notice',
            position: 'left',
          },
          {
            href: 'https://github.com/lokeshmetta/ground-truth-generator',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Telegram',
                href: 'https://t.me/surveyor_stories',
              },
              {
                label: 'YouTube',
                href: 'https://youtube.com/@surveyorstories',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/surveyorstories',
              },
            ],
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Surveyor Stories. Built with Docusaurus.`,
      },
    }),
};

module.exports = config;
