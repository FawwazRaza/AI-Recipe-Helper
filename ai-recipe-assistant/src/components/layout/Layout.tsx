import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main id="main-content" className="flex-1 container mx-auto px-4 py-6" role="main" tabIndex={-1} aria-label="Main content">{children}</main>
    <Footer />
  </div>
);

export default Layout; 