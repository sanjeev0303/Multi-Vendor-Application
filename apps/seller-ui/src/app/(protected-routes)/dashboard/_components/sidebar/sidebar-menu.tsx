import React from 'react'

const SidebarMenu = ({title, children}: {title: string, children: React.ReactNode}) => {
  return (
    <div className='block'>
        <h3 className='text-xs tracking-[0.04rem] pl-1'>{title}</h3>
        {children}
    </div>
  )
}

export default SidebarMenu
