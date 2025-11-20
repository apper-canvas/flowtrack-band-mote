import { Outlet } from "react-router-dom";
import { useAuth } from "@/layouts/Root";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";

function Layout() {
  const { logout } = useAuth()
  const { user, isAuthenticated } = useSelector(state => state.user)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Logout Button */}
      {isAuthenticated && (
        <motion.header 
          className="bg-white shadow-sm border-b border-slate-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckSquare" className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">FlowTrack</h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="text-sm text-slate-600">
                    Welcome, {user.firstName || user.emailAddress}
                  </div>
                )}
                <motion.button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ApperIcon name="LogOut" className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>
      )}
      
      {/* Main Content */}
      <Outlet />
    </div>
  )
}
export default Layout;