'use client';

import { motion } from 'framer-motion';
import CreateFolderCard from './components/create-folder-card';
import DocumentsTab from './components/documents-tab';
import PageAnimation from '@/shared/ui/page-animation';
import { useGetDocumentsQuery } from './api/documents';
import { useEffect } from 'react';
import { useGetContractsQuery } from './api/contracts';

export default function Page() {

  const {data : documents} = useGetDocumentsQuery();

  const {data : contracts} = useGetContractsQuery()

  useEffect(() => {
    console.log(documents);
  }, [documents]);

  useEffect(() => {
    console.log(contracts);
  }, [contracts]);

  return (
    <PageAnimation>
      <p className="text-midnight-gray-900 text-2xl leading-[36px] font-[700]">
        All files
      </p>
      <CreateFolderCard />
      <DocumentsTab contracts={contracts || []}/>
    </PageAnimation>
  );
}
