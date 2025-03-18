
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaTelegram, FaYoutube, FaGithub } from 'react-icons/fa';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="header">
      <div className="container margin-vert--xl">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Resurvey project notices generation made easy">
      <HomepageHeader />
      <main className="container margin-vert--lg">
        <section className="text--center margin-vert--xl">
          <div>
            <p className="text--gray margin-bottom--md">
              This is the home page of the Notice Generation project, featuring
              Ground Truthing Notice Generation and Ground Validation Notice
              Generation for Resurvey.
            </p>
            <Link
              to="/groundtruthingnotice"
              className="button button--primary button--lg margin-bottom--md">
              Go to Ground Truthing Notice Generation
            </Link>
          </div>

          <div className="text--center margin-top--xl">
            <h3 className="text--bold margin--md">Connect With Us</h3>
            <div className="flex justify--center margin-bottom--md" style={{display: 'flex', justifyContent: 'center', gap: '2rem'}}>
              <a
                href="https://t.me/surveyor_stories"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link-item"
                style={{fontSize: '1.5rem'}}
              >
                <FaTelegram />
              </a>
              <a
                href="https://youtube.com/@surveyorstories"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link-item"
                style={{fontSize: '1.5rem'}}
              >
                <FaYoutube />
              </a>
              <a
                href="https://github.com/surveyorstories"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link-item"
                style={{fontSize: '1.5rem'}}
              >
                <FaGithub />
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
