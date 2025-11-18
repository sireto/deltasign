import EmptyBox from "@/shared/icons/empty-box";
import { Card } from "@/shared/ui/card";

export default function EmptyBoxCard() {
  return (
    <Card className="flex flex-1 h-full w-full flex-col items-center justify-center gap-[10px]">
      <EmptyBox />
      <p className="text-midnight-gray-900 text-[20px] font-[600]">Empty Box</p>
      <p className="text-midnight-gray-600 text-center text-sm">
        You have not created or recieved any documents. To <br /> create a
        document , please upload a file.
      </p>
    </Card>
  );
}
