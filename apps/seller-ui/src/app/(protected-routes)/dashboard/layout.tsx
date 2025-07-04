import React from 'react'
import SidebarWrapper from './_components/sidebar/sidebar-wrapper'

const DashboardLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className='min-h-dvh flex w-full bg-black'>
        {/* Sidebar */}
        <aside className='w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800 text-white p-4 '>
            <div className='sticky top-0'>
                <SidebarWrapper />
            </div>
        </aside>

        {/* Main content area */}
        <main className='flex-1 text-white'>
       <div className={`overflow-auto`}>
       {children}
       </div>
        </main>
    </div>
  )
}

export default DashboardLayout
