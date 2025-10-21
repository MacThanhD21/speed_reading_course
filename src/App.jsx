import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import PainPoints from './components/PainPoints'
import Solution from './components/Solution'
import Timeline from './components/Timeline'
import Outcomes from './components/Outcomes'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'
import SmartReadRouter from './components/smartread/SmartReadRouter'

function HomePage() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <PainPoints />
        <Solution />
        <Timeline />
        <Outcomes />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/smartread/*" element={<SmartReadRouter />} />
      </Routes>
    </Router>
  )
}

export default App
