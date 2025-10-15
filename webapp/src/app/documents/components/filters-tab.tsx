import { SearchInput } from "@/shared/ui/search-input"
import { DropdownMenu , DropdownMenuItem , DropdownMenuTrigger , DropdownMenuContent } from "@/shared/ui/dropdown-menu"
import { Button } from "@/shared/ui/button"
import { Plus } from "lucide-react"

interface filter {
    label: string,
    icon: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>
}

export const FiltersTab = ({filters}: { filters : filter[]  } ) => {
    return (
         <div className="flex w-full items-center justify-between bg-white px-5 pt-4">
          <div className="flex w-full gap-2">
            <SearchInput className="w-[250px]" placeholder="Search" />
            {
              filters.map((filter , index) => (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger>
                    <span className="text-midnight-gray-900">{filter.label}</span>
                    <filter.icon  className="text-midnight-gray-900 w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Receiver</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))
            }
          </div>
          <div>
            <input
            //   ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
            />
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              <span>Upload Document</span>
            </Button>
          </div>
        </div>
    )
}