import React from 'react'
import { Link } from 'react-router-dom'

const TermsPage = () => {
  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12 sm:py-16'>
        <header className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight'>Sawari.pk – Terms & Conditions</h1>
          <p className='mt-2 text-sm text-gray-300'>Please read these terms carefully before using our Services.</p>
        </header>

        <article className='prose prose-invert max-w-none'>
          <section className='rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <ol className='space-y-6 list-decimal pl-5'>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Introduction</h2>
                <p className='text-sm text-gray-300'>
                Welcome to Sawari.pk. These Terms and Conditions govern your access to and use of the Sawari.pk mobile application, website, and all related services, collectively referred to as the Services. By registering for, accessing, or using our Services, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms. These Terms constitute a valid, binding, and enforceable contract under the Contract Act 1872, the Electronic Transactions Ordinance 2002, and all other applicable laws, rules, and regulations of Pakistan. If you do not agree to these Terms, you must refrain from using the Services immediately.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Eligibility & Registration</h2>
                <p className='text-sm text-gray-300'>
                  To use Sawari.pk, you must be at least 18 years of age, possess legal capacity under Pakistani law, and provide accurate registration details. By creating an account, you warrant that the information provided is true, complete, and not misleading. Sawari.pk reserves the right to verify user identity and decline or terminate accounts where false information is detected.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>User Responsibilities</h2>
                <p className='text-sm text-gray-300'>
                  Users (Passengers, Captains, and Fleet Owners) agree to:
                </p>
                <ul className='mt-2 list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li>Provide accurate personal and payment information.</li>
                  <li>Comply with all traffic laws, road safety regulations, and licensing requirements in Pakistan.</li>
                  <li>Avoid using the Platform for unlawful, fraudulent, or unauthorized activities.</li>
                  <li>Treat all other users with respect, ensuring safety, dignity, and non-discrimination, in line with the Constitution of Pakistan and the Punjab Consumer Protection Act, 2005 (or equivalent provincial laws).</li>
                </ul>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Safety & Conduct</h2>
                <p className='text-sm text-gray-300'>
                  Sawari.pk prioritizes the safety of its passengers and captains. Any act of harassment, misconduct, intoxication, or breach of public decency under Pakistani Penal Code (PPC) will result in suspension or permanent removal from the Platform. The Company reserves the right to cooperate with law enforcement agencies where criminal activities are suspected.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Payment & Pricing</h2>
                <p className='text-sm text-gray-300'>
                  All fares are calculated as per the algorithm shown at the time of booking. Users agree to timely payment through approved methods (cash, debit/credit card, digital wallets, etc.). Any default in payment may be pursued under civil and commercial laws of Pakistan, including but not limited to recovery suits.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Liability & Disclaimer</h2>
                <p className='text-sm text-gray-300'>
                  Sawari.pk acts solely as a technology platform connecting passengers with captains. The Company is not a transportation provider and does not own vehicles used by captains. Accordingly, Sawari.pk is not liable for personal injury, property damage, accidents, or delays except where caused by gross negligence or willful misconduct on its part. Users acknowledge that journeys are undertaken at their own risk.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Data Protection & Privacy</h2>
                <p className='text-sm text-gray-300'>
                  Sawari.pk respects user privacy in accordance with the Personal Data Protection Bill, 2023 (pending enactment) and the Prevention of Electronic Crimes Act, 2016 (PECA). User information shall only be used for providing services, improving safety, and complying with lawful requests by authorities.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Termination of Services</h2>
                <p className='text-sm text-gray-300'>
                  Sawari.pk may suspend or terminate accounts without prior notice if a user breaches these Terms, engages in unlawful conduct, or harms the reputation and integrity of the Platform. Users may voluntarily terminate their accounts by written notice or through the app.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Governing Law & Jurisdiction</h2>
                <p className='text-sm text-gray-300'>
                  These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these Terms shall fall under the exclusive jurisdiction of the courts of Karachi, Sindh, unless otherwise agreed.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Amendments</h2>
                <p className='text-sm text-gray-300'>
                  Sawari.pk reserves the right to amend these Terms at any time. Continued use of the Services after such amendments constitutes acceptance of the updated Terms. Users are advised to review these Terms periodically.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Force Majeure</h2>
                <p className='text-sm text-gray-300'>
                  Sawari.pk shall not be held liable for delays, failures, or disruptions due to causes beyond its reasonable control, including but not limited to natural disasters, strikes, government restrictions, or technical outages.
                </p>
              </li>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Acceptance</h2>
                <p className='text-sm text-gray-300'>
                  By registering or using Sawari.pk, you acknowledge that you have read, understood, and agreed to these Terms, thereby creating a legally binding agreement under Pakistani law.
                </p>
              </li>
            </ol>
          </section>

          <div className='mt-8 flex items-center justify-center'>
            <Link
              to='/'
              className='inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white ring-1 ring-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.35)] hover:scale-[1.01] transition'
            >
              Back to Home
            </Link>
          </div>

          <footer className='mt-6 text-xs text-gray-400'>
            Last updated: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </main>
    </div>
  )
}

export default TermsPage
