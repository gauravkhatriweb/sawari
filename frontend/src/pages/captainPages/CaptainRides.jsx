import React, { useState } from 'react'
import { motion } from 'framer-motion'
import CaptainBottomNav from '../../captain/components/CaptainBottomNav'
import GlassCard from '../../components/GlassCard'
import { formatPKRDisplay } from '../../utils/currency'

const CaptainRides = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchDate, setSearchDate] = useState('')

  // Dummy ride data
  const ridesData = [
    {
      id: 'RID001',
      date: '2024-01-15',
      time: '14:30',
      pickup: 'Gulberg III, Lahore',
      dropoff: 'DHA Phase 5, Lahore',
      fare: 450,
      status: 'completed',
      duration: '25 min',
      distance: '8.5 km'
    },
    {
      id: 'RID002',
      date: '2024-01-15',
      time: '13:15',
      pickup: 'Model Town, Lahore',
      dropoff: 'Liberty Market, Gulberg',
      fare: 320,
      status: 'completed',
      duration: '18 min',
      distance: '6.2 km'
    },
    {
      id: 'RID003',
      date: '2024-01-15',
      time: '12:00',
      pickup: 'Johar Town, Lahore',
      dropoff: 'Mall Road, Lahore',
      fare: 280,
      status: 'cancelled',
      duration: '0 min',
      distance: '0 km'
    },
    {
      id: 'RID004',
      date: '2024-01-15',
      time: '11:30',
      pickup: 'Cantt Station, Lahore',
      dropoff: 'Fortress Stadium, Lahore',
      fare: 380,
      status: 'completed',
      duration: '22 min',
      distance: '7.8 km'
    },
    {
      id: 'RID005',
      date: '2024-01-14',
      time: '19:45',
      pickup: 'Emporium Mall, Johar Town',
      dropoff: 'Packages Mall, Walton',
      fare: 420,
      status: 'completed',
      duration: '28 min',
      distance: '9.1 km'
    },
    {
      id: 'RID006',
      date: '2024-01-14',
      time: '18:20',
      pickup: 'University of Punjab',
      dropoff: 'Anarkali Bazaar',
      fare: 350,
      status: 'completed',
      duration: '20 min',
      distance: '6.8 km'
    },
    {
      id: 'RID007',
      date: '2024-01-14',
      time: '17:00',
      pickup: 'Ferozepur Road',
      dropoff: 'MM Alam Road, Gulberg',
      fare: 390,
      status: 'cancelled',
      duration: '0 min',
      distance: '0 km'
    },
    {
      id: 'RID008',
      date: '2024-01-14',
      time: '16:15',
      pickup: 'Thokar Niaz Baig',
      dropoff: 'Kalma Chowk',
      fare: 310,
      status: 'completed',
      duration: '15 min',
      distance: '5.2 km'
    },
    {
      id: 'RID009',
      date: '2024-01-13',
      time: '20:30',
      pickup: 'Allama Iqbal Airport',
      dropoff: 'DHA Phase 6',
      fare: 650,
      status: 'ongoing',
      duration: '35 min',
      distance: '12.3 km'
    },
    {
      id: 'RID010',
      date: '2024-01-13',
      time: '15:45',
      pickup: 'Shadman Colony',
      dropoff: 'Canal Road',
      fare: 250,
      status: 'completed',
      duration: '12 min',
      distance: '4.1 km'
    }
  ]

  // Filter and search logic
  const filteredRides = useMemo(() => {
    let filtered = ridesData

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(ride => ride.status === activeFilter)
    }

    // Filter by date
    if (searchDate) {
      filtered = filtered.filter(ride => ride.date === searchDate)
    }

    // Sort by date and time (newest first)
    return filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`)
      const dateTimeB = new Date(`${b.date} ${b.time}`)
      return dateTimeB - dateTimeA
    })
  }, [activeFilter, searchDate])

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Completed'
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Cancelled'
      },
      ongoing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Ongoing'
      }
    }

    const config = statusConfig[status] || statusConfig.completed

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  // Ride card component
  const RideCard = ({ ride }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="p-4 mb-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex flex-col space-y-3">
          {/* Header with ID and Status */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-theme-secondary">#{ride.id}</span>
              <span className="text-xs text-theme-secondary">•</span>
              <span className="text-sm text-theme-secondary">{ride.date} at {ride.time}</span>
            </div>
            <StatusBadge status={ride.status} />
          </div>

          {/* Route Information */}
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-6 bg-theme-secondary bg-opacity-30 my-1"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-medium">From</p>
                  <p className="text-sm text-theme-secondary">{ride.pickup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">To</p>
                  <p className="text-sm text-theme-secondary">{ride.dropoff}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="flex justify-between items-center pt-2 border-t border-theme-secondary border-opacity-20">
            <div className="flex space-x-4 text-sm text-theme-secondary">
              <span>{ride.distance}</span>
              <span>•</span>
              <span>{ride.duration}</span>
            </div>
            <div className="text-lg font-bold text-theme-accent">
              {formatPKRDisplay(ride.fare)}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">🚗</div>
          <h2 className="text-xl font-semibold mb-3">No rides found</h2>
          <p className="text-theme-secondary mb-6">
            {activeFilter === 'all' 
              ? "Your ride history will appear here once you start accepting rides."
              : `No ${activeFilter} rides found for the selected criteria.`
            }
          </p>
          <button className="bg-theme-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200">
            Go Online
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )

  // Filter tabs data
  const filterTabs = [
    { id: 'all', label: 'All', count: ridesData.length },
    { id: 'completed', label: 'Completed', count: ridesData.filter(r => r.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: ridesData.filter(r => r.status === 'cancelled').length },
    { id: 'ongoing', label: 'Ongoing', count: ridesData.filter(r => r.status === 'ongoing').length }
  ]

  return (
    <div className="min-h-screen bg-theme-base text-theme-primary">
      <div className="container mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-['Poppins',sans-serif]">
            My Rides
          </h1>
          <div className="text-sm text-theme-secondary">
            {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-4 mb-6">
          {/* Date Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Search by Date</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full p-3 rounded-lg bg-theme-secondary bg-opacity-20 border border-transparent focus:border-theme-accent focus:outline-none transition-colors"
              placeholder="Select date"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-theme-secondary bg-opacity-20 rounded-lg p-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-all duration-200 text-sm ${
                  activeFilter === tab.id
                    ? 'bg-theme-accent text-white shadow-md'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-1 text-xs ${
                  activeFilter === tab.id ? 'text-white text-opacity-80' : 'text-theme-secondary'
                }`}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Clear Filters */}
        {(activeFilter !== 'all' || searchDate) && (
          <div className="mb-4">
            <button
              onClick={() => {
                setActiveFilter('all')
                setSearchDate('')
              }}
              className="text-sm text-theme-accent hover:text-theme-accent-dark transition-colors flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear all filters</span>
            </button>
          </div>
        )}

        {/* Rides List */}
        <div className="space-y-0">
          {filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      <CaptainBottomNav />
    </div>
  )
}

export default CaptainRides