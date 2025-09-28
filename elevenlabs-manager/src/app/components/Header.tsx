'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ApiKeyManager from './ApiKeyManager';

const navigation = [
  { name: 'Agents', href: '/' },
  { name: 'Batch Calls', href: '/batch-calls' },
  { name: 'Statistics', href: '/statistics' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Agent Manager
          </h1>
          <nav className="ml-10 flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <ApiKeyManager />
      </div>
    </header>
  );
}