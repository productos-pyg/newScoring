// src/app/components/Navbar.jsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaTrophy } from "react-icons/fa6";
import { GiWhistle } from "react-icons/gi";
import { MdPublic, MdLogout } from "react-icons/md";
import useAuthStore from '@/store/authStore';

const Navbar = () => {
  const router = useRouter();
  const { role, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className='w-full h-[7vh] text-[#1097d5] p-2 shadow-md flex justify-between'>
      <Image src="/pygma.png" width={120} height={120} alt="logo"/>
      <div className='flex gap-4 items-center'>
        {/* Mostrar enlaces según el rol */}
        {role === 'admin' && (
          <Link 
            href="/torneos" 
            className='flex flex-col items-center'
          >
            <FaTrophy size={20} />
            <p className="font-semibold text-sm">Torneos</p>
          </Link>
        )}
        {(role === 'admin' || role === 'juez') && (
          <Link 
            href="/jueces" 
            className='flex flex-col items-center'
          >
            <GiWhistle size={20} />
            <p className="font-semibold text-sm">Jueces</p>
          </Link>
        )}
        <Link 
          href="/public" 
          className='flex flex-col items-center'
        >
          <MdPublic size={20} />
          <p className="font-semibold text-sm">Público</p>
        </Link>
        {role && (
          <button
            onClick={handleLogout}
            className='flex flex-col items-center text-red-500 hover:text-red-600'
          >
            <MdLogout size={20} />
            <p className="font-semibold text-sm">Salir</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;