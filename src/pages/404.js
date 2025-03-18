
import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function NotFound() {
  return (
    <Layout title="Page Not Found">
      <div className="container margin-vert--xl text--center">
        <h1 className="hero__title">404</h1>
        <p className="hero__subtitle">Oops! Page not found</p>
        <Link
          to="/"
          className="button button--primary button--lg margin-top--md">
          Return to Home
        </Link>
      </div>
    </Layout>
  );
}
