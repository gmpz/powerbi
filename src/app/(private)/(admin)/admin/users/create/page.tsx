import UserCreate from '@/components/admin/user/create-user'
import React from 'react'

const page = () => {
  return (
    <div className=" px-2 sm:px-3 lg:px-4 py-5">
          
          
    
          {/* Centered Content */}
          <div className="max-w-3xl mx-auto">
            {/* Header */}
          <div className="max-w-5xl mx-auto mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Create User Permision
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Create new user permisison and manage existing ones
            </p>
          </div>
            <div className="">
              <UserCreate />
            </div>
          </div>
    
        </div>
  )
}

export default page