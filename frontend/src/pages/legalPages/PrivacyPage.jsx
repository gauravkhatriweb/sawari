import React from 'react'
import { Link } from 'react-router-dom'

const PrivacyPage = () => {
  return (
    <div className='relative min-h-screen w-full bg-[#1A1A1A] text-white overflow-hidden'>
      {/* Ambient gradient orbs */}
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#4DA6FF] via-[#EFBFFF] to-[#FFD65C] blur-3xl opacity-30' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#7CE7E1] via-[#4DA6FF] to-[#EFBFFF] blur-3xl opacity-25' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12 sm:py-16'>
        <header className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight'>Sawari.pk – Privacy Policy</h1>
          <p className='mt-2 text-sm text-gray-300'>Last Updated: {new Date().toLocaleDateString()}</p>
        </header>

        <article className='prose prose-invert max-w-none'>
          <section className='rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.35)]'>
            <p className='text-sm text-gray-300'>
              At Sawari.pk, we value your trust and are committed to protecting your personal data in accordance with the laws of Pakistan, including the Prevention of Electronic Crimes Act 2016 (PECA), the Electronic Transactions Ordinance 2002, and applicable principles of Contract Law. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, whether as a passenger, captain (driver), delivery partner, or investor.
            </p>

            <ol className='mt-6 space-y-6 list-decimal pl-5'>
              <li>
                <h2 className='text-lg font-semibold mb-1'>Information We Collect</h2>
                <p className='text-sm text-gray-300'>We may collect the following types of personal and non-personal data when you register or use Sawari.pk services:</p>
                <ul className='mt-2 list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li><span className='font-medium'>Personal Identification Information:</span> Name, CNIC, phone number, email address, residential address, profile photo.</li>
                  <li><span className='font-medium'>Authentication Data:</span> CNIC verification, driving license copies (for captains), and biometric verification where required.</li>
                  <li><span className='font-medium'>Payment & Billing Information:</span> Bank details, credit/debit card numbers, mobile wallet accounts, and transaction history.</li>
                  <li><span className='font-medium'>Geolocation Data:</span> Real-time GPS location for pick-up, drop-off, and service optimization.</li>
                  <li><span className='font-medium'>Device & Log Data:</span> IP address, device type, operating system, and browsing activity on Sawari.pk.</li>
                </ul>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Use of Information</h2>
                <p className='text-sm text-gray-300'>We process your information strictly for lawful purposes under Pakistani law, including:</p>
                <ul className='mt-2 list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li>To provide, manage, and improve our ride-hailing and delivery services.</li>
                  <li>To verify identity and ensure passenger and driver safety.</li>
                  <li>To process payments, refunds, and promotions.</li>
                  <li>To comply with requests from law enforcement agencies under PECA 2016.</li>
                  <li>To send notifications, service updates, or promotional offers (with opt-out rights).</li>
                </ul>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Data Sharing & Disclosure</h2>
                <p className='text-sm text-gray-300'>Sawari.pk shall not sell, rent, or trade your data to third parties. However, we may disclose information in the following cases:</p>
                <ul className='mt-2 list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li><span className='font-medium'>To Service Providers:</span> Payment gateways, verification partners, and SMS/email service providers, under binding confidentiality agreements.</li>
                  <li><span className='font-medium'>To Law Enforcement:</span> As required under Pakistani laws, including court orders, investigation requests, or regulatory requirements.</li>
                  <li><span className='font-medium'>For Safety & Security:</span> In emergency situations to protect the rights, property, or safety of passengers, captains, or the public.</li>
                </ul>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Data Retention & Storage</h2>
                <ul className='list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li>Passenger and captain data will be retained for as long as you maintain an active account or as required under Pakistani tax and regulatory laws.</li>
                  <li>Data may be stored on secure local and international servers, subject to data protection safeguards.</li>
                  <li>Inactive accounts may be deleted or anonymized after 3 years.</li>
                </ul>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>User Rights</h2>
                <p className='text-sm text-gray-300'>As per Pakistani contract and consumer protection law, you have the following rights:</p>
                <ul className='mt-2 list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li>Right to access your personal data upon written request.</li>
                  <li>Right to request correction of inaccurate or incomplete information.</li>
                  <li>Right to withdraw consent and request deletion of data (subject to regulatory requirements).</li>
                  <li>Right to opt-out of marketing communications.</li>
                </ul>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Security Measures</h2>
                <ul className='list-disc pl-5 text-sm text-gray-300 space-y-1'>
                  <li>End-to-end encryption of personal and payment data.</li>
                  <li>Regular audits and compliance checks under SECP and PECA guidelines.</li>
                  <li>Restricted employee access on a need-to-know basis.</li>
                  <li>Multi-factor authentication for captains and fleet operators.</li>
                </ul>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Children’s Privacy</h2>
                <p className='text-sm text-gray-300'>Our services are not intended for individuals under the age of 18 years. We do not knowingly collect data from minors without verified parental/guardian consent.</p>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>International Data Transfers</h2>
                <p className='text-sm text-gray-300'>Where data is stored or processed outside Pakistan, we ensure compliance with applicable laws through contractual safeguards, ensuring your data receives the same level of protection.</p>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Updates to Privacy Policy</h2>
                <p className='text-sm text-gray-300'>Sawari.pk reserves the right to amend or update this Privacy Policy in line with new laws, business practices, or regulatory requirements. Users will be notified via email or app notification of material changes.</p>
              </li>

              <li>
                <h2 className='text-lg font-semibold mb-1'>Contact Information</h2>
                <p className='text-sm text-gray-300'>If you have any questions, concerns, or complaints regarding this Privacy Policy or our data practices, please contact us at:</p>
                <ul className='mt-2 text-sm text-gray-300 space-y-1'>
                  <li>📩 Email: legal@sawari.pk</li>
                  <li>📞 Support Helpline: +92-21-12345678</li>
                  <li>📍 Head Office: 5th Floor, Tech Park, Sharah-e-Faisal, Karachi</li>
                </ul>
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
        </article>
      </main>
    </div>
  )
}

export default PrivacyPage


