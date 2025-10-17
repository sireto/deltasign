'use client';


import { usePathname, useRouter } from 'next/navigation';
import { useGetDocumentByUUIDQuery, useGetDocumentsQuery } from '../api/documents';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheck,
  LoaderCircle,
  Mail,
} from 'lucide-react';
import NavBar from './components/nav-bar';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Select, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import dynamic from 'next/dynamic';

export default function Page() {
  const tools = [
    {
      label: 'Signature',
    },
    {
      label: 'Initials',
    },
    {
      label: 'Name',
    },
    {
      label: 'Number',
    },
    {
      label: 'Date',
      icon: Calendar,
    },
    {
      label: 'Email',
      icon: Mail,
    },
    { label: 'Radio', icon: Circle },
    { label: 'Checkbox', icon: CircleCheck },
    { label: 'Dropdown', icon: ChevronDown },
  ];

  const pathName = usePathname()

  const documentId = pathName.split('/')[2]

  const {data} = useGetDocumentByUUIDQuery({uuid : documentId});

  const PDFViewer = dynamic(() => import('./components/pdf-viewer'), {
    ssr: false,
  });

  return (
      data ? 
      <div>
        <NavBar className="sticky top-0" fileName={data.filename}/>
        <div className="flex h-full w-full justify-between p-3">
          <PDFViewer file={data?.s3_url || ""}/>
          <div className="border-midnight-gray-200 overflow-clip rounded-lg border-[1px]">
            <div className="bg-midnight-gray-50 flex items-center gap-4 px-5 py-4">
              <div>
                <p className="text-midnight-gray-900 text-lg font-[600]">
                  General Settings
                </p>
                <p className="text-midnight-gray-600 text-sm">
                  Configure general settings for the document.
                </p>
              </div>
              <ChevronUp size={16} />
            </div>
            <div className="border-midnight-gray-200 flex flex-col gap-3 border-t-[1px] border-b-[1px] bg-white p-4">
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
               <Input defaultValue={data.filename.replace('.pdf', '')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Language</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="english"></SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Document access</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="No restrictions"></SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Document visibility</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Everyone"></SelectValue>
                  </SelectTrigger>
                </Select>
              </div>
            </div>
            <div className="bg-midnight-gray-50 flex items-center gap-4 p-4">
              <div>
                <p className="text-midnight-gray-900 text-lg font-[600]">Tools</p>
                <p className="text-midnight-gray-600 text-sm">
                  Add all relevant fields for each recipent.
                </p>
              </div>
            </div>
            <div className="border-midnight-gray-200 grid grid-cols-2 gap-3 border-t-[1px] border-b-[1px] bg-white px-5 py-4">
              {tools.map((tool) => (
                <div key={tool.label}>
                  <Button
                    className="w-full gap-2 px-[10px] py-[20px]"
                    variant={'outline'}
                  >
                    {tool.icon && (
                      <tool.icon className="text-midnight-gray-600" />
                    )}
                    <span className="text-midnight-gray-600 text-md leading-5 font-[500]">
                      {tool.label}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
            <div className="h-12 bg-white" />
          </div>
        </div>
      </div>: 
      <div className='w-screen h-screen flex items-center justify-center'>
        <LoaderCircle className="animate-spin h-[50px] w-[50px]" />
      </div>)
}
