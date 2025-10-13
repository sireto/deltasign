'use client';

import { motion } from 'framer-motion';
import CreateFolderCard from './components/create-folder-card';
import DocumentsTab from './components/documents-tab';
import PageAnimation from '@/shared/ui/page-animation';

export default function Page() {
  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl leading-[36px] font-[700]">
        All files
      </p>
      <CreateFolderCard />
      <DocumentsTab />
    </PageAnimation>
  );
}
