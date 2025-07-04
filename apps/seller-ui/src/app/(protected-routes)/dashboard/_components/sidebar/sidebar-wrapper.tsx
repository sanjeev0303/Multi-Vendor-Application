'use client';

import { useSeller } from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import { BellPlus, BellRing, CalendarPlus, Home, ListOrderedIcon, LogOut, Mail, PackageSearch, Settings, SquarePlus, TicketPercent, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Box from './box';
import SidebarItem from './sidebar-items';
import SidebarMenu from './sidebar-menu';
import { Sidebar } from './sidebar-styles';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const { seller, isError, isLoading } = useSeller();
  const pathname = usePathname();

  console.log('seller', seller);

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) => {
    return activeSidebar === route ? '#0085ff' : '#969696';
  };

  return (
    <Box
      $css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={'/'} className="flex justify-center text-center gap-2">
            <div className="flex items-center gap-2">
              <Image
                src={'/seller-icon.webp'}
                alt="logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <Box className="flex flex-col justify-start">
                <h3 className="text-xl font-medium text-[#ecedee]">
                  {seller?.shop?.name}
                </h3>

                <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                  {seller?.shop?.address}
                </h5>
              </Box>
            </div>
          </Link>
        </Box>
      </Sidebar.Header>

      <div className="block my-3 h-full ">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor('/dashboard')} />}
            isActive={activeSidebar === '/dashboard'}
            href="/dashboard"
          />

          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/orders'}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <ListOrderedIcon
                    size={26}
                    color={getIconColor('/dashboard/payments')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/payments'}
                title="Payments"
                href="/dashboard/payments"
                icon={
                  <Wallet
                    size={26}
                    color={getIconColor('/dashboard/payments')}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Products">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-product'}
                title="Create Product"
                href="/dashboard/create-product"
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor('/dashboard/create-product')}
                  />
                }
              />

              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-products'}
                title="All Products"
                href="/dashboard/all-products"
                icon={
                  <PackageSearch
                    size={24}
                    color={getIconColor('/dashboard/all-products')}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title='Evnets'>
                <SidebarItem
                isActive={activeSidebar === "/dashboard/create-event"}
                title='Create Event'
                href='/dashboard/create-event'
                icon={
                    <CalendarPlus size={24} color={getIconColor("/dashboard/create-event")} />
                }
                />

                <SidebarItem
                isActive={activeSidebar === "/dashboard/all-events"}
                title='Create Event'
                href='/dashboard/all-events'
                icon={
                    <BellPlus size={24} color={getIconColor("/dashboard/all-events")} />
                }
                />
            </SidebarMenu>

            <SidebarMenu title='Cotrollers'>
                <SidebarItem
                isActive={activeSidebar === "/dashboard/inbox"}
                title='Inbox'
                href='/dashboard/inbox'
                icon={
                    <Mail size={24} color={getIconColor("/dashboard/inbox")} />
                }
                />

                <SidebarItem
                isActive={activeSidebar === "/dashboard/settings"}
                title='Settings'
                href='/dashboard/settings'
                icon={
                    <Settings size={24} color={getIconColor("/dashboard/settings")} />
                }
                />

                <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title='Notifications'
                href='/dashboard/notifications'
                icon={
                    <BellRing size={24} color={getIconColor("/dashboard/notifications")} />
                }
                />
            </SidebarMenu>

            <SidebarMenu title='Extras'>
                 <SidebarItem
                isActive={activeSidebar === "/dashboard/discount-codes"}
                title='Discount Codes'
                href='/dashboard/discount-codes'
                icon={
                    <TicketPercent size={22} color={getIconColor("/dashboard/discount-codes")} />
                }
                />

                 <SidebarItem
                isActive={activeSidebar === "/dashboard/logout"}
                title='Logout'
                href='/dashboard/logout'
                icon={
                    <LogOut size={22} color={getIconColor("/dashboard/logout")} />
                }
                />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
