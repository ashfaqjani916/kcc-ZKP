'use client'

import { motion } from 'framer-motion'
import WalletConnect from '@/components/WalletConnect'
import CheckCredential from '@/components/CheckCredential'
import LoanApplication from '@/components/LoanApplication'
import MyLoans from '@/components/MyLoans'
import UploadDocuments from '@/components/upload-docs'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  Wallet,
  Info,
  Sparkles,
  Lock,
  Zap,
  CheckCircle2,
  Upload,
  TrendingUp,
  Activity
} from 'lucide-react'

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const guidelines = [
    {
      icon: ShieldCheck,
      text: 'Valid credential issued by authority required',
      color: 'text-emerald-600',
    },
    {
      icon: Lock,
      text: 'Eligibility verified using Zero-Knowledge Proofs',
      color: 'text-blue-600',
    },
    {
      icon: Sparkles,
      text: 'Sensitive information remains private during application',
      color: 'text-purple-600',
    },
    {
      icon: Zap,
      text: 'Track your loan status in real-time',
      color: 'text-amber-600',
    },
    {
      icon: FileText,
      text: 'Submit bills for fund disbursement after loan sanction',
      color: 'text-teal-600',
    },
  ]

  const quickStats = [
    {
      label: 'Privacy Assured',
      icon: Lock,
      color: 'from-green-500 to-emerald-600',
      value: '100%'
    },
    {
      label: 'Fast Processing',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      value: '<5min'
    },
    {
      label: 'Success Rate',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      value: '95%'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-white relative overflow-hidden">

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-emerald-200/20 to-green-300/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 left-0 w-72 h-72 bg-gradient-to-tr from-teal-200/20 to-cyan-300/20 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-green-100/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-200/50 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </motion.button>
              </Link>

              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30"
                >
                  <span className="text-white text-2xl">🌾</span>
                </motion.div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                    Farmer Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-green-600/70 flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Apply for loans and track applications
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <WalletConnect />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Welcome Card */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden"
          >
            {/* Animated background pattern */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </motion.div>
                <span className="text-white/90 text-sm font-medium">Welcome to your portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Kisan Credit Card Application
              </h2>
              <p className="text-white/80 text-sm sm:text-base max-w-2xl">
                Apply for loans with complete privacy using zero-knowledge proof technology.
                Your sensitive information is never exposed.
              </p>
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"
            />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-lg text-white relative overflow-hidden group`}
                >
                  {/* Animated background */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                  />

                  <div className="relative z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      className="flex justify-center mb-3"
                    >
                      <Icon className="w-8 h-8" />
                    </motion.div>
                    <p className="text-3xl font-bold text-center mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-center opacity-90">{stat.label}</p>
                  </div>

                  {/* Shine effect */}
                  <motion.div
                    className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    initial={false}
                    whileHover={{ left: '150%' }}
                    transition={{ duration: 0.7 }}
                  />
                </motion.div>
              )
            })}
          </motion.div>

          {/* Credential Status Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-green-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Credential Verification</h3>
                  <p className="text-xs text-gray-600">Check your eligibility status</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <CheckCredential />
            </div>
          </motion.div>

          {/* Upload Documents Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Document Upload</h3>
                  <p className="text-xs text-gray-600">Upload verification documents</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <UploadDocuments />
            </div>
          </motion.div>

          {/* Loan Application Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">New Loan Application</h3>
                  <p className="text-xs text-gray-600">Apply for a new KCC loan</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <LoanApplication />
            </div>
          </motion.div>

          {/* My Loans Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Loans</h3>
                  <p className="text-xs text-gray-600">Track your loan applications</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <MyLoans />
            </div>
          </motion.div>

          {/* Guidelines Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="relative bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-green-200/50 overflow-hidden"
          >
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20"
                >
                  <Info className="w-6 h-6 text-white" />
                </motion.div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Farmer Guidelines</h3>
                  <p className="text-sm text-gray-600">Important information for loan applicants</p>
                </div>
              </div>

              <div className="space-y-4">
                {guidelines.map((guideline, index) => {
                  const Icon = guideline.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-green-100/50 transition-all duration-300 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-10 h-10 ${guideline.color} bg-gradient-to-br from-white to-gray-50 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>

                      <p className="text-sm text-gray-700 leading-relaxed pt-2 flex-1">
                        {guideline.text}
                      </p>

                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="pt-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Bottom accent line */}
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full mt-6"
              />
            </div>
          </motion.div>

          {/* Activity Indicator */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Activity className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <p className="font-bold text-gray-900">System Status</p>
                  <p className="text-xs text-gray-600">All systems operational</p>
                </div>
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-700">Online</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 mt-16 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100/50 py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Powered by{' '}
            <span className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Zero-Knowledge Proof Technology
            </span>
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
