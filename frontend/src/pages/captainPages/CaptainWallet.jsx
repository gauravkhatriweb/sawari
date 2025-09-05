import React from 'react'
import CaptainBottomNav from '../../captain/components/CaptainBottomNav'
import GlassCard from '../../components/GlassCard'
import { formatPKRDisplay } from '../../utils/currency'

const CaptainWallet = () => {
  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      <div className="container mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold mb-6 font-['Poppins',sans-serif]">
          Wallet
        </h1>
        
        <GlassCard className="p-6 mb-6">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-3xl font-bold mb-2">{formatPKRDisplay(0)}</h2>
            <p className="text-theme-secondary">Current Balance</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-theme-secondary">
              Your transaction history will appear here.
            </p>
          </div>
        </GlassCard>
      </div>
      
      <CaptainBottomNav />
    </div>
  )
}

export default CaptainWallet