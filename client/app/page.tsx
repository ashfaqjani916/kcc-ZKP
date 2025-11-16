'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import WalletConnect from '@/components/WalletConnect'
import { ArrowRight, Shield, Zap, Lock, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  const roles = [
    {
      name: 'Farmer',
      description: 'Apply for KCC loans and track your applications',
      icon: '🌾',
      path: '/farmer',
      gradient: 'from-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/20',
    },
    {
      name: 'Issuer',
      description: 'Issue and manage farmer credentials',
      icon: '🏛️',
      path: '/issuer',
      gradient: 'from-green-500 to-emerald-600',
      shadowColor: 'shadow-green-500/20',
    },
    {
      name: 'Bank Officer',
      description: 'Review and sanction loan applications',
      icon: '🏦',
      path: '/bank',
      gradient: 'from-teal-500 to-cyan-600',
      shadowColor: 'shadow-teal-500/20',
    },
    {
      name: 'Auditor',
      description: 'Verify bills and disburse funds',
      icon: '📊',
      path: '/auditor',
      gradient: 'from-cyan-500 to-blue-600',
      shadowColor: 'shadow-cyan-500/20',
    },
  ]

  const features = [
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Prove eligibility without revealing sensitive personal information',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Automated verification and instant approval decisions',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Shield,
      title: 'Blockchain Secured',
      description: 'Transparent and immutable record of all transactions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ]



  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-white relative overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 -right-20 w-96 h-96 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-teal-200/30 to-cyan-300/30 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-green-100/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30">
                <span className="text-white text-xl">🌾</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                  BEST KCC
                </h1>
                <p className="text-xs text-green-600/70 hidden sm:block">Blockchain-Enabled Secure and Transparent Kisan Credit Card</p>
              </div>
            </motion.div>
            <WalletConnect />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-16 pb-12 sm:pt-20 sm:pb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200/50 text-green-700 text-sm font-medium mb-6 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Privacy-first lending protocol
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-gray-900 via-green-800 to-emerald-900 bg-clip-text text-transparent">
              Kisan Credit Card
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Loan Management
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-4"
          >
            Privacy-preserving loan verification powered by{' '}
            <span className="font-semibold text-green-700">Zero-Knowledge Proofs</span> and{' '}
            <span className="font-semibold text-green-700">blockchain technology</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8"
          >
          </motion.div>
        </motion.div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            Select Your Role
          </h3>
          <p className="text-center text-gray-600 mb-10">Choose your portal to get started</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {roles.map((role, index) => (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Link href={role.path}>
                  <div className={`relative h-full bg-gradient-to-br ${role.gradient} rounded-2xl p-6 sm:p-8 shadow-xl ${role.shadowColor} hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                    {/* Animated gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20"
                      whileHover={{ scale: 1.5, rotate: 45 }}
                      transition={{ duration: 0.6 }}
                    />

                    <div className="relative z-10">
                      <motion.div
                        className="text-6xl mb-4 inline-block"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {role.icon}
                      </motion.div>

                      <h4 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        {role.name}
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </h4>

                      <p className="text-white/90 text-sm leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    {/* Shine effect */}
                    <motion.div
                      className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      initial={false}
                      whileHover={{ left: '150%' }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="pb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Why Choose Our Platform?
            </h3>
            <p className="text-gray-600">Built with cutting-edge privacy technology</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`${feature.bgColor} ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-sm group-hover:shadow-md transition-shadow`}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.div>

                  <h4 className="font-bold text-xl text-gray-900 mb-2">
                    {feature.title}
                  </h4>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative gradient line */}
                  <motion.div
                    className={`h-1 bg-gradient-to-r ${roles[index % 4].gradient} rounded-full mt-4`}
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 + index * 0.1, duration: 0.6 }}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="relative z-10 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100/50 py-8 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 KCC Loan System · Powered by{' '}
            <span className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Zero-Knowledge Proofs
            </span>
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-green-600 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="#" className="hover:text-green-600 transition-colors">Documentation</a>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
